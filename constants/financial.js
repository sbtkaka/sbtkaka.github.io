module.exports = {
  transfer: {
    type: {
      // MemberAccTransferType
      ENTER_THE_GAME: 1, //進入遊戲
      GAME_TRANSFER: 2, //遊戲轉帳
      MANUAL_DEPOSIT: 3, //手工存款
      WITHDRAW: 4, //提款
      CASHIER_DEPOSIT: 5, //用戶上分 現金櫃
      CASHIER_WITHDRAW: 6, //用戶下分 現金櫃
      PROMOTION_WALLET: 7, //活動錢包
      PROMOTION_BONUS: 7, //優惠贈金
      PROMOTION_BONUS_KEY: '7|-1', //優惠贈金
      WASH_CODE_DISCOUNT: 8,//洗碼優惠
      ONLINE_PAYMENT: 10, //在線存款
      ONLINE_REPLENISHMENT_ORDER: 11, //在線補單
      AGENT_SHARE_MEMBER_DEPOSIT:12,// 占成代理會員上分
      AGENT_SHARE_MEMBER_WITHDRAW:13,// 占成代理會員下分
      ONLINE_DEPOSIT: 14, //用戶上分 現金網
      ONLINE_WITHDRAW: 15, //用戶下分 現金網
      SYSTEM_TRANSFER: 16, //系統轉帳
      WITHDRAW_POINT: 17, //消點
      DEPOSIT_POINT: 18, //補點
      PROMOTION_RESUME: 19,// 贈金回收
      SYSTEM_RESUME: 20, // 系統回收
      PROMOTION_DEPOSIT_POINT: 21, //活動贈點
      PROMOTION_WITHDRAW_POINT: 22, //活動消點
      PROMOTION_TRANSFER: 23, //活動錢包轉帳
      OTHER_DEPOSIT: 24, //其他入鈔
      OTHER_WITHDRAW: 25, //其他退鈔
      AUTO_CASHIN: 26, //自動上分
      AUTO_CASHOUT: 28, //自動下分
      AGENT_CREDIT_ADD: 101, // 代理增加額度
      AGENT_CREDIT_SUBTRACT: 102, // 代理減少額度
      BILLING_CASHIN: 27, //鈔機上分
    },
  },
}