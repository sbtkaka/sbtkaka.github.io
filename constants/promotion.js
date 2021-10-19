module.exports = {
  bonusGame: {
    apiStatus: {
      NO_ERROR: 0,
      INVALID_OPERATIONS: 503,
      NOT_SUPPORTED: 779,
    },
  },
  promotionInfoTag: {
    SYSTEM: 0,
    CUSTOM: 1,
    // TC 的定義
    VOUCHER_CODE: 1001,
  },
  promotionType: {
    BINDING: 1,
    NON_BINDING: 2, // 抽獎
    STREAM: 3,
  },
  probType: {
    EXPECTED: 1,
    CUSTOM: 2,
  },
};
