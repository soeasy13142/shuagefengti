// components/intro-modal/intro-modal.js
Component({
  properties: {
    show: { type: Boolean, value: false, observer: '_onShowChange' },
    introContent: { type: Array, value: [] }
  },

  data: {
    animReady: false,
    currentStep: 0,
    slideClass: '',
    totalSteps: 0
  },

  methods: {
    noop() {},

    onMaskTap() {
      this._close();
    },

    onClose() {
      this._close();
    },

    onPrev() {
      if (this.data.currentStep <= 0) return;
      this._goToStep(this.data.currentStep - 1, 'slide-in-left');
    },

    onNext() {
      const next = this.data.currentStep + 1;
      if (next >= this.data.totalSteps) {
        // Last step — close
        this._close();
        return;
      }
      this._goToStep(next, 'slide-in-right');
    },

    _goToStep(step, direction) {
      this.setData({ slideClass: direction });
      const timer = setTimeout(() => {
        this.setData({ currentStep: step, slideClass: '' });
        clearTimeout(timer);
      }, 50);
    },

    _close() {
      this.setData({ show: false, animReady: false, currentStep: 0, slideClass: '' });
      this.triggerEvent('close');
    },

    _onShowChange(show) {
      if (show) {
        this.setData({ currentStep: 0, slideClass: '', totalSteps: (this.data.introContent || []).length });
        wx.nextTick(() => {
          this.setData({ animReady: true });
        });
      } else {
        this.setData({ animReady: false, currentStep: 0, slideClass: '' });
      }
    }
  }
});
