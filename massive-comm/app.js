const { spawn } = require("node:child_process");
const fs = require("node:fs");

const numberFormatter = spawn("node", [
  "./numberFormatter.js",
  "dest.txt",
  "$",
  ",",
]);

numberFormatter.stdout.on("data", (data) => {
  console.log(`⬆️ stdout data: ${data}`);
});

numberFormatter.stderr.on("data", (data) => {
  console.log(`🛑 stderr data: ${data}`);
});

numberFormatter.on("close", (code) => {
  if (code === 0) {
    console.log(
      `code:${code}: The file was read, processed and written successfully!`,
    );
  } else {
    console.log(`code:${code}: Something bad happened!`);
  }
});

const fileReadHandler = fs.createReadStream("./source.txt");

fileReadHandler.pipe(numberFormatter.stdin);
