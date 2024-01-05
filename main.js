const path = require('path');
const { exec } = require("child_process");
const CronJob = require("cron").CronJob;
const format = require("date-fns/format");
const updateDailyReport = require(path.resolve("server", "updateDailyReport"));

updateDailyReport();
const job = new CronJob("0 0 6 * * *", updateDailyReport, null, true);
const job2 = new CronJob("0 0 7 * * *", () => {
  let now = new Date();
  exec(
    `
      git add dataSource
      git commit -m "${format(now, 'yyyy MMdd')}"
      git push
    `,
  (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }
  });
}, null, true)
job.start();
job2.start();
// updateDailyReport('2024-01-31');
// updateDailyReport('2024-01-30');
// updateDailyReport('2024-01-29');
// updateDailyReport('2024-01-28');
// updateDailyReport('2024-01-27');
// updateDailyReport('2024-01-26');
// updateDailyReport('2024-01-25');
// updateDailyReport('2024-01-24');
// updateDailyReport('2024-01-23');
// updateDailyReport('2024-01-22');
// updateDailyReport('2024-01-21');
// updateDailyReport('2024-01-20');
// updateDailyReport('2024-01-19');
// updateDailyReport('2024-01-18');
// updateDailyReport('2024-01-17');
// updateDailyReport('2024-01-16');
// updateDailyReport('2024-01-15');
// updateDailyReport('2024-01-14');
// updateDailyReport('2024-01-13');
// updateDailyReport('2024-01-12');
// updateDailyReport('2024-01-11');
// updateDailyReport('2024-01-10');
// updateDailyReport('2024-01-09');
// updateDailyReport('2024-01-08');
// updateDailyReport('2024-01-07');
// updateDailyReport('2024-01-06');
// updateDailyReport('2024-01-05');
// updateDailyReport('2024-01-04');
// updateDailyReport('2024-01-03');
// updateDailyReport('2024-01-02');
// updateDailyReport('2024-01-01');
