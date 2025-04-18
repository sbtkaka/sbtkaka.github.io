const fs = require("fs");
const path = require("path");
const format = require("date-fns/format");
// setting
const { reportURL } = require(path.resolve("config.js"));

const summary = (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    requestInstance({
      url: reportURL.summary,
      data: {
        agentId: 4,
        endTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
        startTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
      },
    }).then(({ data }) => {
      let dirName = `${format(targetDate, "yyyyMM")}`;
      let fileName = `${format(targetDate, "dd")}`;
      fs.writeFile(
        path.resolve("dataSource", dirName, "summary", `${fileName}.json`),
        JSON.stringify(data),
        (error) => {
          console.log(`The summary file has been saved!`);
          if (error) reject(error);
          resolve();
        }
      );
    }).catch((e) => {
      console.log(`summary-${dirName}${fileName}`); console.error(JSON.parse(e))
    });
  });
};

module.exports = {
  summary,
};
