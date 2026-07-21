// components/loading-skeleton/loading-skeleton.js
Component({
  properties: {
    type: { type: String, value: 'card' },
    count: { type: Number, value: 1 }
  },

  data: {
    skeletonList: []
  },

  observers: {
    'type, count': function () {
      this._buildSkeletonList();
    }
  },

  lifetimes: {
    attached() {
      this._buildSkeletonList();
    }
  },

  methods: {
    _buildSkeletonList() {
      const arr = [];
      const c = Math.max(0, this.data.count || 0);
      for (let i = 0; i < c; i++) {
        arr.push({ id: 'sk-' + i + '-' + Date.now() });
      }
      this.setData({ skeletonList: arr });
    }
  }
});
