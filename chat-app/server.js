const net = require("node:net");

const server = net.createServer();

const sockets = [];

server.listen(3008, "127.0.0.1", () => {
  console.log("The server is started!", server.address());
});

server.on("connection", (socket) => {
  const clientId = sockets.length + 1;
  console.log(`The client id ${clientId} is connected`);

  for (let socket of sockets) {
    socket.socket.write(`The client with an id-${clientId} is connected`);
  }

  sockets.push({ clientId, socket });

  socket.write(`id-${clientId}`);

  socket.on("data", (data) => {
    const toString = data.toString();
    const id = toString.substring(0, toString.indexOf("-"));
    const message = toString.substring(toString.indexOf("-message-") + 9);
    for (let { socket: client } of sockets) {
      client.write(`Client ${id} => ${message}`);
    }
  });

  socket.on("end", () => {
    for (let socket of sockets) {
      socket.socket.write(`The client with an id-${clientId} has left`);
    }
  });
});
