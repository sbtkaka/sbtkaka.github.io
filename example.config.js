const baseUrl = '';

const loginData = {
  username: '',
  password: '',
};

const apiUrl = {
  login: `${baseUrl}/operator/auth/login`,
  reportSummary: `${baseUrl}/v2/report/overallReport/summary`,
  reportGame: `${baseUrl}/v2/report/overallReport/game`,
  activeMembers: `${baseUrl}/v2/report/overallReport/daily/activeMembers`
}

const db = {
  client: 'mysql',
  connection: {
    host : 'localhost',
    user : 'root',
    password : '',
    database : '7_0_0_ocms_v2'
  }
};

module.exports = {
  loginData,
  apiUrl,
  db,
}