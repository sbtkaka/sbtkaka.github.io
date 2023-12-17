const path = require("path");
const {
  activeMembersReq,
  summary,
  gameTypeReq,
  gameProviderReq,
} = require(path.resolve("server", "ocms", "index.js"));
const { createRequestInstance } = require(path.resolve(
  "server",
  "util",
  "checkOrLogin"
));
const { checkDirExistAndCreate } = require("./checkDirExistAndCreate");

const startOfDay = require("date-fns/startOfDay");
const startOfYesterday = require("date-fns/startOfYesterday");

const updateDailyReport = async (specificDate) => {
  const requestInstance = await createRequestInstance();
  let targetDate;
  if (/(20)\d{2}-\d{2}-\d{2}/.test(specificDate)) {
    let numArr = specificDate.split("-").map((i) => Number(i));
    let targetday = new Date(numArr[0], numArr[1] - 1, numArr[2]); // 記得月份要 -1
    targetDate = startOfDay(targetday);
  } else {
    targetDate = startOfYesterday(new Date());
  }

  return checkDirExistAndCreate(targetDate).then(() => {
    Promise.all([
      summary(requestInstance, targetDate),
      activeMembersReq(requestInstance, targetDate),
      gameTypeReq(requestInstance, targetDate),
      gameProviderReq(requestInstance, targetDate),
    ]).then(() => {
      console.log('done');
    });
  });
};

module.exports = updateDailyReport;
