const fs = require('fs');
const path = require('path');
const Big = require('big.js');
const format = require("date-fns/format");

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

module.exports = {
  process: (targetDate) => {
    return new Promise((resolve, reject) => {

      const targetYearMonth = `${format(targetDate, "yyyyMM")}`;
      const summaryDirRes = fs.readdirSync(path.resolve('dataSource', targetYearMonth, 'summary'), 'utf8');
  
      let total = {
        registerCount: new Big(0),
        depositCount: new Big(0),
        totalDeposit: new Big(0),
        totalWithdraw: new Big(0),
        totalBetAmount: new Big(0),
        totalNetWin: new Big(0),
        totalRevenue: new Big(0),
        totalPromotionAmount: new Big(0),
      }
      
      let strRes = '{"summary":[';
      
      summaryDirRes.forEach((i, index) => {
        const date_day_name = i.replace('.json', '');
        const abc = fs.readFileSync(path.resolve('dataSource', targetYearMonth, 'summary', i), 'utf-8');
        const temp = JSON.parse(abc);
        const date_monthArr = targetYearMonth.split('');
        const newabc = Object.assign(temp, {
          "date_mmdd": `${date_monthArr[4]}${date_monthArr[5]}-${date_day_name}`,
          "totalDeposit_p": commas(new Big(temp.totalDeposit).toFixed(2)),
          "totalWithdraw_p": commas(new Big(temp.totalWithdraw).toFixed(2)),
          "totalBetAmount_p": commas(new Big(temp.totalBetAmount).toFixed(2)),
          "totalNetWin_p": commas(new Big(temp.totalNetWin).toFixed(2)),
          "totalRevenue_p": commas(new Big(temp.totalRevenue).toFixed(2)),
          "totalPromotionAmount_p": commas(new Big(temp.totalPromotionAmount).toFixed(2)),
        })
        total.registerCount = total.registerCount.plus(temp.registerCount);
        total.depositCount = total.depositCount.plus(temp.depositCount);
        total.totalDeposit = total.totalDeposit.plus(temp.totalDeposit);
        total.totalWithdraw = total.totalWithdraw.plus(temp.totalWithdraw);
        total.totalBetAmount = total.totalBetAmount.plus(temp.totalBetAmount);
        total.totalNetWin = total.totalNetWin.plus(temp.totalNetWin);
        total.totalRevenue = total.totalRevenue.plus(temp.totalRevenue);
        total.totalPromotionAmount = total.totalPromotionAmount.plus(temp.totalPromotionAmount);
        strRes = strRes += `${JSON.stringify(newabc)}`;
        if(summaryDirRes.length-index>1) strRes+=',';
      })
      total = Object.assign(total, {
        registerCount: commas(total.registerCount),
        depositCount: commas(total.depositCount),
        totalDeposit: commas(total.totalDeposit.toFixed(2).toString()),
        totalWithdraw: commas(total.totalWithdraw.toFixed(2).toString()),
        totalBetAmount: commas(total.totalBetAmount.toFixed(2).toString()),
        totalNetWin: commas(total.totalNetWin.toFixed(2).toString()),
        totalRevenue: commas(total.totalRevenue.toFixed(2).toString()),
        totalPromotionAmount: commas(total.totalPromotionAmount.toFixed(2).toString()),
      })
      
      strRes += `],"total":${JSON.stringify(total)}}`;
      
      fs.writeFile(path.resolve('dataSource', `summary-${targetYearMonth}.json`), strRes, (error) => {console.error(error)});
      resolve();
    })
  }
};

