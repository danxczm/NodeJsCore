const { Transform } = require("node:stream");
const fs = require("node:fs/promises");

class Decrypt extends Transform {
  _transform(chunk, _, callback) {
    for (let i = 0; i < chunk.length; ++i) {
      if (chunk !== 255) chunk[i] = chunk[i] - 1;
    }
    callback(null, chunk);
  }
}

(async () => {
  const readFileHandler = await fs.open("encrypted.txt", "r");
  const writeFileHandler = await fs.open("decrypt.txt", "w");

  const readStream = readFileHandler.createReadStream();
  const writeStream = writeFileHandler.createWriteStream();

  const decrypt = new Decrypt();

  readStream.pipe(decrypt).pipe(writeStream);
})();
