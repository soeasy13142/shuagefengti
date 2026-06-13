Page({
  data: {
    show: false,
    heroTapped: false,
    netTools: [
      {
        id: 'subnet-calc',
        name: '子网计算器',
        icon: '🌐',
        available: true
      },
      {
        id: 'tcp-viz',
        name: 'TCP 动画机',
        icon: '🔗',
        available: true
      }
    ],
    utilTools: [
      {
        id: 'sort-viz',
        name: '排序可视化',
        icon: '📊',
        available: true
      },
      {
        id: 'vocab',
        name: '单词记忆',
        icon: '📖',
        available: false
      },
      {
        id: 'ds-viz',
        name: '数据结构',
        icon: '🌳',
        available: true
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
    if (id === 'dashboard') {
      wx.navigateTo({ url: '/pages/dashboard/dashboard' });
    } else if (id === 'quiz') {
      this.setData({ heroTapped: true });
      setTimeout(() => {
        this.setData({ heroTapped: false });
        wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
      }, 350);
    } else if (id === 'sort-viz') {
      wx.navigateTo({ url: '/pages/sort-viz/sort-viz' });
    } else if (id === 'subnet-calc') {
      wx.navigateTo({ url: '/pages/subnet-calc/subnet-calc' });
    } else if (id === 'ds-viz') {
      wx.navigateTo({ url: '/pages/ds-viz/ds-viz' });
    } else if (id === 'tcp-viz') {
      wx.navigateTo({ url: '/pages/tcp-viz/tcp-viz' });
    }
  },

  goToRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goToWrongQuestions() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  }
});
