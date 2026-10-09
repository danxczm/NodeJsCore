const { spawn } = require("node:child_process");

const makeThumbnail = (filePath, thumbnailPath) => {
  // ffmpeg -i video.mp4 -ss 5 -vframes 1 thumbnail.jpg
  return new Promise((resolve, reject) => {
    const spawnThumbnail = spawn("ffmpeg", [
      "-i",
      filePath,
      "-ss",
      "5",
      "-vframes",
      "1",
      thumbnailPath,
    ]);

    spawnThumbnail.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    spawnThumbnail.on("error", (error) => {
      reject(error);
    });
  });
};

const getDimensions = (filePath) => {
  // ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 video.mp4
  return new Promise((resolve, reject) => {
    const spawnDimension = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0",
      filePath,
    ]);

    let dimensions = "";

    spawnDimension.stdout.on("data", (data) => {
      dimensions += data.toString();
    });

    spawnDimension.stderr.on("data", (data) => {
      console.log(`🛑 stderr data: ${data}`);
    });

    spawnDimension.on("close", (code) => {
      if (code === 0) {
        const [width, height] = dimensions.trim().split(",");
        return resolve({
          width: Number(width),
          height: Number(height),
        });
      } else {
        return reject(new Error(`ffprobe exited with code ${code}`));
      }
    });

    spawnDimension.on("error", (error) => {
      reject(error);
    });
  });
};

const extractAudio = (originalVideoPath, targetAudioPath) => {
  return new Promise((resolve, reject) => {
    const spawnExtractAudio = spawn("ffmpeg", [
      "-i",
      originalVideoPath,
      "-vn",
      "-c:a",
      "copy",
      targetAudioPath,
    ]);

    spawnExtractAudio.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    spawnExtractAudio.on("error", (error) => {
      reject(error);
    });
  });
};

const resizeVideo = (originalVideoPath, targetVideoPath, width, height) => {
  return new Promise((resolve, reject) => {
    const spawnResizeVideo = spawn("ffmpeg", [
      "-i",
      originalVideoPath,
      "-vf",
      `scale=${width}x${height}`,
      "-c:a",
      "copy",
      targetVideoPath,
    ]);

    spawnResizeVideo.stderr.on("data", (d) => console.log(`${d}`));

    spawnResizeVideo.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject("FFmpeg existed with this code");
      }
    });

    spawnResizeVideo.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = {
  makeThumbnail,
  getDimensions,
  extractAudio,
  resizeVideo,
};
