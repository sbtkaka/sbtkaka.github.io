const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const bigNumber = require('big.js');
const moment = require('moment');
const config = require('./prod.config');
const knex = require('knex')(config.db);

/*
  日期設定區域
*/

const today = new Date();
// let thisYear = 2021;
let thisYear = today.getFullYear();
// let date_month = 0; // 月份要 -1 別忘記 (五月要填4)
let date_month = today.getMonth();
// let date_days = [1,2];
let date_days = [today.getDate() - 1];

/*
  前置準備
*/
const reportTime = '00:00:00';
const constants = require(path.join(__dirname, 'constants'));
const dirName = date_month < 9 ? `${thisYear}0${date_month+1}` : `${thisYear}${date_month+1}`;
fs.access(path.resolve('dataSource', dirName), fs.constants.R_OK | fs.constants.W_OK, (err) => {
  if (err) {
    fs.mkdir(path.resolve('dataSource', dirName), () => {
      fs.mkdirSync(path.resolve('dataSource', dirName, 'summary'))
      fs.mkdirSync(path.resolve('dataSource', dirName, 'gameType1'))
      fs.mkdirSync(path.resolve('dataSource', dirName, 'gameType2'))
    })
  }
});

let summaryArr = date_days.map(
  async function (dd) {
    let fileName = dd < 10 ? `0${dd}` : `${dd}`;
    const dateStartTime = moment(new Date(thisYear, date_month, dd, 1).toJSON());
    const dateEndTime = moment(new Date(thisYear, date_month, dd, 1).toJSON());
    const accountingStart = moment(dateStartTime.format(`YYYY-MM-DD ${reportTime}`));
    const accountingEnd = moment(dateEndTime.format(`YYYY-MM-DD ${reportTime}`)).add(1, 'd').subtract(1, 's').endOf('second');
    const betWeen = [accountingStart.toDate(), accountingEnd.toDate()];
    return new Promise(async (resolve) => {
      const [{ registerCount }] = await knex
      .count({ registerCount: 0 })
      .from('Member')
      .where(function() {
        this.where('AgentId', '=', 4);
        this.whereBetween('AddTime', betWeen);
      })

      const [{ depositCount }] = await knex
        .count({ depositCount: 0 })
        .from('MemberAccTransfer')
        .where(function() {
          this.whereBetween('AddTime', betWeen)
          this.where('AgentCode', 'like', `4-`);
          this.whereIn('Type', [ 3, 5, 10, 14, 26 ]);
        })
      const [{
        totalDeposit,
        totalWithdraw
      }] = await knex
        .select(
          knex.raw('IFNULL(SUM(Deposit), 0) + IFNULL(SUM(HandDeposit), 0) + IFNULL(SUM(OnlineDeposit), 0) + IFNULL(SUM(AutoCashInDeposit), 0) totalDeposit'),
          knex.raw('IFNULL(SUM(Withdraw), 0) + IFNULL(SUM(OnlineWithdraw), 0) + IFNULL(SUM(AutoCashOutWithdraw), 0) totalWithdraw')
        )
      .from('SummaryMemberInfoDaily')
      .where(function() {
        this.whereBetween('AccountingDate', betWeen);
        this.where('AgentCode', 'like', `4-`);
      })

      const totalPromotionAmount = await _getPromotionSum(betWeen);

      // 營收 = 存款 - 提款
      const totalRevenue = new bigNumber(totalDeposit)
        .minus(new bigNumber(totalWithdraw));

      // 壓碼量
      // netwin
      // jackpot
      const [{
        totalBetAmount,
        totalNetWin,
        jackpot,
        jpContribution,
      }] = await knex
        .select(
          knex.raw('IFNULL(SUM(-NetWin), 0) totalNetWin'),
          knex.raw('IFNULL(SUM(BetAmount), 0) totalBetAmount'),
          knex.raw('IFNULL(SUM(JackPot), 0) jackpot'),
          knex.raw('IFNULL(SUM(JackpotContribute), 0) jpContribution'),
        )
        .from('SummaryMemberBetDaily')
        .where(function() {
          this.whereBetween('AccountingDate', betWeen);
          this.where('AgentCode', 'like', `4-`);
        })

      const summary = {
        registerCount: Number(registerCount),
        depositCount: Number(depositCount),
        totalDeposit: totalDeposit,
        totalWithdraw: totalWithdraw,
        totalBetAmount: totalBetAmount,
        totalNetWin: totalNetWin,
        totalRevenue: totalRevenue.toNumber().toFixed(2),
        jackpot: jackpot,
        jpContribution: jpContribution,
        totalPromotionAmount: totalPromotionAmount.toNumber().toFixed(2),
      };

      fs.writeFile(path.resolve('dataSource', dirName, 'summary', `${fileName}.json`), JSON.stringify(summary), (err) => {
        console.log(`The file summary/${dirName}/${fileName} has been saved!`);
        resolve();
      });
    })
  }
)
let gameDataArr = date_days.map(
  async function (dd) {
    let fileName = dd < 10 ? `0${dd}` : `${dd}`;
    const dateStartTime = moment(new Date(thisYear, date_month, dd, 1).toJSON());
    const dateEndTime = moment(new Date(thisYear, date_month, dd, 1).toJSON());
    const accountingStart = moment(dateStartTime.format(`YYYY-MM-DD ${reportTime}`));
    const accountingEnd = moment(dateEndTime.format(`YYYY-MM-DD ${reportTime}`)).add(1, 'd').subtract(1, 's').endOf('second');
    const betWeen = [accountingStart.toDate(), accountingEnd.toDate()];
    return new Promise(async (resolve) =>{
      const summaryMemberBetDailyByBrandAndGameKind = await knex
        .select({
          brand: 'SummaryMemberBetDaily.Brand',
          gameKindCode: 'SummaryMemberBetDaily.GameKindCode',
          gameKindId: 'PlatformGameKind.Id',
        })
        .select(
          knex.raw('IFNULL(SUM(-NetWin), 0) netWin'),
          knex.raw('IFNULL(SUM(-OwnNetWin), 0) ownNetWin'),
        )
        .countDistinct({ memberCount: 'SummaryMemberBetDaily.MemberId' })
        .sum({ txnCount: 'BettingCount' })
        .sum({ totalBets: 'BetAmount' })
        .sum({ jackpot: 'Jackpot' })
        .sum({ jpContribution: 'JackpotContribute' })
        .from('SummaryMemberBetDaily')
        .join('PlatformGameKind', 'PlatformGameKind.GameKindCode', 'SummaryMemberBetDaily.GameKindCode')
        .where(function() {
          this.whereBetween('AccountingDate', betWeen);
          this.where('AgentCode', 'like', `4-`);
        })
        .groupBy('SummaryMemberBetDaily.Brand')
        .groupBy('SummaryMemberBetDaily.GameKindCode')
        .groupBy('PlatformGameKind.Id');

      const doSum = dataArray => {
        return dataArray.reduce((ret, item) => ({
          memberCount: new bigNumber(ret.memberCount).plus(item.memberCount),
          txnCount: new bigNumber(ret.txnCount).plus(item.txnCount),
          totalBets: new bigNumber(ret.totalBets).plus(item.totalBets),
          netWin: new bigNumber(ret.netWin).plus(item.netWin),
          ownNetWin: new bigNumber(ret.ownNetWin).plus(item.ownNetWin),
          jackpot: new bigNumber(ret.jackpot).plus(item.jackpot),
          jpContribution: new bigNumber(ret.jpContribution).plus(item.jpContribution),
        }), {
          memberCount: 0,
          txnCount: 0,
          totalBets: 0,
          netWin: 0,
          ownNetWin: 0,
          jackpot: 0,
          jpContribution: 0,
        });
      };
      // by 遊戲品牌
      const dataGroupByBrand = _.groupBy(summaryMemberBetDailyByBrandAndGameKind, 'brand');
      const byBrandRecords = Object.keys(dataGroupByBrand)
        .map(brand => {
          const details = dataGroupByBrand[brand];

          return {
            brand,
            details,
            ...doSum(details),
          };
        });

      const byBrand = { records: byBrandRecords, sum: doSum(byBrandRecords)};

      // by 遊戲種類(GameKind)
      const dataGroupByGameKind = _.groupBy(summaryMemberBetDailyByBrandAndGameKind, 'gameKindId');
      const byGameKindRecords = Object.keys(dataGroupByGameKind)
        .map(gameKindId => {
          const details = dataGroupByGameKind[gameKindId];

          return {
            gameKindId,
            details,
            ...doSum(details),
          };
        });

      const byGameKind = { records: byGameKindRecords, sum: doSum(byGameKindRecords)};

      fs.writeFile(path.resolve('dataSource', dirName, 'gameType1', `${fileName}.json`), JSON.stringify(byBrand), (err) => {
        console.log(`The file gameType1/${dirName}/${fileName} has been saved!`);
        fs.writeFile(path.resolve('dataSource', dirName, 'gameType2', `${fileName}.json`), JSON.stringify(byGameKind), (err) => {
          console.log(`The file gameType2/${dirName}/${fileName} has been saved!`);
          resolve();
        });
      });
    })
  }
)

