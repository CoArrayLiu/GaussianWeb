// fileService.js (前端)

// 上传文件到服务器
export async function uploadFileToServer(file, endpoint) {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("文件上传失败");
    }
  
    return response.json();
  }
  
  // 将提取的视频帧上传到服务器
  export async function saveFramesToServer(frames, endpoint) {
    if (frames.length === 0) {
      throw new Error("没有帧可供上传");
    }
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const frameBlob = await fetch(frame).then((res) => res.blob());
  
      const formData = new FormData();
      formData.append("file", frameBlob, `frame_${i}.png`);
  
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`第 ${i + 1} 帧上传失败`);
        }
      } catch (error) {
        console.error(`第 ${i + 1} 帧上传失败:`, error);
        throw error; // 如果上传失败，抛出错误并停止后续上传
      }
    }
  }
  
  // // 生成点云文件
  // export async function generatePointCloud(framesEndpoint, outputEndpoint) {
  //   const response = await fetch(outputEndpoint, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ framesDirectory: framesEndpoint }),
  //   });
  
  //   if (!response.ok) {
  //     throw new Error("点云文件生成失败");
  //   }
  
  //   return response.json();
  // }
  