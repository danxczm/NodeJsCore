const fs = require("node:fs/promises");

const util = {};

util.deleteFolder = async (path) => {
  try {
    await fs.rm(path, { recursive: true });
  } catch {
    // do nothing
  }
};

util.deleteFile = async (path) => {
  try {
    await fs.unlink(path);
  } catch {
    //do nothing
  }
};

module.exports = util;
