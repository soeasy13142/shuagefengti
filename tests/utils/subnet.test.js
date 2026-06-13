const {
  validateIp,
  validateCidr,
  parseIp,
  ipToBinary,
  cidrToMask,
  calculateSubnet,
  classifyIp
} = require('../../utils/subnet');

describe('validateIp', () => {
  test('合法 IP 返回 true', () => {
    expect(validateIp('192.168.1.1')).toBe(true);
    expect(validateIp('0.0.0.0')).toBe(true);
    expect(validateIp('255.255.255.255')).toBe(true);
    expect(validateIp('10.0.0.1')).toBe(true);
  });

  test('非法 IP 返回 false', () => {
    expect(validateIp('256.1.1.1')).toBe(false);
    expect(validateIp('1.2.3')).toBe(false);
    expect(validateIp('1.2.3.4.5')).toBe(false);
    expect(validateIp('abc.def.ghi.jkl')).toBe(false);
    expect(validateIp('')).toBe(false);
    expect(validateIp(null)).toBe(false);
    expect(validateIp(undefined)).toBe(false);
    expect(validateIp('1.2.3.-1')).toBe(false);
  });
});

describe('validateCidr', () => {
  test('合法 CIDR 返回 true', () => {
    expect(validateCidr(0)).toBe(true);
    expect(validateCidr(8)).toBe(true);
    expect(validateCidr(24)).toBe(true);
    expect(validateCidr(32)).toBe(true);
  });

  test('非法 CIDR 返回 false', () => {
    expect(validateCidr(-1)).toBe(false);
    expect(validateCidr(33)).toBe(false);
    expect(validateCidr(3.5)).toBe(false);
    expect(validateCidr('24')).toBe(false);
    expect(validateCidr(null)).toBe(false);
  });
});

describe('parseIp', () => {
  test('合法 IP 解析为四段数组', () => {
    expect(parseIp('192.168.1.1')).toEqual([192, 168, 1, 1]);
    expect(parseIp('10.0.0.0')).toEqual([10, 0, 0, 0]);
    expect(parseIp('255.255.255.255')).toEqual([255, 255, 255, 255]);
  });

  test('非法 IP 返回 null', () => {
    expect(parseIp('256.1.1.1')).toBeNull();
    expect(parseIp('abc')).toBeNull();
  });
});

describe('ipToBinary', () => {
  test('转换为 8 位二进制字符串', () => {
    expect(ipToBinary([192, 168, 1, 1])).toEqual([
      '11000000', '10101000', '00000001', '00000001'
    ]);
    expect(ipToBinary([0, 0, 0, 0])).toEqual([
      '00000000', '00000000', '00000000', '00000000'
    ]);
    expect(ipToBinary([255, 255, 255, 255])).toEqual([
      '11111111', '11111111', '11111111', '11111111'
    ]);
    expect(ipToBinary([10, 0, 0, 1])).toEqual([
      '00001010', '00000000', '00000000', '00000001'
    ]);
  });
});

describe('cidrToMask', () => {
  test('/24 → 255.255.255.0', () => {
    expect(cidrToMask(24)).toEqual([255, 255, 255, 0]);
  });

  test('/16 → 255.255.0.0', () => {
    expect(cidrToMask(16)).toEqual([255, 255, 0, 0]);
  });

  test('/8 → 255.0.0.0', () => {
    expect(cidrToMask(8)).toEqual([255, 0, 0, 0]);
  });

  test('/26 → 255.255.255.192', () => {
    expect(cidrToMask(26)).toEqual([255, 255, 255, 192]);
  });

  test('/0 → 0.0.0.0', () => {
    expect(cidrToMask(0)).toEqual([0, 0, 0, 0]);
  });

  test('/32 → 255.255.255.255', () => {
    expect(cidrToMask(32)).toEqual([255, 255, 255, 255]);
  });

  test('/25 → 255.255.255.128', () => {
    expect(cidrToMask(25)).toEqual([255, 255, 255, 128]);
  });

  test('/27 → 255.255.255.224', () => {
    expect(cidrToMask(27)).toEqual([255, 255, 255, 224]);
  });

  test('/28 → 255.255.255.240', () => {
    expect(cidrToMask(28)).toEqual([255, 255, 255, 240]);
  });

  test('/30 → 255.255.255.252', () => {
    expect(cidrToMask(30)).toEqual([255, 255, 255, 252]);
  });

  test('非法 CIDR 返回 null', () => {
    expect(cidrToMask(33)).toBeNull();
    expect(cidrToMask(-1)).toBeNull();
  });
});

