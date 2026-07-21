// components/tool-help-panel/tool-help-panel.js
Component({
  properties: {
    content: { type: Array, value: [] },
    activeMode: { type: String, value: '', observer: '_onModeChange' },
    visible: { type: Boolean, value: false }
  },

  data: {
    currentContent: null,
    expansionOpen: false,
    animClass: ''
  },

  methods: {
    _onModeChange() {
      const match = (this.data.content || []).find(c => c.mode === this.data.activeMode);
      const newContent = match || null;
      if (newContent !== this.data.currentContent) {
        this.setData({ animClass: 'fade-out' });
        const timer = setTimeout(() => {
          this.setData({ currentContent: newContent, expansionOpen: false, animClass: 'fade-in' });
          clearTimeout(timer);
          const timer2 = setTimeout(() => {
            this.setData({ animClass: '' });
            clearTimeout(timer2);
          }, 150);
        }, 150);
      }
    },

    onTriggerTap() {
      const newVisible = !this.data.visible;
      this.setData({ visible: newVisible });
      this.triggerEvent('toggle', { visible: newVisible });
    },

    onToggleExpansion() {
      this.setData({ expansionOpen: !this.data.expansionOpen });
    },

    onMaskTap() {
      if (this.data.visible) {
        this.setData({ visible: false, expansionOpen: false });
        this.triggerEvent('toggle', { visible: false });
        this.triggerEvent('close');
      }
    },

    noop() {}
  },

  lifetimes: {
    attached() {
      this._onModeChange();
    }
  }
});
