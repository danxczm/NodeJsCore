const Butter = require("../butter.js");
const server = new Butter();

const PORT = 9090;

server.route("get", "/", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});

server.route("get", "/index.css", (req, res) => {
  res.sendFile("./public/index.css", "text/css");
});

server.route("get", "/index.js", (req, res) => {
  res.sendFile("./public/index.js", "text/javascript");
});

server.route("post", "/login", (req, res) => {
  res.status(400).json({ message: "Bad login info." });
});

server.listen(PORT, () => {
  console.log(`Server is on port ${PORT}`);
});
