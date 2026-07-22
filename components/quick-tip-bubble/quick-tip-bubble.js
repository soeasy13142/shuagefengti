Component({
  properties: {
    title: { type: String, value: '使用提示' },
    items: { type: Array, value: [] },
    position: { type: String, value: 'bottom-right' }
  },

  data: {
    visible: false
  },

  methods: {
    onToggle: function() {
      this.setData({ visible: !this.data.visible });
    },
    onClose: function() {
      this.setData({ visible: false });
    }
  }
});
