require("dotenv").config();
const path = require("path");
const { exec } = require("child_process");
const CronJob = require("cron").CronJob;
const format = require("date-fns/format");
const updateDailyReport = require(path.resolve("server", "updateDailyReport"));

const job = new CronJob("0 0 2 * * *", () => updateDailyReport(), null, true);
const job2 = new CronJob(
  "0 0 3 * * *",
  () => {
    let now = new Date();
    console.log(`${format(now, "yyyy-MM-dd HH:mm:SS")}`);
    exec(
      `
      git pull
      git add dataSource
      git commit -m "${format(now, "yyyy MMdd")}"
      git push
    `,
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
      }
    );
  },
  null,
  true
);

job.start();
job2.start();
