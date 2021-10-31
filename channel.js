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

Array.prototype.groupBy = function(prop) {
  return this.reduce(function(groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
};

let setSumDataInit = () => {
  return {
    betAmount: 0,
    netWin: 0,
    revenue: 0,
    deposit: 0,
    newMember: 0,
    effectiveMember: 0,
  };
}

var app = new Vue({
  el: '#summary-table',
  data: {
    list: [],
    listSource: [],
    listSourceGroupByName: {},
    minDate: '',
    maxDate: '',
    filters: {
      startDate: '',
      endDate: '',
      channelName: '',
    },
    sum: setSumDataInit(),
  },
  mounted() {
    xhrGenerator(`/dataSource/channel-data${year}${targetMonth}.json`)
    .then((data) => {
      this.list = data.sort(function(a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        // names must be equal
        return 0;
      });;
      this.listSource = this.list;
      this.processSumData();
      // 設定 filter
      this.minDate = data[0].accountingDate;
      this.filters.startDate = data[0].accountingDate;
      this.maxDate = data[data.length -1].accountingDate;
      this.filters.endDate = data[data.length -1].accountingDate;
      this.listSourceGroupByName = data.groupBy('name');
    })
    .catch(() => {
      this.list = [];
      this.listSource = [];
    })
  },
  methods: {
    processData() {
      let results = this.filters.channelName ? this.listSourceGroupByName[this.filters.channelName].slice() : this.listSource.slice();
      this.list = results.filter((item) => {
        if (item.accountingDate >= this.filters.startDate && item.accountingDate <= this.filters.endDate) return item;
      })
      this.processSumData();
    },
    processSumData() {
      let result = setSumDataInit();
      this.list.forEach(element => {
        result.betAmount += element.betAmount;
        result.netWin += element.netWin;
        result.revenue += element.revenue;
        result.deposit += element.deposit;
        result.newMember += element.newMember;
        result.effectiveMember += element.effectiveMember;
      });
      this.sum = result;
    }
  },
  watch: {
    filters: {
      handler: function(n) {
        this.processData();
      },
      deep: true,
    }
  }
})

