const path = require("path");
const fs = require("fs");
const { authenticator } = require("otplib");
const axios = require("./axios");
const {
  baseURL,
  reportURL,
  username,
  password,
  otpkey,
} = require(path.resolve("config.js"));

const checkOrLogin = () => {
  return new Promise((resolve, reject) => {
    const { token, refreshToken } = require(path.resolve("authToken.js"));
    console.log(`token: ${token}, refreshToken: ${refreshToken}`);
    axios
      .get(`${baseURL}/${reportURL.checkLogin}`, {
        headers: {
          authorization: token,
          refreshtoken: refreshToken,
        },
      })
      .then(() => {
        console.log("check login status.");
        resolve({ token, refreshToken });
      })
      .catch(() => {
        // 憑證過期 重新
        console.log("login.");
        axios
          .post(`${baseURL}/${reportURL.login}`, { username, password, sercet: "", verification: "" })
          .then(({ data: { user: { id } } }) => {
            const otpToken = authenticator.generate(otpkey);
            console.log(`id: ${id}, otpToken: ${otpToken}`);
            axios
              .post(`${baseURL}/${reportURL.twofa}`, {
                "operatorId": id,
                "otp": otpToken
              })
              .then(({ data: { token, refreshToken } }) => {
                fs.writeFile(
                  path.join("authToken.js"),
                  `module.exports = {\n  token: '${token}',\n  refreshToken: '${refreshToken}'\n}`,
                  (e) => {
                    if (e) {
                      console.error(stringify(e));
                    }
                  }
                );
                resolve({ token, refreshToken });
              })
              .catch((e) => {
                console.error(e)
              })
          })
          .catch((error) => {
            console.error(error);
            reject({ error, reqName: "login" });
          });
      });
  });
};

const createRequestInstance = () => {
  return new Promise((resolve) => {
    checkOrLogin().then(({ token, refreshToken }) => {
      const requestInstance = axios.create({
        baseURL,
        method: "post",
        headers: {
          "ocms-timezone": "+07:00",
          "ocms-currency": "THB",
          authorization: token,
          refreshtoken: refreshToken,
        },
      });
      requestInstance.interceptors.response.use(
        (res) => res.data,
        (e) => Promise.reject(e)
      );
      resolve(requestInstance);
    });
  });
};

module.exports = {
  checkOrLogin,
  createRequestInstance,
};
