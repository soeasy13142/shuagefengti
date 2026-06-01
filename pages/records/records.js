const storage = require('../../utils/storage');

Page({
  data: {
    records: []
  },

  onShow() {
    const records = storage.getRecords().sort((a, b) => {
      return b.endTime > a.endTime ? 1 : -1;
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