const createMonthData = async function() {
  return new Promise(async (resolve) => {
    const start = moment(new Date(thisYear, date_month, 1, 1).toJSON());
    const accountingStart = moment(start.format(`YYYY-MM-DD ${reportTime}`));
    const accountingEnd = moment(accountingStart).add(1, 'M').subtract(1, 's').endOf('second');
    const betWeen = [
      accountingStart.toDate(),
      accountingEnd.toDate(),
    ]
    const activeMemberCount = await knex
    .select({ accountingDate: 'AccountingDate' })
    .countDistinct({ activeCount: 'MemberId' })
    .from('SummaryMemberBetDaily')
    .where(function() {
      this.whereBetween('AccountingDate', betWeen);
      this.where('AgentCode', 'like', `4-%`);
    })
    .groupBy('AccountingDate');

    const depositMemberCount = await knex
      .select(
        { accountingDate: 'AccountingDate' },
      )
      .countDistinct({ depositCount: 'MemberId' })
      .from('SummaryMemberInfoDaily')
      .where(function() {
        this.whereBetween('AccountingDate', betWeen);
        this.where('AgentCode', 'like', `4-`);
        this.where(knex.raw('IFNULL(Deposit, 0) + IFNULL(HandDeposit, 0) + IFNULL(OnlineDeposit, 0) + IFNULL(AutoCashInDeposit, 0)'), '>', 0);
      })
      .groupBy('AccountingDate');

    const withdrawalMemberCount = await knex
      .select(
        { accountingDate: 'AccountingDate' },
      )
      .countDistinct({ withdrawalCount: 'MemberId' })
      .from('SummaryMemberInfoDaily')
      .where(function() {
        this.whereBetween('AccountingDate', betWeen);
        this.where('AgentCode', 'like', `4-`);
        this.where(knex.raw('IFNULL(Withdraw, 0) + IFNULL(OnlineWithdraw, 0) + IFNULL(AutoCashOutWithdraw, 0)'), '>', 0);
      })
      .groupBy('AccountingDate');

    const dailyActiveMemberMapByDateStr = _genMapByDateStr(activeMemberCount);
    const dailyDepositMapByDateStr = _genMapByDateStr(depositMemberCount);
    const dailyWithdrawalMapByDateStr = _genMapByDateStr(withdrawalMemberCount);

    const searchDateStrs = generateDateStrsInRange(accountingStart, accountingEnd)
    const results = searchDateStrs.map(accountingDate => {
      let activeCount = 0;
      let depositCount = 0;
      let withdrawalCount = 0;

      if (dailyActiveMemberMapByDateStr[accountingDate]) {
        ({ activeCount } = dailyActiveMemberMapByDateStr[accountingDate]);
      }
      if (dailyDepositMapByDateStr[accountingDate]) {
        ({ depositCount } = dailyDepositMapByDateStr[accountingDate]);
      }
      if (dailyWithdrawalMapByDateStr[accountingDate]) {
        ({ withdrawalCount } = dailyWithdrawalMapByDateStr[accountingDate]);
      }
      return {
        accountingDate,
        activeCount,
        depositCount,
        withdrawalCount,
      };
    });

    fs.writeFile(path.resolve('dataSource', `active-members${dirName}.json`), JSON.stringify(results), (err) => {
      console.log('The active-members file has been saved!');
      resolve();
    });
  })
}

