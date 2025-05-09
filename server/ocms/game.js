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
        endTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
        startTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
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
    }).catch((e) => {
      console.log(`gameType1-${dirName}${fileName}`); console.error(JSON.parse(e))
    });;
  });
};

const gameProviderReq = (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    return requestInstance({
      url: reportURL.game,
      data: {
        agentId: 4,
        endTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
        startTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
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
    }).catch((e) => {
      console.log(`gameType2-${dirName}${fileName}`); console.error(JSON.parse(e))
    });;
  });
};

module.exports = {
  gameTypeReq,
  gameProviderReq,
};
