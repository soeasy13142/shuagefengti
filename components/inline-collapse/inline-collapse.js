Component({
  properties: {
    title: { type: String, value: '使用说明' },
    expanded: { type: Boolean, value: false }
  },

  data: {
    isExpanded: false
  },

  observers: {
    'expanded': function(val) {
      this.setData({ isExpanded: val });
    }
  },

  methods: {
    onToggle: function() {
      this.setData({ isExpanded: !this.data.isExpanded });
      this.triggerEvent('toggle', { expanded: this.data.isExpanded });
    }
  }
});
