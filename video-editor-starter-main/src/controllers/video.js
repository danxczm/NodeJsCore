const path = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const { pipeline } = require("node:stream/promises");
const util = require("../../lib/util");
const DB = require("../DB");
const FF = require("../../lib/ff");

const uploadVideo = async (req, res, handleErr) => {
  const fullFileName = req.headers.filename;
  const fileFormat = path.extname(fullFileName).substring(1).toLowerCase();
  const fileName = path.parse(fullFileName).name;
  const videoFolderId = crypto.randomBytes(4).toString("hex");

  try {
    await fs.mkdir(`./storage/${videoFolderId}`);
    const filePath = `./storage/${videoFolderId}/origin.${fileFormat}`;

    const fileHandler = await fs.open(filePath, "w");
    const fileStream = fileHandler.createWriteStream();

    await pipeline(req, fileStream);

    const thumbnailPath = `./storage/${videoFolderId}/thumbnail.jpg`;
    await FF.makeThumbnail(filePath, thumbnailPath);

    const dimensions = await FF.getDimensions(filePath);

    DB.update();
    DB.videos.unshift({
      id: DB.videos.length,
      videoId: videoFolderId,
      name: fileName,
      extension: fileFormat,
      dimensions,
      userId: req.userId,
      extractedAudio: false,
      resizes: {},
    });

    DB.save();

    res.status(201).json({
      status: "success",
      message: "The file was uploaded successfully!",
    });
  } catch (e) {
    util.deleteFolder(`./storage/${videoFolderId}`);
    if (e.code !== "ECONNRESET") return handleErr(e);
  }
};

const getVideos = (req, res, handleErr) => {
  DB.update();
  const videos = DB.videos.filter((video) => video.userId === req.userId);

  res.status(200).json(videos);
};

const getVideoAsset = async (req, res, handleErr) => {
  // /get-video-asset?videoId=254627b3&type=thumbnail

  const videoId = req.params.get("videoId");
  const fileType = req.params.get("type"); // thumbnail, audio, resize, original

  const video = DB.videos.find((video) => video.videoId === videoId);

  if (!video) return handleErr({ satus: "400", message: "Video not found!" });

  let file;
  let fileName; // final fileName.extension
  let mimeType;

  switch (fileType) {
    case "thumbnail":
      file = await fs.open(`./storage/${videoId}/thumbnail.jpg`, "r");
      mimeType = "image/jpeg";
      break;

    case "audio":
      file = await fs.open(`./storage/${videoId}/audio.aac`, "r");
      mimeType = "audio/aac";
      fileName = `${video.name}-audio.aac`;
      break;

    case "resize":
      const dimensions = req.params.get("dimensions");
      file = await fs.open(
        `./storage/${videoId}/${dimensions}.${video.extension}`,
        "r",
      );
      mimeType = "video/mp4";
      fileName = `${video.name}-${dimensions}.${video.extension}`;
      break;

    case "original":
      file = await fs.open(
        `./storage/${videoId}/origin.${video.extension}`,
        "r",
      );
      mimeType = "video/mp4"; //варто зробити мапу відповідностей форматів
      fileName = `${video.name}.${video.extension}`;
      break;
  }

  if (fileType !== "thumbnail") {
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  }

  try {
    const fileSize = await file.stat();
    const fileStream = file.createReadStream();

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", fileSize.size);

    res.status(200);

    await pipeline(fileStream, res);
  } catch (e) {
    return handleErr(e);
  } finally {
    file.close();
  }
};

const extractAudio = async (req, res, handleErr) => {
  const videoId = req.params.get("videoId");

  DB.update();
  const video = DB.videos.find((video) => video.videoId === videoId);

  if (video.extractedAudio) {
    return handleErr({
      status: 400,
      message: "The audio has already been extracted for this video.",
    });
  }

  try {
    const originalVideoPath = `./storage/${videoId}/origin.${video.extension}`;
    const targetAudioPath = `./storage/${videoId}/audio.aac`;

    await FF.extractAudio(originalVideoPath, targetAudioPath);
    video.extractedAudio = true;
    DB.save();

    res.status(200).json({
      status: "success",
      message: "The audio was extracted successfully!",
    });
  } catch (e) {
    util.deleteFile(targetAudioPath);
    return handleErr(e);
  }
};

const resizeVideo = (req, res, handleErr) => {};

const controller = {
  uploadVideo,
  getVideos,
  getVideoAsset,
  extractAudio,
};

module.exports = controller;
