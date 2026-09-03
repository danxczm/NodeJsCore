const Butter = require("../butter");
const PORT = 8050;

const USERS = [
  { id: 1, name: "Liam Brown", username: "liam23", password: "string" },
  { id: 2, name: "Meredith Green", username: "merit.sky", password: "string" },
  { id: 3, name: "Ben Adams", username: "ben.poet", password: "string" },
];

const POSTS = [
  {
    id: 1,
    title: "This is a post title",
    body: "Lorem Ipsum is simply dummy text of the printing and typesetting",
    userId: 1,
  },
];

const server = new Butter();

server.route("get", "/", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});

server.route("get", "/styles.css", (req, res) => {
  res.sendFile("./public/styles.css", "text/css");
});

server.route("get", "/scripts.js", (req, res) => {
  res.sendFile("./public/scripts.js", "text/javascript");
});

server.route("get", "/api/posts", (req, res) => {
  const posts = POSTS.map((post) => {
    const user = USERS.find(({ id }) => id === post.userId);
    post.author = user.name;
    return post;
  });

  res.status(200).json(posts);
});

server.route("post", "/api/login", (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    body = JSON.parse(body);

    const user = USERS.find(({ username }) => username === body.username);

    if (user && user.password === body.password) {
      res.status(200).json({ message: "You are succesfully logged in!" });
    } else {
      res.status(401).json({ error: "Email or password is not valid!" });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port - ${PORT}`);
});
