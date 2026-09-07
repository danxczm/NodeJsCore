const Butter = require("../butter");
const DB = require("./db");

const PORT = 8050;

const server = new Butter();

server.beforeEach((req, res, next) => {
  const routesToAuthenticate = [
    "GET /api/user",
    "PUT /api/user",
    "POST /api/posts",
    "DELETE /api/logout",
  ];

  if (routesToAuthenticate.includes(req.method + " " + req.url)) {
    if (req.headers?.cookie) {
      const token = req.headers.cookie?.split("=")[1];
      const session = DB.SESSION.find((session) => session.token === token);

      if (session) {
        req.userId = session.userId;
        return next();
      }
    }

    return res.status(401).json({ error: "Unauthorised" });
  } else {
    next();
  }
});

server.beforeEach((req, res, next) => {
  if (req.headers["content-type"] === "application/json") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      req.body = JSON.parse(body);
      return next();
    });
  } else {
    next();
  }
});

server.beforeEach((req, res, next) => {
  const routes = ["/", "/login", "/profile", "/new-post"];

  if (routes.includes(req.url) && req.method === "GET") {
    return res.status(200).sendFile("./public/index.html", "text/html");
  }

  next();
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
  const user = DB.USERS.find(({ id }) => id === req.userId);
  res.status(200).json({ name: user.name, username: user.username });
});

server.route("post", "/api/login", (req, res) => {
  const user = DB.USERS.find(({ username }) => username === req.body.username);

  if (user && user.password === req.body.password) {
    const token = Math.floor(Math.random() * 10000000).toString();
    DB.SESSION.push({ userId: user.id, token });

    res.setHeader("Set-Cookie", `token=${token}; Path=/;`);
    res.status(200).json({ message: "You are succesfully logged in!" });
  } else {
    res.status(401).json({ error: "Email or password is not valid!" });
  }
});

server.route("delete", "/api/logout", (req, res) => {
  // Remove the session object form the SESSIONS array
  const sessionIndex = SESSIONS.findIndex(
    (session) => session.userId === req.userId,
  );

  if (sessionIndex > -1) {
    SESSIONS.splice(index, 1);
  }

  res.setHeader(
    "Set-Cookie",
    "token=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  );
  res.status(200).json({ message: "Logged out successfully!" });
});

server.route("put", "/api/user", (req, res) => {
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;

  const user = DB.USERS.find((user) => user.id === req.userId);

  user.username = username;
  user.name = name;

  if (password) {
    user.password = password;
  }
  res.status(200).json({
    username: user.username,
    name: user.name,
    password_status: password ? "updated" : "not updated",
  });
});

server.route("post", "/api/posts", (req, res) => {
  const post = {
    id: DB.POSTS.length + 1,
    title: req.body.title,
    body: req.body.body,
    userId: req.userId,
  };

  DB.POSTS.unshift(post);

  res.status(201).json(post);
});

server.listen(PORT, () => {
  console.log(`Server started on port - ${PORT}`);
});
