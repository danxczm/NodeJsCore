const DB = require("../src/DB");
const FF = require("./ff");
const util = require("../lib/util");

class jobQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;
  }

  enqueue(job) {
    this.jobs.push(job);
    this.executeNext();
  }

  dequeue() {
    return this.jobs.shift();
  }

  executeNext() {
    if (this.currentJob) return;
    this.currentJob = this.dequeue();
    if (!this.currentJob) return;
    this.execute(this.currentJob);
  }

  async execute(job) {
    if (job.type === "resize") {
      const { videoId, width, height } = job;
      DB.update();
      const video = DB.videos.find((video) => video.videoId === videoId);

      const originalVideoPath = `./storage/${video.videoId}/origin.${video.extension}`;
      const targetVideoPath = `./storage/${video.videoId}/${width}x${height}.${video.extension}`;

      try {
        await FF.resizeVideo(originalVideoPath, targetVideoPath, width, height);
        DB.update();
        const video = DB.videos.find((video) => video.videoId === videoId);

        video.resizes[`${width}x${height}`].processing = false;
        DB.save();
      } catch (e) {
        util.deleteFile(targetVideoPath);
      }
    }

    this.currentJob = null;
    this.executeNext();
  }
}

module.exports = jobQueue;
