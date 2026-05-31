const storage = {};

global.wx = {
  getStorageSync(key) {
    return storage[key] || '';
  },
  setStorageSync(key, value) {
    storage[key] = value;
  },
  removeStorageSync(key) {
    delete storage[key];
  },
  clearStorageSync() {
    Object.keys(storage).forEach(k => delete storage[k]);
  },
  showToast(options) {},
  showModal(options) {},
  navigateTo(options) {},
  redirectTo(options) {},
  switchTab(options) {},
  navigateBack() {},
  chooseMessageFile(options) {},
  getFileSystemManager() {
    return {
      readFileSync(filePath, encoding) {
        return '';
      }
    };
  }
};

global.__clearMockStorage = () => {
  Object.keys(storage).forEach(k => delete storage[k]);
};