const generateDateStrsInRange = (start, end) => {
  const results = [];
  const s = moment(start);
  const e = moment(end);
  while(s.isSameOrBefore(e, 'd')) {
    results.push(s.format('YYYY-MM-DD'));
    s.add(1, 'd');
  }

  return results;
}

const _genMapByDateStr = (countAry, timeColumn = 'accountingDate') => {
  return _.keyBy(countAry, (val) => {
    return moment(val[timeColumn]).format('YYYY-MM-DD');
  });
}

const _getPromotionSum = async (betWeen) => {
  const [{ promotionAmountMemberAcc }] = await knex
  .select(
   knex.raw(
    `IFNULL(SUM(CASE WHEN Type = 7 THEN Money ELSE 0 END), 0)
      - IFNULL(SUM(CASE WHEN Type = 19 THEN Money ELSE 0 END), 0)
      promotionAmountMemberAcc`
    )
  )
  .from('MemberAccTransfer')
  .where(function() {
    this.where('AgentCode', 'like', `4-%`);
    this.whereIn('Type', [ constants.financial.transfer.type.PROMOTION_BONUS, constants.financial.transfer.type.PROMOTION_RESUME ]);
    this.whereBetween('SuccessTime', betWeen);
  })


  // 活動錢包的贈金總和 (扣掉贈金回收)
  // NOTE: 先使用 union all 處理，若未來統計太過複雜或麻煩，則新增 view 處理
  const [{ promotionAmountWallet }] = await knex
  .select(
    knex.raw(
      `IFNULL(SUM(CASE WHEN Type = 7 THEN Money ELSE 0 END), 0)
        - IFNULL(SUM(CASE WHEN Type = 19 THEN Money ELSE 0 END), 0)
       AS promotionAmountWallet
      `,
    )
  )
  .from(
    knex
    .select('Type', 'Money')
    .from('UV_PromotionWalletTrans')
    .where(function() {
      this.where('AgentId', '=', 4);
      this.whereBetween('SuccessTime', betWeen);
    })
    .unionAll(
      knex
      .select({
        Type: constants.financial.transfer.type.PROMOTION_WALLET,
        Money: 'Amount',
      })
      .from('PromotionGameRecord')
      .join('Member', 'Member.Id', 'PromotionGameRecord.MemberId')
      .where(function() {
        this.where('Member.AgentId', '=', 4);
        this.whereBetween('PromotionGameRecord.LastModifyTime', betWeen);
      })
      .where('PromotionGameRecord.ApiStatus', constants.promotion.bonusGame.apiStatus.NO_ERROR)
    )
    .as('p')
  );


  // 主錢包 & 活動錢包 贈金總和
  return new bigNumber(promotionAmountMemberAcc).plus(new bigNumber(promotionAmountWallet));
}

