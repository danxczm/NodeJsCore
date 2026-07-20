const net = require('net');
const fs = require('node:fs/promises');
const path = require("path");

const socket = net.createConnection({ host: '::1', port: 5050 }, async () => {
  const filePath = process.argv[2];
  const fileName = path.basename(filePath)
  const header = `fileName: ${fileName}------`;

  const fileHandler = await fs.open(filePath, 'r');

  socket.write(header)

  const fileReadStream = fileHandler.createReadStream();

  fileReadStream.on('data', (chunk) => {
    if (!socket.write(chunk)) {
      fileReadStream.pause();
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