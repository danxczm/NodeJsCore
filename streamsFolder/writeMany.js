const fs = require("fs/promises");
const { once } = require("events");

const cycle = 500000000;

(async () => {
  console.time("cycleTime");

  const fileHandle = await fs.open("text.txt", "w");
  const stream = fileHandle.createWriteStream();

  try {
    for (let i = 0; i <= cycle; i++) {
      const canWrite = stream.write(` ${i} `);

      if (!canWrite) {
        await once(stream, "drain");
      }
    }

    stream.end();
    await once(stream, "finish");
  } catch (err) {
    console.error(err);
  } finally {
    console.timeEnd("cycleTime");
  }
})();
