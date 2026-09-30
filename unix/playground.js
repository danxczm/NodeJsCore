const { stdin, stdout, stderr } = require("node:process");

stdin.on("data", (data) => {
  stdout.write("This data comes from stdrin:" + " " + data.toString() + "\n");
});

stdout.write("This is from stdrout!");
stderr.write("This is from stdrerr!");