describe('calculateSubnet — 192.168.1.0/24', () => {
  test('标准 C 类 /24 子网', () => {
    const r = calculateSubnet('192.168.1.0', 24);
    expect(r).not.toBeNull();
    expect(r.subnetMask).toBe('255.255.255.0');
    expect(r.networkAddress).toBe('192.168.1.0');
    expect(r.broadcastAddress).toBe('192.168.1.255');
    expect(r.firstHost).toBe('192.168.1.1');
    expect(r.lastHost).toBe('192.168.1.254');
    expect(r.totalHosts).toBe(254);
    expect(r.ipClass).toBe('C');
    expect(r.isPrivate).toBe(true);
  });
});

describe('calculateSubnet — 10.0.0.0/8', () => {
  test('A 类私有地址', () => {
    const r = calculateSubnet('10.0.0.0', 8);
    expect(r).not.toBeNull();
    expect(r.subnetMask).toBe('255.0.0.0');
    expect(r.networkAddress).toBe('10.0.0.0');
    expect(r.broadcastAddress).toBe('10.255.255.255');
    expect(r.firstHost).toBe('10.0.0.1');
    expect(r.lastHost).toBe('10.255.255.254');
    expect(r.totalHosts).toBe(16777214);
    expect(r.ipClass).toBe('A');
    expect(r.isPrivate).toBe(true);
  });
});

describe('calculateSubnet — 172.16.0.0/12', () => {
  test('B 类私有地址', () => {
    const r = calculateSubnet('172.16.0.0', 12);
    expect(r).not.toBeNull();
    expect(r.subnetMask).toBe('255.240.0.0');
    expect(r.networkAddress).toBe('172.16.0.0');
    expect(r.broadcastAddress).toBe('172.31.255.255');
    expect(r.firstHost).toBe('172.16.0.1');
    expect(r.lastHost).toBe('172.31.255.254');
    expect(r.totalHosts).toBe(1048574);
    expect(r.ipClass).toBe('B');
    expect(r.isPrivate).toBe(true);
  });
});

describe('calculateSubnet — 192.168.1.100/26', () => {
  test('C 类 /26 子网', () => {
    const r = calculateSubnet('192.168.1.100', 26);
    expect(r).not.toBeNull();
    expect(r.subnetMask).toBe('255.255.255.192');
    expect(r.networkAddress).toBe('192.168.1.64');
    expect(r.broadcastAddress).toBe('192.168.1.127');
    expect(r.firstHost).toBe('192.168.1.65');
    expect(r.lastHost).toBe('192.168.1.126');
    expect(r.totalHosts).toBe(62);
    expect(r.ipClass).toBe('C');
    expect(r.isPrivate).toBe(true);
  });
});

describe('calculateSubnet — 127.0.0.1/8', () => {
  test('环回地址', () => {
    const r = calculateSubnet('127.0.0.1', 8);
    expect(r).not.toBeNull();
    expect(r.subnetMask).toBe('255.0.0.0');
    expect(r.networkAddress).toBe('127.0.0.0');
    expect(r.broadcastAddress).toBe('127.255.255.255');
    expect(r.totalHosts).toBe(16777214);
    expect(r.ipClass).toBe('特殊');
    expect(r.isPrivate).toBe(true);
    expect(r.description).toContain('环回');
  });
});

describe('calculateSubnet — 255.255.255.255/32', () => {
  test('广播专用地址 /32 单主机', () => {
    const r = calculateSubnet('255.255.255.255', 32);
    expect(r).not.toBeNull();
    expect(r.subnetMask).toBe('255.255.255.255');
    expect(r.networkAddress).toBe('255.255.255.255');
    expect(r.broadcastAddress).toBe('255.255.255.255');
    expect(r.totalHosts).toBe(1);
    expect(r.ipClass).toBe('特殊');
    expect(r.description).toContain('广播');
  });
});

