const xhrGenerator = (url) => {
  return new Promise((resolve, reject) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.send();
    xhttp.onreadystatechange = function fianlly() {
      let responseText;
      try {
        responseText = (this.readyState == 4 && this.response) ? JSON.parse(this.response) : '';
      } catch (e) {
        console.error(e)
      }
      if (this.readyState == 4 && this.status == 200) {
        resolve(responseText);
      }
      if (this.readyState == 4 && this.status !== 200) {
        reject(responseText);
      }
    }
  })
}

const commas = function (value) {
  let aIntNum = value.toString().split('.');
  let iIntPart = aIntNum[0];
  let iFlootPart = aIntNum.length > 1 ? `.${aIntNum[1]}` : '';
  const rgx = /(\d+)(\d{3})/;

  if (iIntPart.length >= 4) {
    while (rgx.test(iIntPart)) { iIntPart = iIntPart.replace(rgx, `$1,$2`); }
  }

  return iIntPart + iFlootPart;
}

const parseQueryString = function(query) {
  const vars = query.split("&");
  let queryString = {};
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (typeof queryString[pair[0]] === "undefined") {
      queryString[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof queryString[pair[0]] === "string") {
      let arr = [queryString[pair[0]], decodeURIComponent(pair[1])];
      queryString[pair[0]] = arr;
    } else {
      queryString[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return queryString;
}