'use strict'
feather.replace();
const thisMonth = new Date().getMonth();
const year = new Date().getFullYear();
let targetMonth = (thisMonth < 9)? `0${thisMonth+1}` : `${thisMonth+1}`;
let lastMonth = (thisMonth < 10)? `0${thisMonth}` : `${thisMonth}`;
let lastYear = year;
let reportTitle = '本月渠道資料';

const searchString = window.document.location.search.replace('?', '');
const parsed_qs = parseQueryString(searchString);
if (parsed_qs.month) {
  targetMonth = parsed_qs.month;
  reportTitle = `${parsed_qs.month}月渠道資料`;
  let lastMonthProcess = Number(parsed_qs.month) - 1;
  lastMonth = (lastMonthProcess < 10)? `0${lastMonthProcess}` : lastMonthProcess;
  if (targetMonth == '01') {
    lastMonth = 12;
    lastYear = year -1;
  }
}

document.getElementById('reportTitle').innerText = reportTitle;

xhrGenerator(`/dataSource/channel-data${year}${targetMonth}.json`)
.then((data) => {
  let htmlStr = '';
  data.forEach((i) => {
    htmlStr += `
      <tr>
        <td>${i.accountingDate}</td>
        <td>${i.name}</td>
        <td>${commas(i.betAmount)}</td>
        <td>${commas(i.netWin)}</td>
        <td>${commas(i.revenue)}</td>
        <td>${commas(i.deposit)}</td>
        <td>${commas(i.newMember)}</td>
        <td>${commas(i.effectiveMember)}</td>
      </tr>
    `
  })
  document.getElementById('summary-table').innerHTML = htmlStr;
})
.catch(() => {
  let htmlStr = '<tr><td colspan="8" style="text-align: center;"> 尚無資料，請詢問系統管理員 </td></tr>';
  document.getElementById('summary-table').innerHTML = htmlStr;
})