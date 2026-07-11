Page({
  data: {
    paperName: '',
    mode: '',
    accuracy: 0,
    correctCount: 0,
    total: 0,
    duration: 0,
    recordId: '',
    durationText: ''
  },

  onLoad(options) {
    if (!options || !options.data) {
      wx.showToast({ title: '结果数据缺失', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    let resultData;
    try {
      resultData = JSON.parse(decodeURIComponent(options.data));
    } catch (e) {
      wx.showToast({ title: '结果数据解析失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    const minutes = Math.floor(resultData.duration / 60);
    const seconds = resultData.duration % 60;
    this.setData({
      ...resultData,
      durationText: minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`
    });
  },

  onReviewWrong() {
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?recordId=${this.data.recordId}`
    });
  },

  onGoHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  }
});
