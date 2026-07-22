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
  getStorage(options) {
    const { key, success, fail } = options;
    const data = storage[key] !== undefined ? storage[key] : null;
    success && success({ data: data });
  },
  setStorage(options) {
    const { key, data, success, fail } = options;
    storage[key] = data;
    success && success();
  },
  removeStorage(options) {
    const { key, success, fail } = options;
    delete storage[key];
    success && success();
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
