const net = require('net');
const fs = require('node:fs/promises');

const server = net.createServer();

server.on('connection', (socket) => {
  console.log("New conection");
  let fileHandler, fileWriteStream;

  socket.on('data', async (chunk) => {
     if (!fileHandler) {
      socket.pause()
      const indexOfHeadersEnd = chunk.indexOf('------');
      const header = chunk.subarray(10, indexOfHeadersEnd).toString();

      fileHandler = await fs.open(`storage/${header}`, 'w');
      fileWriteStream = fileHandler.createWriteStream();
      fileWriteStream.write(chunk.subarray(indexOfHeadersEnd, 6));

      socket.resume(); // resume receiving data from the client
      fileWriteStream.on('drain', () => socket.resume());
     } else {
      if (!fileWriteStream.write(chunk)) socket.pause();
     }
  });


  socket.on('end', () => {
    fileHandle.close();
    fileHandle = undefined;
    fileWriteStream = undefined;
    console.log("Connection ended!");
  });
});

server.listen(5050, '::1', () => {
  console.log("The server is started", server.address())
})