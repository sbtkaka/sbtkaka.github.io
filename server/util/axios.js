const axios = require("axios");

axios.interceptors.response.use(
  (res) => res.data,
  (e) => Promise.reject(e)
);

module.exports = axios;
