const subnet = require('../../utils/subnet');

// 快捷 CIDR 按钮
const QUICK_CIDRS = [8, 16, 24, 25, 26, 27, 28, 29, 30];

Page({
  data: {
    // IP 四段输入
    ip0: '192',
    ip1: '168',
    ip2: '1',
    ip3: '100',
    // CIDR
    cidr: 26,
    // 快捷按钮
    quickCidrs: QUICK_CIDRS,
    // 计算结果
    result: null,
    // 二进制可视化数据
    ipBits: [],
    maskBits: [],
    networkBits: [],
    broadcastBits: [],
    hostBitStart: 0,
    // 帮助说明
    showHelp: false,
    // 错误提示
    error: ''
  },

  onLoad() {
    this.calculate();
  },

  // IP 段输入
  onIp0Input(e) { this.setData({ ip0: e.detail.value }); this.calculate(); },
  onIp1Input(e) { this.setData({ ip1: e.detail.value }); this.calculate(); },
  onIp2Input(e) { this.setData({ ip2: e.detail.value }); this.calculate(); },
  onIp3Input(e) { this.setData({ ip3: e.detail.value }); this.calculate(); },

  // CIDR 滑块
  onCidrChange(e) {
    this.setData({ cidr: e.detail.value });
    this.calculate();
  },

  // 快捷 CIDR 按钮
  onQuickCidr(e) {
    const cidr = e.currentTarget.dataset.cidr;
    this.setData({ cidr: cidr });
    this.calculate();
  },

  // 切换帮助说明
  toggleHelp() {
    this.setData({ showHelp: !this.data.showHelp });
  },

  // 核心计算
  calculate() {
    const { ip0, ip1, ip2, ip3, cidr } = this.data;
    const ipStr = `${ip0}.${ip1}.${ip2}.${ip3}`;

    // 校验 IP
    if (!subnet.validateIp(ipStr)) {
      this.setData({
        result: null,
        error: 'IP 地址格式不正确',
        ipBits: [],
        maskBits: [],
        networkBits: [],
        broadcastBits: []
      });
      return;
    }

    // 计算子网
    const result = subnet.calculateSubnet(ipStr, cidr);
    if (!result) {
      this.setData({
        result: null,
        error: '计算失败，请检查输入',
        ipBits: [],
        maskBits: [],
        networkBits: [],
        broadcastBits: []
      });
      return;
    }

    // 构建二进制位可视化数据
    this.setData({
      result: result,
      error: '',
      ipBits: this._buildBits(result.ipBinary, cidr),
      maskBits: this._buildBits(result.maskBinary, cidr),
      networkBits: this._buildBits(result.networkBinary, cidr),
      broadcastBits: this._buildBits(result.broadcastBinary, cidr)
    });
  },

  // 构建 32 位格子数据，标记网络位/主机位
  _buildBits(binaryArr, cidr) {
    const bits = [];
    const fullStr = binaryArr.join('');
    for (let i = 0; i < 32; i++) {
      bits.push({
        value: fullStr[i],
        isNetwork: i < cidr,
        isOctetEnd: (i + 1) % 8 === 0 && i < 31
      });
    }
    return bits;
  }
});
