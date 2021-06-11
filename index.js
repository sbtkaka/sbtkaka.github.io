'use strict'
feather.replace()
// Graphs
const thisMonth = new Date().getMonth();
let targetMonth = (thisMonth < 9)? `0${thisMonth+1}` : `${thisMonth+1}`;
let chartTitle = '本月註冊 / 活躍人數';
let reportTitle = '本月壓碼量 / 營收 / 收益';
let myChart;

const searchString = window.document.location.search.replace('?', '');
const parsed_qs = parseQueryString(searchString);
if (parsed_qs.month) {
  chartTitle = `${parsed_qs.month}月註冊 / 活躍人數`;
  reportTitle = `${parsed_qs.month}月壓碼量 / 營收 / 收益`;
  targetMonth = parsed_qs.month;
}

document.getElementById('chartTitle').innerText = chartTitle;
document.getElementById('reportTitle').innerText = reportTitle;

xhrGenerator(`/dataSource/summary-${targetMonth}.json`)
.then(({ summary, total }) => {
  xhrGenerator(`/dataSource/active-members${targetMonth}.json`)
  .then((activeMemberDataArr) => {
    myChart = new Chart(document.getElementById('myChart'), {
      type: 'line',
      data: {
        labels: summary.map(i => i.date_mmdd.split('-')[1]),
        // labels: activeMemberDataArr.map(i => i.accountingDate.split('-')[2]),
        datasets: [
          {
            label: '活躍人數',
            data: activeMemberDataArr.map(i => i.activeCount),
            lineTension: 0,
            backgroundColor: 'transparent',
            borderColor: '#3080d0',
            borderWidth: 4,
            pointBackgroundColor: '#3080d0'
          },
          {
            label: '註冊人數',
            data: summary.map(i => i.registerCount),
            lineTension: 0,
            backgroundColor: 'transparent',
            borderColor: '#ff6384',
            borderWidth: 4,
            pointBackgroundColor: '#ff6384'
          },
          // {
          //   label: '存款次數',
          //   data: activeMemberDataArr.map(i => i.depositCount),
          //   lineTension: 0,
          //   backgroundColor: 'transparent',
          //   borderColor: '#f00',
          //   borderWidth: 4,
          //   pointBackgroundColor: '#f00'
          // },
          // {
          //   label: '提款次數',
          //   data: activeMemberDataArr.map(i => i.withdrawalCount),
          //   lineTension: 0,
          //   backgroundColor: 'transparent',
          //   borderColor: '#888',
          //   borderWidth: 4,
          //   pointBackgroundColor: '#888'
          // }
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            }
          }]
        },
      }
    })
  })
  let resultStr = '';
  summary.forEach(i => {
    let appendStr = `
      <tr>
        <td onclick="mdToggle('${i.date_mmdd}')">${i.date_mmdd}</td>
        <td>${i.totalBetAmount_p}</td>
    `;
    appendStr += (i.totalNetWin < 0) ? `<td class="table-danger">${i.totalNetWin_p}</td>` : `<td>${i.totalNetWin_p}</td>`;
    appendStr += (i.totalRevenue < 0) ? `<td class="table-warning">${i.totalRevenue_p}</td>` : `<td>${i.totalRevenue_p}</td>`;
    appendStr += `
        <td>${i.depositCount}</td>
        <td>${i.totalDeposit_p}</td>
      </tr>`;
    resultStr += appendStr;
  });
  
  resultStr = resultStr += `
    <tr>
      <td>加總</td>
      <td>${total.totalBetAmount}</td>
      <td class="table-info">${total.totalNetWin}</td>
      <td>${total.totalRevenue}</td>
      <td>${total.depositCount}</td>
      <td>${total.totalDeposit}</td>
    </tr>
  `;
  document.getElementById('summary_tbody').innerHTML = resultStr;
})

