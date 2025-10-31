const path = require("path");
const fs = require("fs");
const startOfMonth = require("date-fns/startOfMonth");
const format = require("date-fns/format");

const summary = (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    let dirName = `${format(targetDate, "yyyyMM")}`;
    let fileName = `${format(targetDate, "dd")}`;
    requestInstance({
      url: "/v2/report/overallReport/summary",
      data: {
        agentId: Number(process.env.AGENT_ID),
        endTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
        startTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
      },
    })
      .then(({ data }) => {
        fs.writeFile(
          path.resolve("dataSource", dirName, "summary", `${fileName}.json`),
          JSON.stringify(data),
          (error) => {
            console.log(`The summary file has been saved!`);
            if (error) reject(error);
            resolve();
          }
        );
      })
      .catch((e) => {
        console.log(`summary-${dirName}${fileName}`);
        console.error(JSON.parse(e));
      });
  });
};

const activeMembersReq = (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    requestInstance({
      url: "v2/report/overallReport/monthlySummary",
      data: {
        agentId: Number(process.env.AGENT_ID),
        startTime: format(startOfMonth(targetDate), "yyyy-MM-dd HH:mm:ss.sss"),
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
    });
  });
};

const gameReqGeneratorEnum = {
  BY_GAME_TYPE: 1,
  BY_GAME_PROVIDER: 2,
};

const gameReqGenerator = (type) => (requestInstance, targetDate) => {
  return new Promise((resolve, reject) => {
    let dirName = `${format(targetDate, "yyyyMM")}`;
    let fileName = `${format(targetDate, "dd")}`;
    return requestInstance({
      url: "v2/report/overallReport/game",
      data: {
        agentId: Number(process.env.AGENT_ID),
        endTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
        startTime: format(targetDate, "yyyy-MM-dd HH:mm:ss.sss"),
        type, // by game type
      },
    })
      .then(({ data }) => {
        fs.writeFile(
          path.resolve(
            "dataSource",
            dirName,
            `gameType${type}`,
            `${fileName}.json`
          ),
          JSON.stringify(data),
          (error) => {
            if (error) reject(error);
            resolve();
          }
        );
      })
      .catch((e) => {
        console.log(`gameType${type}-${dirName}${fileName}`);
        console.error(JSON.parse(e));
      });
  });
};

module.exports = {
  activeMembersReq,
  gameTypeReq: gameReqGenerator(gameReqGeneratorEnum.BY_GAME_TYPE),
  gameProviderReq: gameReqGenerator(gameReqGeneratorEnum.BY_GAME_PROVIDER),
  summary,
};
