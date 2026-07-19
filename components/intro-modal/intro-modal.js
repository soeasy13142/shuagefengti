// components/intro-modal/intro-modal.js
Component({
  properties: {
    show: { type: Boolean, value: false, observer: '_onShowChange' },
    introContent: { type: String, value: '' }
  },

  data: {
    animReady: false
  },

  methods: {
    onMaskTap() {
      this._close();
    },

    onClose() {
      this._close();
    },

    onEnter() {
      this._close();
    },

    _close() {
      this.setData({ show: false, animReady: false });
      this.triggerEvent('close');
    },

    _onShowChange(show) {
      if (show) {
        wx.nextTick(() => {
          this.setData({ animReady: true });
        });
      } else {
        this.setData({ animReady: false });
      }
    }
  }
});