// 彈窗
window.gameDataDate = '';
const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'), { keyboard: false });
window.mdToggle = function(date_mmdd) {
  window.gameDataDate = date_mmdd;
  byGameKind(date_mmdd)
  .then(() => {
    myModal.toggle()
  })
};

// 遊戲報表相關
const gameKindProcess = function(gameKind) {
  switch (gameKind) {
    case '1':
      return '老虎機';
    case '2':
      return '虛擬賭桌遊戲';
    case '3':
      return '卡牌遊戲';
    case '4':
      return '真人視訊';
    case '6':
      return '街機';
    case '7':
      return '捕魚機';
    case '8':
      return '體育';
    case '10':
      return '百家樂';
    case '11':
      return 'AndarBahar';
    case '12':
      return '龍虎';
    case '13':
      return '輪盤';
    case '14':
      return '翻攤';
    case '15':
      return '骰寶';
    case '16':
      return '牛牛';
    case '18':
      return '21點';
    case '20':
      return '多台';
    case '21':
      return '街機-其它';
    case '23':
      return '撲克';
    case '25':
      return '幸運轉輪';
    case '30':
      return '彩票遊戲';
    case '34':
      return '推幣機';
    case '16':
      return '牛牛';
    case '30':
      return '彩票遊戲';
    case '32':
      return 'CockFight';
    default:
      return gameKind;
  }
}

window.byPlatform = function(date_mmdd) {
  let gameDataDate = date_mmdd || window.gameDataDate;
  let dateArr = gameDataDate.split('-');
  return xhrGenerator(`/dataSource/${dateArr[0]}/gameType1/${dateArr[1]}.json`)
  .then(({ records, sum }) => {
    let resultStr = `
    <table  class="table table-striped table-bordered">
    <thead>
      <tr>
        <th>品牌</th>
        <th>BetAmount</th>
        <th>NetWin</th>
      </tr>
    </thead>
    <tbody>
    `
    records.forEach(i => {
      let appendStr = `
      <tr>
        <td>${i.brand}</td>
        <td>${i.totalBets}</td>
      `;
      appendStr += (i.netWin < 0) ? `<td class="table-warning">${i.netWin}</td>` : `<td>${i.netWin}</td>`;
      appendStr += '</tr>';
      resultStr += appendStr;
    })
    resultStr += `
        <tr>
          <td></td>
          <td>${sum.totalBets}</td>
          <td>${sum.netWin}</td>
        </tr>
      </tbody>
    </table>
    `;
    document.getElementById('game-report-table').innerHTML = resultStr;
  })
  .catch(() => {
    document.getElementById('game-report-table').innerHTML = '<h3>無資料</h3>';
  })
}

window.byGameKind = function(date_mmdd) {
  let gameDataDate = date_mmdd || window.gameDataDate;
  let dateArr = gameDataDate.split('-');
  return xhrGenerator(`/dataSource/${dateArr[0]}/gameType2/${dateArr[1]}.json`)
  .then(({ records, sum }) => {
    let resultStr = `
    <table  class="table table-striped table-bordered">
    <thead>
      <tr>
        <th>類型</th>
        <th>BetAmount</th>
        <th>NetWin</th>
      </tr>
    </thead>
    <tbody>
    `
    records.forEach(i => {
      let appendStr = `
      <tr>
        <td>${gameKindProcess(i.gameKindId)}</td>
        <td>${i.totalBets}</td>
      `;
      appendStr += (i.netWin < 0) ? `<td class="table-warning">${i.netWin}</td>` : `<td>${i.netWin}</td>`;
      appendStr += '</tr>';
      resultStr += appendStr;
    })
    resultStr += `
        <tr>
          <td></td>
          <td>${sum.totalBets}</td>
          <td>${sum.netWin}</td>
        </tr>
      </tbody>
    </table>
    `;
    document.getElementById('game-report-table').innerHTML = resultStr;
  })
  .catch(() => {
    document.getElementById('game-report-table').innerHTML = '<h3>無資料</h3>';
  })
};

