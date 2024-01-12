const path = require('path');
const format = require("date-fns/format");
const updateDailyReport = require(path.resolve("server", "updateDailyReport"));
const { process } = require("./server/updateDailyReport/process");

let targetDate = new Date(2024,0,11);

updateDailyReport(format(targetDate, 'yyyy-MM-dd'))
.then(() => {
  process(targetDate)
})