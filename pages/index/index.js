Page({
  data: {
    features: [
      {
        id: 'quiz',
        name: '刷题',
        desc: '导入试题，一题一题刷',
        icon: '📝',
        available: true
      },
      {
        id: 'sort-viz',
        name: '排序可视化',
        desc: '排序算法动画演示',
        icon: '📊',
        available: false
      },
      {
        id: 'vocab',
        name: '单词记忆',
        desc: '高效记忆英语单词',
        icon: '📖',
        available: false
      }
    ]
  },

  onFeatureTap(e) {
    const { id, available } = e.currentTarget.dataset;
    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    if (id === 'quiz') {
      wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
    }
  }
});
