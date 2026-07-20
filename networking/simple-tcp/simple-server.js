const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log(data);
  });
});

server.listen(8888, "127.0.0.1", () => {
  console.log("The server is ALIVE!", server.address());
});
