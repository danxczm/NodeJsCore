const net = require('net');
const fs = require('node:fs/promises');
const path = require("path");

const socket = net.createConnection({ host: '::1', port: 5050 }, async () => {
  const filePath = process.argv[2];
  const fileName = path.basename(filePath)
  const header = `fileName: ${fileName}------`;

  const fileHandler = await fs.open(filePath, 'r');

  const fileSize = (await fileHandler.stat()).size;

  let uploadedPercentage = 0;
  let bytesUploaded = 0;

  socket.write(header)

  const fileReadStream = fileHandler.createReadStream();

  fileReadStream.on('data', async (chunk) => {
    if (!socket.write(chunk)) {
      fileReadStream.pause();
    }

    bytesUploaded += chunk.length;
    let newPercentage = Math.floor((bytesUploaded / fileSize) * 100);

    if ( newPercentage !== uploadedPercentage) {
      uploadedPercentage = newPercentage
      await moveCursor(0, -1);
      await clearLine(0);
      console.log(`Uploading ${fileName} - progress: ${uploadedPercentage}%`)
    }
  });

  socket.on('drain', () => {
    fileReadStream.resume()
  })

  fileReadStream.on('end', async () => {
    console.log("the file is uploaded");
    await fileHandler.close();
    socket.end();
  })
});

const moveCursor = (dx, dy) => {
  return new Promise((resolve) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

const clearLine = (dir) => {
  return new Promise((resolve) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};