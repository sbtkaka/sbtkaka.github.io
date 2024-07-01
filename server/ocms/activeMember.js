const path = require("path");
const fs = require("fs");
const startOfMonth = require("date-fns/startOfMonth");
const format = require("date-fns/format");
// setting
const { reportURL } = require(path.resolve("config.js"));

const activeMembersReq = (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    requestInstance({
      url: reportURL.monthlySummary,
      data: {
        agentId: 4,
        startTime: startOfMonth(targetDate).toISOString(),
      },
    }).then(({ data }) => {
      let fileName = `${format(targetDate, "yyyyMM")}`;
      fs.writeFile(
        path.resolve("dataSource", `active-members${fileName}.json`),
        JSON.stringify(data.dailyStats),
        (error) => {
          if (error) reject(error);
          resolve();
        }
      );
    }).catch((e) => {
      console.log(`active-members${fileName}`); console.error(JSON.parse(e))
    });;
  });
};

module.exports = {
  activeMembersReq,
};
