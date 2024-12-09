<template>
  <div class="media-editor">
    <h1>媒体编辑器</h1>

    <!-- 上传图片或视频 -->
    <div class="upload-section">
      <label for="media-upload">上传图片或视频：</label>
      <input
        id="media-upload"
        type="file"
        accept="image/*, video/*"
        @change="handleMediaUpload"
      />
    </div>

    <!-- 预览内容 -->
    <div v-if="mediaType === 'image'" class="media-preview">
      <h2>图片预览：</h2>
      <img :src="mediaSrc" alt="上传的图片" />
    </div>

    <div v-if="mediaType === 'video'" class="media-preview">
      <h2>视频预览：</h2>
      <video ref="videoPlayer" :src="mediaSrc" controls></video>

      <!-- 视频帧提取 -->
      <div class="frame-extraction">
        <button @click="extractFrames">提取视频帧</button>
        <p v-if="frames.length === 0">尚未提取任何帧。</p>
        <div v-else class="frame-gallery">
          <h3>提取的帧：</h3>
          <img
            v-for="(frame, index) in frames"
            :key="index"
            :src="frame"
            alt="提取的帧"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
//import { saveFramesToServer, generatePointCloud } from "@/services/fileService";
import { saveFramesToServer} from "@/services/fileService";
export default {
  data() {
    return {
      mediaFile: null,
      mediaSrc: null,
      mediaType: null,
      ffmpeg: null,
      frames: [],
    };
  },
  methods: {
    async loadFFmpeg() {
      if (!this.ffmpeg) {
        this.ffmpeg = createFFmpeg({ log: true });
        await this.ffmpeg.load();
      }
    },
    handleMediaUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.mediaFile = file;
      this.mediaSrc = URL.createObjectURL(file);
      this.mediaType = file.type.startsWith("image/") ? "image" : "video";
      this.frames = []; // 清空帧数据

      // 上传视频文件到服务器
      const formData = new FormData();
      formData.append("file", file); // 使用 "file" 作为字段名，与后端 multer 配置一致

      fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log("视频文件上传成功", data);
        })
        .catch(error => {
          console.error("视频文件上传失败", error);
        });
    },

    async extractFrames() {
      if (!this.mediaFile || this.mediaType !== "video") {
        alert("请上传视频文件！");
        return;
      }

      try {
        console.log("开始提取帧...");
        await this.loadFFmpeg();

        // 加载视频文件到虚拟文件系统
        this.ffmpeg.FS("writeFile", this.mediaFile.name, await fetchFile(this.mediaSrc));

        // 提取帧：每 0.5 秒一帧
        await this.ffmpeg.run(
          "-i",
          this.mediaFile.name,
          "-vf",
          "fps=2",
          "frame_%d.png"
        );

        // 获取提取的所有帧
        const frameFiles = this.ffmpeg.FS("readdir", "/").filter(file => file.startsWith("frame_"));
        console.log("提取的帧文件:", frameFiles);

        // 保存所有帧到本地并上传到服务器
        this.frames = [];
        for (const frameFile of frameFiles) {
          const frameData = this.ffmpeg.FS("readFile", frameFile);
          const frameBlob = new Blob([frameData.buffer], { type: "image/png" });

          const frameURL = URL.createObjectURL(frameBlob);
          this.frames.push(frameURL);

          
        }
        // 上传帧到服务器
        await saveFramesToServer(this.frames, "http://localhost:3000/upload-frame");

        // // 生成点云文件
        // await generatePointCloud("http://localhost:3000/frames", "http://localhost:3000/generate-point-cloud");

        alert("帧提取生成成功！");
      } catch (error) {
        console.error("帧提取生成失败：", error);
        alert("操作失败，请重试！");
      }
    },
  },
};
</script>
