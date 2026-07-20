const net = require("net");
const readline = require("node:readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let id;

const socket = net.createConnection(
  { port: 3008, host: "127.0.0.1" },
  async () => {
    const ask = async () => {
      const message = await rl.question("Message => ");

      await moveCursor(0, -1);
      await clearLine(0);

      socket.write(`${id}-message-${message}`);
    };

    ask();

    socket.on("data", async (data) => {
      console.log();

      await moveCursor(0, -1);
      await clearLine(0);

      if (data.toString().substring(0, 2) === "id") {
        id = data.toString().substring(3);

        console.log(`Your id is ${id}`);
      } else {
        console.log(data.toString("utf8"));
      }

      ask();
    });
  },
);

const moveCursor = (dx, dy) => {
  return new Promise((resolve) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

const clearLine = (dir) => {
  return new Promise((resolve) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};

socket.on("end", () => {
  console.log("The connection is lost");
});
