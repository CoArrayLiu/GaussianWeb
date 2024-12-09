const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors"); // 导入 CORS 中间件

const app = express();

// 启用 CORS，允许来自 http://localhost:8080 的请求
app.use(cors({
  origin: 'http://localhost:8080', // 允许的来源
}));

// 设置存储引擎，确保保存原始文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 设置上传文件的保存路径
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // 文件保存至 uploads 文件夹
  },
  filename: (req, file, cb) => {
    // 使用原始文件名
    cb(null, file.originalname);
  }
});

// 设置上传目录
const upload = multer({ storage: storage });

const uploadsDir = path.join(__dirname, "uploads");
const framesDir = path.join(__dirname, "frames");  

//const pointCloudFile = path.join(__dirname, "public", "model.ply");

// 确保文件夹存在
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

// 确保文件夹存在
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });
}

// 接收视频文件并保存到 uploads 文件夹
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("没有上传文件");
  }

  const destPath = path.join(__dirname, "uploads", file.originalname);
  console.log(`文件上传成功：${destPath}`);
  
  // 如果上传的是图片文件，还需要将其复制到 frames 文件夹
  if (file.mimetype.startsWith("image/")) {
    const frameDestPath = path.join(framesDir, file.originalname);
    fs.copyFileSync(file.path, frameDestPath); // 将文件复制到 frames 文件夹
    console.log(`图片文件已保存到 frames 文件夹：${frameDestPath}`);
  }

  res.json({ success: true, filePath: destPath });
});


// 接收帧并保存到本地
app.post("/upload-frame", upload.single("file"), (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).send("没有上传帧");
    }
  
    const destPath = path.join(framesDir, file.originalname);
    fs.renameSync(file.path, destPath);
  
    console.log(`保存帧到: ${destPath}`);
    res.json({ success: true, filePath: destPath });
  });
  

// // 生成点云文件
// app.post("/generate-point-cloud", express.json(), (req, res) => {
//   const { framesDirectory } = req.body;
//   const files = fs.readdirSync(framesDirectory).filter((file) => file.endsWith(".png"));

//   if (files.length === 0) {
//     return res.status(400).send("没有可用的帧生成点云");
//   }

//   const pointCloudContent = `ply\nformat ascii 1.0\nelement vertex ${files.length}\nproperty float x\nproperty float y\nproperty float z\nend_header\n`;
//   fs.writeFileSync(pointCloudFile, pointCloudContent);

//   res.json({ success: true, pointCloudPath: pointCloudFile });
// });
// 清空文件夹工具函数
function clearDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach(file => {
      const filePath = path.join(directory, file);
      fs.unlinkSync(filePath); // 删除文件
    });
    console.log(`已清空文件夹：${directory}`);
  }
}

// 监听进程退出事件
process.on("exit", () => {
  console.log("进程退出，开始清理文件夹...");
  clearDirectory(uploadsDir);
  clearDirectory(framesDir);
});

// 捕获 Ctrl+C 信号（SIGINT）
process.on("SIGINT", () => {
  console.log("收到 SIGINT 信号，退出进程...");
  process.exit();
});

// 捕获未捕获的异常（防止程序崩溃）
process.on("uncaughtException", (err) => {
  console.error("未捕获的异常:", err);
  process.exit(1);
});

// 启动服务器
app.use(express.static(path.join(__dirname, "public")));
app.listen(3000, () => {
  console.log("服务器运行在 http://localhost:3000");
});
