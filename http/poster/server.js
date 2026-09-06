const Butter = require("../butter");
const DB = require("./db");

const PORT = 8050;

const server = new Butter();

server.route("get", "/", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});

server.route("get", "/profile", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});

server.route("get", "/styles.css", (req, res) => {
  res.sendFile("./public/styles.css", "text/css");
});

server.route("get", "/scripts.js", (req, res) => {
  res.sendFile("./public/scripts.js", "text/javascript");
});

server.route("get", "/api/posts", (req, res) => {
  const posts = DB.POSTS.map((post) => {
    const user = DB.USERS.find(({ id }) => id === post.userId);
    post.author = user.name;
    return post;
  });

  res.status(200).json(posts);
});

server.route("get", "/api/user", (req, res) => {
  const token = req.headers.cookie.split("=")[1];

  const session = DB.SESSION.find((session) => session.token === token);

  if (session) {
    const user = DB.USERS.find(({ id }) => id === session.userId);

    res.status(200).json({ name: user.name, username: user.username });
  } else {
    res.status(401).json({ error: "Unauthorised" });
  }
});

server.route("post", "/api/login", (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    body = JSON.parse(body);
    const user = DB.USERS.find(({ username }) => username === body.username);

    if (user && user.password === body.password) {
      const token = Math.floor(Math.random() * 10000000).toString();
      DB.SESSION.push({ userId: user.id, token });

      res.setHeader("Set-Cookie", `token=${token}; Path=/;`);
      res.status(200).json({ message: "You are succesfully logged in!" });
    } else {
      res.status(401).json({ error: "Email or password is not valid!" });
    }
  });
});

server.route("delete", "/api/logout", (req, res) => {});

server.route("put", "/api/user", (req, res) => {});

server.route("post", "/api/posts", (req, res) => {});

server.listen(PORT, () => {
  console.log(`Server started on port - ${PORT}`);
});
