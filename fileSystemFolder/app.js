const fs = require("fs/promises");

const CREATE_FILE = "create file";
const DELETE_FILE = "delete the file";
const RENAME_FILE = "rename the file";
const ADD_TO_FILE = "add to the file";

(async () => {
  const createFileFn = async (path) => {
    try {
      await fs.writeFile(path, `// new file called ${path}`, { flag: "wx" });
      console.log(`File with ${path} name created!✅`);
    } catch (err) {
      if (err.code === "EEXIST") {
        console.log(`File with ${path} name already exists!❌`);
      } else {
        throw err;
      }
    }
  };

  const deleteFileFn = async (path) => {
    try {
      await fs.unlink(path); // якщо це папка або > 1 файлу -> await fs.rm(path, { force: true }); або використати appendFile (щоб імперативно не відкривати файл)
      console.log(`The file called ${path} was successfully removed!✅`);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(`No such file called ${path} has been found ❌`);
      } else {
        console.log(err);
      }
    }
  };

  const renameFileFn = async (oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath); // -> також команда може перенести файл в іншу папку якщо при переіменуванні вказати до імені шлях/новеІмя
      console.log(`The file ${oldPath} is called ${newPath} now! ✅`);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(`No such file called ${path} has been found ❌`);
      } else {
        console.log(err);
      }
    }
  };

  const addToFileFn = async (path, content) => {
    try {
      await fs.writeFile(path, content, { flag: "r+" }); // в курсі він використовує .open(path, {flag: a // append})
      console.log(`The file ${path} has new content added: "${content}"! ✅`);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(`No such file called ${path} has been found ❌`);
      } else {
        console.log(err);
      }
    }
  };

  const fileHandler = await fs.open("./command.txt");
  const watcher = fs.watch("./command.txt");

  fileHandler.on("onChangeEvent", async () => {
    const sizeToAllocBuffer = (await fileHandler.stat()).size;
    const buffer = Buffer.alloc(sizeToAllocBuffer);

    await fileHandler.read(buffer, 0, buffer.byteLenght, 0);
    const commandFileText = buffer.toString();

    console.log(commandFileText);

    const defineFilePath = (pathName, to = pathName.length) =>
      commandFileText.substring(pathName, to);

    // create file
    // const CREATE_FILE = "create file";
    if (commandFileText.includes(CREATE_FILE)) {
      const filePath = defineFilePath(CREATE_FILE.length + 1);
      createFileFn(filePath);
    }

    // delete file
    // const DELETE_FILE = "delete the file";
    if (commandFileText.includes(DELETE_FILE)) {
      const filePath = defineFilePath(DELETE_FILE.length + 1);
      deleteFileFn(filePath);
    }

    // rename file
    // const RENAME_FILE = "rename the file";
    if (commandFileText.includes(RENAME_FILE)) {
      const _idx = commandFileText.indexOf(" to ");
      const oldFilePath = defineFilePath(RENAME_FILE.length + 1, _idx);
      const newFilePath = defineFilePath(_idx + 4);

      renameFileFn(oldFilePath, newFilePath);
    }

    // add content to file
    // const ADD_TO_FILE = "add to the file";
    if (commandFileText.includes(ADD_TO_FILE)) {
      const separator = " content data ";
      const _idx = commandFileText.indexOf(separator);
      const filePath = defineFilePath(ADD_TO_FILE.length + 1, _idx);
      const contentData = defineFilePath(_idx + separator.length);

      addToFileFn(filePath, contentData);
    }
  });

  for await (const event of watcher) {
    if (event.eventType !== "change") return;
    fileHandler.emit("onChangeEvent");
  }
})();
