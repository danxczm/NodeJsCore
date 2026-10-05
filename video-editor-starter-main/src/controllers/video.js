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

const controller = {
  uploadVideo,
};

module.exports = controller;
