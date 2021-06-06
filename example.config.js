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

module.exports = {
  loginData,
  apiUrl,
}