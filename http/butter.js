const http = require("node:http");
const fs = require("node:fs/promises");

class Butter {
  constructor() {
    this.server = http.createServer();
    this.routes = {};
    this.middleware = [];

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

      // this.middleware[0](req, res, () => {
      //   this.middleware[1](req, res, () => {
      //     this.middleware[2](req, res, () => {
      //       this.routes[req.method.toLowerCase() + req.url](req, res);
      //     });
      //   });
      // });
      //

      const runMiddleware = (req, res, middleware, index) => {
        if (middleware.length === index) {
          if (!this.routes[req.method.toLowerCase() + req.url]) {
            return res.status(404).json({
              message: `Cant ${req.method.toLowerCase()} for ${req.url}`,
            });
          }

          this.routes[req.method.toLowerCase() + req.url](req, res);
        } else {
          middleware[index](req, res, () => {
            runMiddleware(req, res, middleware, index + 1);
          });
        }
      };

      runMiddleware(req, res, this.middleware, 0);
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

  beforeEach(cb) {
    this.middleware.push(cb);
  }
}

module.exports = Butter;
