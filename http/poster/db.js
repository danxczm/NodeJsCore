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

const SESSION = [];

module.exports = { USERS, POSTS, SESSION };
