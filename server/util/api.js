const axios = require("axios");

axios.interceptors.response.use(
  (res) => res.data,
  (e) => {
    console.error(e?.header)
    return Promise.reject(e)
  }
);

module.exports = axios;
