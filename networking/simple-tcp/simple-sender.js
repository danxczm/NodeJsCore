const net = require("net");

const socket = net.createConnection({ host: "127.0.0.1", port: 8888 }, () => {
  const buffer = Buffer.alloc(8);
  buffer[0] = 1;
  buffer[1] = 2;
  socket.write(buffer);
});
