const http = require("node:http");
const fs = require("node:fs/promises");

class Butter {
  constructor() {
    this.server = http.createServer();
    this.routes = {};

    this.server.on("request", (req, res) => {
      res.sendFile = async (path, mime) => {
        const fileHandler = await fs.open(path, "r");
        const fileStream = fileHandler.createReadStream();

        res.setHeader("Content-Type", mime);
        fileStream.pipe(res);
      };

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };

      res.json = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };

      if (!this.routes[req.method.toLowerCase() + req.url]) {
        return res
          .status(404)
          .json({ message: `Cant ${req.method.toLowerCase()} for ${req.url}` });
      }

      this.routes[req.method.toLowerCase() + req.url](req, res);
    });
  }

  route(method, path, cb) {
    this.routes[method + path] = cb;
  }

  listen(port, cb) {
    this.server.listen(port, () => {
      cb();
    });
  }
}

module.exports = Butter;
