const fs = require("fs");
const path = require("path");
const format = require("date-fns/format");
// setting
const { reportURL } = require(path.resolve("config.js"));

const gameTypeReq = (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    return requestInstance({
      url: reportURL.game,
      data: {
        agentId: 4,
        endTime: targetDate.toISOString(),
        startTime: targetDate.toISOString(),
        type: 1, // by game type
      },
    }).then(({ data }) => {
      let dirName = `${format(targetDate, "yyyyMM")}`;
      let fileName = `${format(targetDate, "dd")}`;
      fs.writeFile(
        path.resolve("dataSource", dirName, "gameType1", `${fileName}.json`),
        JSON.stringify(data),
        (error) => {
          if (error) reject(error);
          resolve();
        }
      );
    });
  });
};

const gameProviderReq = (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    return requestInstance({
      url: reportURL.game,
      data: {
        agentId: 4,
        endTime: targetDate.toISOString(),
        startTime: targetDate.toISOString(),
        type: 2, // by game provider
      },
    }).then(({ data }) => {
      let dirName = `${format(targetDate, "yyyyMM")}`;
      let fileName = `${format(targetDate, "dd")}`;
      fs.writeFile(
        path.resolve("dataSource", dirName, "gameType2", `${fileName}.json`),
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
  gameTypeReq,
  gameProviderReq,
};
