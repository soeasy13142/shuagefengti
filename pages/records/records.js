const storage = require('../../utils/storage');

Page({
  data: {
    records: []
  },

  onShow() {
    const records = storage.getRecords().sort((a, b) => {
      return new Date(b.endTime) - new Date(a.endTime);
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