describe('calculateSubnet — 10.0.0.1/32', () => {
  test('单主机地址', () => {
    const r = calculateSubnet('10.0.0.1', 32);
    expect(r).not.toBeNull();
    expect(r.subnetMask).toBe('255.255.255.255');
    expect(r.networkAddress).toBe('10.0.0.1');
    expect(r.broadcastAddress).toBe('10.0.0.1');
    expect(r.totalHosts).toBe(1);
  });
});

describe('calculateSubnet — /31 点对点链路', () => {
  test('/31 有两个可用地址', () => {
    const r = calculateSubnet('10.0.0.0', 31);
    expect(r).not.toBeNull();
    expect(r.totalHosts).toBe(2);
    expect(r.networkAddress).toBe('10.0.0.0');
    expect(r.broadcastAddress).toBe('10.0.0.1');
  });
});

describe('calculateSubnet — 非法输入', () => {
  test('非法 IP 返回 null', () => {
    expect(calculateSubnet('256.1.1.1', 24)).toBeNull();
    expect(calculateSubnet('abc', 24)).toBeNull();
    expect(calculateSubnet('', 24)).toBeNull();
  });

  test('非法 CIDR 返回 null', () => {
    expect(calculateSubnet('192.168.1.0', 33)).toBeNull();
    expect(calculateSubnet('192.168.1.0', -1)).toBeNull();
    expect(calculateSubnet('192.168.1.0', 3.5)).toBeNull();
  });
});

describe('calculateSubnet — 二进制表示', () => {
  test('IP 和掩码的二进制正确', () => {
    const r = calculateSubnet('192.168.1.100', 26);
    expect(r.ipBinary).toEqual([
      '11000000', '10101000', '00000001', '01100100'
    ]);
    expect(r.maskBinary).toEqual([
      '11111111', '11111111', '11111111', '11000000'
    ]);
    expect(r.networkBinary).toEqual([
      '11000000', '10101000', '00000001', '01000000'
    ]);
    expect(r.broadcastBinary).toEqual([
      '11000000', '10101000', '00000001', '01111111'
    ]);
  });
});

describe('classifyIp', () => {
  test('A 类地址', () => {
    expect(classifyIp([10, 0, 0, 1]).ipClass).toBe('A');
    expect(classifyIp([10, 0, 0, 1]).isPrivate).toBe(true);
    expect(classifyIp([8, 8, 8, 8]).ipClass).toBe('A');
    expect(classifyIp([8, 8, 8, 8]).isPrivate).toBe(false);
  });

  test('B 类地址', () => {
    expect(classifyIp([172, 16, 0, 1]).ipClass).toBe('B');
    expect(classifyIp([172, 16, 0, 1]).isPrivate).toBe(true);
    expect(classifyIp([131, 107, 0, 1]).ipClass).toBe('B');
    expect(classifyIp([131, 107, 0, 1]).isPrivate).toBe(false);
  });

  test('C 类地址', () => {
    expect(classifyIp([192, 168, 1, 1]).ipClass).toBe('C');
    expect(classifyIp([192, 168, 1, 1]).isPrivate).toBe(true);
    expect(classifyIp([200, 1, 1, 1]).ipClass).toBe('C');
    expect(classifyIp([200, 1, 1, 1]).isPrivate).toBe(false);
  });

  test('D 类组播地址', () => {
    expect(classifyIp([224, 0, 0, 1]).ipClass).toBe('D');
    expect(classifyIp([224, 0, 0, 1]).description).toContain('组播');
  });

  test('E 类保留地址', () => {
    expect(classifyIp([240, 0, 0, 1]).ipClass).toBe('E');
    expect(classifyIp([240, 0, 0, 1]).description).toContain('保留');
  });

  test('环回地址', () => {
    expect(classifyIp([127, 0, 0, 1]).ipClass).toBe('特殊');
    expect(classifyIp([127, 0, 0, 1]).isPrivate).toBe(true);
    expect(classifyIp([127, 0, 0, 1]).description).toContain('环回');
  });

  test('链路本地地址', () => {
    expect(classifyIp([169, 254, 0, 1]).ipClass).toBe('特殊');
    expect(classifyIp([169, 254, 0, 1]).description).toContain('链路本地');
  });

  test('当前网络保留地址', () => {
    expect(classifyIp([0, 0, 0, 0]).ipClass).toBe('特殊');
    expect(classifyIp([0, 0, 0, 0]).description).toContain('保留');
  });
});
