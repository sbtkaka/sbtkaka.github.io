const path = require("path");
const fs = require("fs");
const startOfMonth = require("date-fns/startOfMonth");
const format = require("date-fns/format");
// setting
const { reportURL } = require(path.resolve("config.js"));

const activeMembersReq = (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    requestInstance({
      url: reportURL.activeMembers,
      data: {
        agentId: 4,
        startTime: startOfMonth(targetDate).toISOString(),
      },
    }).then(({ data }) => {
      let fileName = `${format(targetDate, "yyyyMM")}`;
      fs.writeFile(
        path.resolve("dataSource", `active-members${fileName}.json`),
        JSON.stringify(data),
        (error) => {
          if (error) reject(error);
          resolve();
        }
      );
    });
  });
};

module.exports = {
  activeMembersReq,
};
