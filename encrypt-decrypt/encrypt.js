const { Transform } = require("node:stream");
const fs = require("node:fs/promises");

class Encrypt extends Transform {
  constructor(totalSize, options) {
    super(options);
    this.totalSize = totalSize; // Загальний розмір файлу
    this.processedSize = 0; // Скільки байтів уже оброблено
  }

  _transform(chunk, _, callback) {
    // 1. Шифруємо дані (ваш цикл)
    for (let i = 0; i < chunk.length; ++i) {
      chunk[i] = chunk[i] + 1;
    }

    // 2. Рахуємо прогрес
    this.processedSize += chunk.length;

    // Відсоток обробки (запобігаємо діленню на 0, якщо файл порожній)
    const percentage =
      this.totalSize > 0
        ? ((this.processedSize / this.totalSize) * 100).toFixed(2)
        : 100;

    // 3. Малюємо простий прогрес-бар у консолі
    // \r повертає каретку на початок рядка, щоб  перезаписати його
    process.stdout.write(
      `Прогрес шифрування: [${percentage}%] (${this.processedSize}/${this.totalSize} байт)\r`,
    );

    this.push(chunk);
    callback();
  }

  _flush(callback) {
    // Викликається автоматично, коли стрім закінчив роботу
    console.log("\nШифрування успішно завершено! 🎉");
    callback();
  }
}

(async () => {
  const readFileHandler = await fs.open("text.txt", "r");
  const writeFileHandler = await fs.open("encrypted.txt", "w");

  // Отримуємо метадані файлу і його розмір
  const stats = await readFileHandler.stat();
  const totalSize = stats.size;

  const readStream = readFileHandler.createReadStream();
  const writeStream = writeFileHandler.createWriteStream();

  // Передаємо розмір файлу в наш клас
  const encrypt = new Encrypt(totalSize);

  readStream.pipe(encrypt).pipe(writeStream);
})();
