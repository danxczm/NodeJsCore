const fs = require("fs/promises");

(async () => {
  const fileHandlerRead = await fs.open("text.txt");
  const fileHandlerWrite = await fs.open("copiedData.txt", "w");

  const streamRead = fileHandlerRead.createReadStream();
  const streamWrite = fileHandlerWrite.createWriteStream();

  let pop;

  streamRead.on("data", (chunk) => {
    const numbers = chunk.toString("utf-8").split("  ");

    if (
      Number(numbers[numbers.length - 2]) + 1 !==
      Number(numbers[numbers.length - 1])
    ) {
      pop = numbers.pop();
    }

    if (Number(numbers[0]) + 1 !== Number(numbers[1])) {
      numbers[0] = pop + numbers[0];
    }

    numbers.forEach((number) => {
      let n = Number(number);
      if (n % 2 === 0) {
        if (!streamWrite.write(" " + n + " ")) {
          streamRead.pause();
        }
      }
    });
  });

  streamWrite.on("drain", () => {
    streamRead.resume();
  });
})();
