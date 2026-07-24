App({
  onLaunch() {
    wx.onError && wx.onError(function(msg) {
      console.error('[global] uncaught error:', msg);
    });
    wx.onUnhandledRejection && wx.onUnhandledRejection(function(reason) {
      console.error('[global] unhandled rejection:', reason);
    });
  },
  globalData: {}
});
