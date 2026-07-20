const fs = require("fs/promises");

(async () => {
  const fileReadHandler = await fs.open("text.txt", "r");
  const fileDestHandler = await fs.open("dest.txt", "w");

  let bytesRead = -1;

  while (bytesRead !== 0) {
    const readSrc = await fileReadHandler.read();
    bytesRead = readSrc.bytesRead;

    if (bytesRead !== 16384) {
      const firstIndexOnNull = readSrc.buffer.indexOf(0);
      console.log("firstIndexOnNull", firstIndexOnNull);
      const newBuffer = Buffer.alloc(firstIndexOnNull);
      readSrc.buffer.copy(newBuffer, 0, 0, firstIndexOnNull);
      await fileDestHandler.write(newBuffer);
    } else {
      await fileDestHandler.write(readSrc.buffer);
    }
  }
})();