const getChannelSummaryData = async function () {
  const start = moment(new Date(thisYear, date_month, 1, 1).toJSON());
  const accountingStart = moment(start.format(`YYYY-MM-DD ${reportTime}`));
  const accountingEnd = moment(accountingStart).add(1, 'M').subtract(1, 's').endOf('second');
  const betWeen = [
    accountingStart.toDate(),
    accountingEnd.toDate(),
  ]

  return new Promise(async (resolve) => {
    const sqlStmt = knex
    .select({
      agentId: 'a.Id',
      channelId: 'c.Id',
      agentUsername: 'a.Name',
      agentNickName: 'a.NickName',
      channelCode: 'c.Code',
      username: 'c.Username',
      name: 'c.Name',
    })
    .from({ c: 'AgentChannel' })
    .join('Agent as a', 'a.Id', 'c.AgentId')
    .join('SummaryChannelDaily as s', 's.ChannelCode', 'c.Code')
    .where('c.Status', 1)
    .where('c.AgentId', 4)
    .whereBetween('s.AccountingDate', betWeen);

    sqlStmt
    .select({
      newMember: 's.NewMember',
      effectiveMember: 's.EffectiveMember',
      deposit: 's.Deposit',
      withdraw: 's.Withdraw',
      revenue: 's.Revenue',
      betAmount: 's.BetAmount',
      promotionAmount: 's.PromotionAmount',
      netWin: 's.NetWin',
      profitAmount: 's.ProfitAmount',
      accountingDate: 's.AccountingDate',
    });

    sqlStmt.orderBy('AccountingDate', 'asc');

    let resultSource =  await sqlStmt;
    let results = resultSource.map((i) => { return Object.assign(i, { accountingDate: moment(i.accountingDate).format('YYYY-MM-DD') }) });

    fs.writeFile(path.resolve('dataSource', `channel-data${dirName}.json`), JSON.stringify(results), (err) => {
      console.log('The channel-data file has been saved!');
      resolve();
    });

  })
};

Promise.all([createMonthData(), getChannelSummaryData()].concat(summaryArr, gameDataArr))
.then(() => {
  process.exit(1);
})