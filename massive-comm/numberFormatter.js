const { stdin, stdout, stderr } = require("node:process");

console.log(process.argv);

stdin.on("data", (data) => {
  console.log("hey there I am numberFormatter", data.toString());
});

stdin.on("end", () => {
  console.log("I have proceed with all the data");
});
