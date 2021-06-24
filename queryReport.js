const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {
  loginData,
  apiUrl
} = require('./prod.config')

const headersGenerator = function(authData={ token:"", refreshToken: "" }) {
  return {
    'accept': 'application/json; charset=utf-8',
    'content-type': 'application/json',
    'x-backend': 'ocms-ap',
    'x-backend-port': '8080',
    'Authorization': authData.token,
    'RefreshToken': authData.refreshToken,
  };
}

const loginOptions = {
  method: 'POST',
  headers: headersGenerator(),
  data: loginData,
  url: apiUrl.login,
};

const agentReportSummary = (authData, data) => {
  return {
    method: 'POST',
    headers: headersGenerator(authData),
    url: apiUrl.reportSummary,
    data,
  }
}

const agentReportGameType1 = (authData, data) => {
  return {
    method: 'POST',
    headers: headersGenerator(authData),
    url: apiUrl.reportGame,
    data: { ...data, type: 1 },
  }
}

const agentReportGameType2 = (authData, data) => {
  return {
    method: 'POST',
    headers: headersGenerator(authData),
    url: apiUrl.reportGame,
    data: { ...data, type: 2 },
  }
}

const activeMembers = (authData, data) => {
  return {
    method: 'POST',
    headers: headersGenerator(authData),
    url: apiUrl.activeMembers,
    data,
    // agentId
    // startTime
    // 此 API 為一次拉一個月 (startTime開始後一個月)
  }
}

axios(loginOptions)
.then(({ data: { data: authData }}) => {
  const today = new Date();
  const thisYear = today.getFullYear();
  // const date_month = 4; // 月份要 -1 別忘記 (五月要填4)
  const date_month = today.getMonth(); // 4;
  const date_days = [22,23];
  // const date_days = [today.getDate() - 1];
  const dirName = date_month < 9 ? `${thisYear}0${date_month+1}` : `${thisYear}${date_month+1}`;
  fs.access(path.resolve('dataSource', dirName), fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (err) {
      fs.mkdir(path.resolve('dataSource', dirName), () => {
        fs.mkdirSync(path.resolve('dataSource', dirName, 'summary'))
        fs.mkdirSync(path.resolve('dataSource', dirName, 'gameType1'))
        fs.mkdirSync(path.resolve('dataSource', dirName, 'gameType2'))
      })
    }
  });
  date_days.forEach(dd => {
    const DateStartTime = new Date(thisYear, date_month, dd, 1);
    const DateEndTime = new Date(thisYear, date_month, dd, 1);
    const postData = {
      startTime: DateStartTime.toJSON(),
      endTime: DateEndTime.toJSON(),
      agentId: 4,
    }
    let fileName = dd < 10 ? `0${dd}` : `${dd}`;
    axios(agentReportSummary(authData, postData))
    .then(({ data: { data }}) => {
      fs.writeFile(path.resolve('dataSource', dirName, 'summary', `${fileName}.json`), JSON.stringify(data), (err) => {
        console.log(`The file summary/${dirName}/${fileName} has been saved!`);
      });
    })
    axios(agentReportGameType1(authData, postData))
    .then(({ data: { data }}) => {
      fs.writeFile(path.resolve('dataSource', dirName, 'gameType1', `${fileName}.json`), JSON.stringify(data), (err) => {
        console.log(`The file gameType1/${dirName}/${fileName} has been saved!`);
      });
    })
    axios(agentReportGameType2(authData, postData))
    .then(({ data: { data }}) => {
      fs.writeFile(path.resolve('dataSource', dirName, 'gameType2', `${fileName}.json`), JSON.stringify(data), (err) => {
        console.log(`The file gameType2/${dirName}/${fileName} has been saved!`);
      });
    })
  })
  axios(activeMembers(authData,
    {
      startTime: new Date(thisYear, date_month, 1, 1).toJSON(), // 2021-01-01
      agentId: 4
    }
  ))
  .then(({ data: { data }}) => {
    fs.writeFile(path.resolve('dataSource', `active-members${dirName}.json`), JSON.stringify(data), (err) => {
      console.log('The active-members file has been saved!');
    });
  })
})
.catch((e) => {
  console.error(e)
  fs.writeFile(path.resolve('errorReport'), e, (err) => {
    // if (err) throw err;
    console.log('The error report file has been saved!');
  });
})

