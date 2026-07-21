const storage = require('../../utils/storage');

Page({
  data: {
    records: [],
    loading: true
  },

  onShow() {
    this.setData({ loading: true });
    storage.getRecordsAsync().then(data => {
      const records = data.sort((a, b) => {
        if (b.endTime > a.endTime) return 1;
        if (b.endTime < a.endTime) return -1;
        return 0;
      });
      this.setData({ records, loading: false });
    });
  },

  onTapRecord(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?recordId=${id}`
    });
  }
});
