const { fragment, randomId } = require('../../utils/ip-fragment');

describe('randomId', () => {
  test('returns string starting with 0x', () => {
    expect(randomId()).toMatch(/^0x[0-9a-f]{4}$/);
  });

  test('returns different values on successive calls', () => {
    const id1 = randomId();
    const id2 = randomId();
    expect(id1).not.toBe(id2);
  });
});

describe('fragment', () => {
  const HEADER = 20;

  test('single fragment when datagramSize <= MTU', () => {
    const result = fragment(1000, 1500);
    expect(result.totalFragments).toBe(1);
    expect(result.fragments[0].dataStart).toBe(0);
    expect(result.fragments[0].dataEnd).toBe(999);
    expect(result.fragments[0].dataLength).toBe(1000);
    expect(result.fragments[0].mf).toBe(false);
    expect(result.fragments[0].offset).toBe(0);
    expect(result.payloadPerFragment).toBe(1480); // 1500 - 20
  });

  test('fragments when datagramSize > MTU', () => {
    const result = fragment(3000, 1000);
    // payloadPerFragment = 1000 - 20 = 980
    // ceil(3000/980) = 4 fragments
    expect(result.totalFragments).toBe(4);
    expect(result.payloadPerFragment).toBe(980);

    // 第一片: 0~979 (980 bytes)
    expect(result.fragments[0].dataStart).toBe(0);
    expect(result.fragments[0].dataEnd).toBe(979);
    expect(result.fragments[0].dataLength).toBe(980);
    expect(result.fragments[0].mf).toBe(true);
    expect(result.fragments[0].offset).toBe(0);

    // 第二片: 980~1959
    expect(result.fragments[1].dataStart).toBe(980);
    expect(result.fragments[1].dataEnd).toBe(1959);
    expect(result.fragments[1].dataLength).toBe(980);
    expect(result.fragments[1].mf).toBe(true);
    expect(result.fragments[1].offset).toBe(122); // 980 / 8

    // 第三片: 1960~2939
    expect(result.fragments[2].dataStart).toBe(1960);
    expect(result.fragments[2].dataEnd).toBe(2939);
    expect(result.fragments[2].dataLength).toBe(980);
    expect(result.fragments[2].mf).toBe(true);
    expect(result.fragments[2].offset).toBe(245); // 1960 / 8

    // 第四片: 2940~2999
    expect(result.fragments[3].dataStart).toBe(2940);
    expect(result.fragments[3].dataEnd).toBe(2999);
    expect(result.fragments[3].dataLength).toBe(60);
    expect(result.fragments[3].mf).toBe(false);
    expect(result.fragments[3].offset).toBe(367); // 2940 / 8
  });

  test('all fragments share same ID', () => {
    const result = fragment(3000, 1000);
    const id = result.fragments[0].id;
    result.fragments.forEach(function(f) {
      expect(f.id).toBe(id);
    });
  });

  test('offset is 8-byte aligned (byteOffset / 8)', () => {
    const result = fragment(4000, 1500);
    result.fragments.forEach(function(f) {
      expect(f.offset * 8).toBeLessThanOrEqual(f.dataStart);
    });
  });

  test('last fragment has mf = false, others have mf = true', () => {
    const result = fragment(2500, 1000);
    for (let i = 0; i < result.totalFragments - 1; i++) {
      expect(result.fragments[i].mf).toBe(true);
    }
    expect(result.fragments[result.totalFragments - 1].mf).toBe(false);
  });

  test('exact multiple of MTU payload', () => {
    const result = fragment(1960, 1000); // 1960 / 980 = 2 exactly
    expect(result.totalFragments).toBe(2);
    expect(result.fragments[0].dataLength).toBe(980);
    expect(result.fragments[1].dataLength).toBe(980);
    expect(result.fragments[1].mf).toBe(false);
  });

  test('datagramSize equals MTU exactly', () => {
    const result = fragment(1000, 1000);
    // payload = 1000 - 20 = 980, so 1000 bytes need ceil(1000/980) = 2 fragments
    expect(result.totalFragments).toBe(2);
  });

  test('clamp datagramSize to 65535', () => {
    const result = fragment(100000, 1500);
    expect(result.totalBytes).toBe(65535);
  });

  test('clamp MTU to minimum 68', () => {
    const result = fragment(1000, 50);
    expect(result.mtu).toBe(68);
    expect(result.headerSize).toBe(20);
    expect(result.payloadPerFragment).toBe(48); // 68 - 20
  });

  test('edge: minimum MTU 68 with small datagram', () => {
    const result = fragment(100, 68);
    expect(result.payloadPerFragment).toBe(48);
    expect(result.totalFragments).toBe(Math.ceil(100 / 48));
  });

  test('edge: datagramSize exactly 100 (minimum slider)', () => {
    const result = fragment(100, 1500);
    expect(result.totalFragments).toBe(1);
    expect(result.fragments[0].dataLength).toBe(100);
  });
});
