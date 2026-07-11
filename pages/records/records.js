const storage = require('../../utils/storage');

Page({
  data: {
    records: []
  },

  onShow() {
    const records = storage.getRecords().sort((a, b) => {
      if (b.endTime > a.endTime) return 1;
      if (b.endTime < a.endTime) return -1;
      return 0;
    });
    this.setData({ records });
  },

  onTapRecord(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?recordId=${id}`
    });
  }
});
