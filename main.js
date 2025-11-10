require("dotenv").config();
const path = require("path");
const CronJob = require("cron").CronJob;
const updateDailyReport = require(path.resolve("server", "updateDailyReport"));
const gitcommit = require("./gitcommit.js");

const job = new CronJob("0 0 2 * * *", () => updateDailyReport(), null, true);
const job2 = new CronJob("0 0 3 * * *", () => gitcommit(), null, true);

job.start();
job2.start();
