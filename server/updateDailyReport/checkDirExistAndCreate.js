const fs = require("fs");
const path = require("path");
const format = require("date-fns/format");

const checkDirExistAndCreate = (targetDate) => {
  return new Promise((resolve) => {
    const dirName = `${format(targetDate, "yyyyMM")}`;
    fs.access(
      path.resolve("dataSource", dirName),
      fs.constants.R_OK | fs.constants.W_OK,
      (err) => {
        if (err) {
          fs.mkdir(path.resolve("dataSource", dirName), () => {
            fs.mkdirSync(path.resolve("dataSource", dirName, "summary"));
            fs.mkdirSync(path.resolve("dataSource", dirName, "gameType1"));
            fs.mkdirSync(path.resolve("dataSource", dirName, "gameType2"));
            console.log(`mkdir: ${dirName} done.`);
            resolve();
          });
        } else {
          resolve();
        }
      }
    );
  });
};

module.exports = {
  checkDirExistAndCreate,
};
