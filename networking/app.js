const http = require("http");
const port = 4080;
// const host = loopback || Maschine IP = connect another device
const server = http.createServer((req, res) => {
  const data = { message: "Hi there!" };
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Connection", "close");
  res.statusCode = 200;
  res.end(JSON.stringify(data));
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
