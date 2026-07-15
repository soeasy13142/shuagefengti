const registry = require('../../utils/tool-registry');

Component({
  properties: {
    toolId: {
      type: String,
      value: '',
      observer: '_loadToolData'
    },
    show: {
      type: Boolean,
      value: false,
      observer: '_onShowChange'
    }
  },

  data: {
    tool: null,
    toolData: null,
    difficultyLabel: '',
    difficultyStars: '',
    animClass: ''
  },

  methods: {
    _loadToolData(toolId) {
      if (!toolId) return;
      const tool = registry.TOOLS.find(function(t) { return t.id === toolId; });
      if (!tool || !tool.intro) return;

      const diff = registry.getDifficultyInfo(tool.difficulty);
      this.setData({
        tool: tool,
        toolData: tool.intro,
        difficultyLabel: diff.label,
        difficultyStars: diff.stars
      });
    },

    _onShowChange(show) {
      if (show) {
        // 触发入场动画
        const self = this;
        self.setData({ animClass: '' });
        setTimeout(function() {
          self.setData({ animClass: 'modal-visible' });
        }, 30);
      } else {
        this.setData({ animClass: '' });
      }
    },

    onClose() {
      this.triggerEvent('close', { toolId: this.properties.toolId });
    },

    onMaskTap() {
      this.onClose();
    },

    onEnter() {
      this.triggerEvent('enter', { toolId: this.properties.toolId });
    },

    _noop() {
      // 阻止遮罩层点击穿透到内容区
    }
  }
});
