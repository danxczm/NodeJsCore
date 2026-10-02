const path = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const { pipeline } = require("node:stream/promises");
const util = require("../../lib/util");
const DB = require("../DB");

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

    DB.update();
    DB.videos.unshift({
      id: DB.videos.length,
      videoId: videoFolderId,
      name: fileName,
      extension: fileFormat,
      userId: req.userId,
      extractedAudio: false,
      resizes: {},
    });

    DB.save();

    res.status(200).json({
      status: "success",
      message: "The file was uploaded successfully!",
    });

    await pipeline(req, fileStream);
  } catch (e) {
    util.deleteFolder(`./storage/${videoFolderId}`);
    if (e.code !== "ECONNRESET") return handleErr(e);
  }

  // нужно будет обработать ошибку под случай если пользователь сделает кенсел
  //
  // 1 получить название фолдера
  // 2 создать фолдер
  // 3 нужно также сформировать путь папка + название файла
  // 4 открить фолдер для чтения w - и создать пайплайн в него (пайплайн для хендлинга ерора)
  // 5 обновить ДБ создать запись
  // имея ошибку от пользователя про отмену загрузки удалить фалй
};

const controller = {
  uploadVideo,
};

module.exports = controller;
