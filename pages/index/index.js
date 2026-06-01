Page({
  data: {
    show: false,
    heroTapped: false,
    features: [
      {
        id: 'sort-viz',
        name: '排序可视化',
        icon: '📊',
        gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        available: true
      },
      {
        id: 'vocab',
        name: '单词记忆',
        icon: '📖',
        gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
        available: false
      }
    ]
  },

  onShow() {
    // 页面重新显示时重置动画状态（从答题页返回时恢复卡片）
    this.setData({ heroTapped: false });
  },

  onReady() {
    setTimeout(() => {
      this.setData({ show: true });
    }, 100);
  },

  onFeatureTap(e) {
    const { id, available } = e.currentTarget.dataset;
    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    if (id === 'quiz') {
      this.setData({ heroTapped: true });
      setTimeout(() => {
        this.setData({ heroTapped: false });
        wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
      }, 350);
    } else if (id === 'sort-viz') {
      wx.navigateTo({ url: '/pages/sort-viz/sort-viz' });
    }
  },

  goToRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goToWrongQuestions() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  }
});
