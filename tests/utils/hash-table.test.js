const {
  createHashTable,
  hash,
  htInsert,
  htSearch,
  loadFactor,
  collisionCount,
  cloneTable
} = require('../../utils/hash-table');

describe('hash', () => {
  test('同一 key 返回一致结果', () => {
    expect(hash('apple', 7)).toBe(hash('apple', 7));
  });

  test('不同 key 可能返回不同结果', () => {
    var h1 = hash('apple', 7);
    var h2 = hash('banana', 7);
    expect(h1).toBeGreaterThanOrEqual(0);
    expect(h1).toBeLessThan(7);
    expect(h2).toBeGreaterThanOrEqual(0);
    expect(h2).toBeLessThan(7);
  });

  test('返回值在 [0, tableSize) 范围内', () => {
    for (var i = 0; i < 20; i++) {
      var key = 'key' + i;
      var h = hash(key, 7);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(7);
    }
  });
});

describe('createHashTable', () => {
  test('创建空表', () => {
    var table = createHashTable(7);
    expect(table.size).toBe(7);
    expect(table.buckets.length).toBe(7);
    expect(table.count).toBe(0);
  });

  test('每个桶初始为空', () => {
    var table = createHashTable(5);
    for (var i = 0; i < 5; i++) {
      expect(table.buckets[i].entries).toEqual([]);
    }
  });
});

describe('htInsert', () => {
  test('不冲突时直接落入正确桶', () => {
    var table = createHashTable(7);
    var result = htInsert(table, 'apple', 3);
    var bucketIndex = hash('apple', 7);
    expect(result.table.buckets[bucketIndex].entries.length).toBe(1);
    expect(result.table.buckets[bucketIndex].entries[0].key).toBe('apple');
    expect(result.table.buckets[bucketIndex].entries[0].value).toBe(3);
  });

  test('冲突时链表变长', () => {
    var table = createHashTable(7);
    var key1 = null, key2 = null;
    for (var i = 0; i < 100; i++) {
      for (var j = i + 1; j < 100; j++) {
        if (hash('k' + i, 7) === hash('k' + j, 7)) {
          key1 = 'k' + i;
          key2 = 'k' + j;
          break;
        }
      }
      if (key1) break;
    }

    if (key1 && key2) {
      var result1 = htInsert(table, key1, 'v1');
      var result2 = htInsert(result1.table, key2, 'v2');
      var bucketIndex = hash(key1, 7);
      expect(result2.table.buckets[bucketIndex].entries.length).toBe(2);
    }
  });

  test('插入后 count 增加', () => {
    var table = createHashTable(7);
    var result = htInsert(table, 'apple', 3);
    expect(result.table.count).toBe(1);
  });

  test('步骤包含 hash-calc 类型', () => {
    var table = createHashTable(7);
    var result = htInsert(table, 'apple', 3);
    var hashCalcStep = result.steps.find(function(s) { return s.type === 'hash-calc'; });
    expect(hashCalcStep).toBeDefined();
    expect(hashCalcStep.key).toBe('apple');
  });

  test('步骤包含 insert 类型', () => {
    var table = createHashTable(7);
    var result = htInsert(table, 'apple', 3);
    var insertStep = result.steps.find(function(s) { return s.type === 'insert'; });
    expect(insertStep).toBeDefined();
  });

  test('冲突时步骤包含 collision 类型', () => {
    var table = createHashTable(2);
    var r1 = htInsert(table, 'ab', 1);
    var r2 = htInsert(r1.table, 'ba', 2);
    var collisionStep = r2.steps.find(function(s) { return s.type === 'collision'; });
    expect(collisionStep).toBeDefined();
  });

  test('最后一步为 done', () => {
    var table = createHashTable(7);
    var result = htInsert(table, 'apple', 3);
    expect(result.steps[result.steps.length - 1].type).toBe('done');
  });
});

describe('htSearch', () => {
  test('查找存在的 key 返回 found', () => {
    var table = createHashTable(7);
    var inserted = htInsert(table, 'apple', 3);
    var result = htSearch(inserted.table, 'apple');
    expect(result.found).toBe(true);
    expect(result.value).toBe(3);
  });

  test('查找不存在的 key 返回 not-found', () => {
    var table = createHashTable(7);
    var result = htSearch(table, 'apple');
    expect(result.found).toBe(false);
  });

  test('步骤包含 hash-calc 和结果类型', () => {
    var table = createHashTable(7);
    var inserted = htInsert(table, 'apple', 3);
    var result = htSearch(inserted.table, 'apple');
    var types = result.steps.map(function(s) { return s.type; });
    expect(types).toContain('hash-calc');
    expect(types).toContain('found');
  });

  test('查找不存在的 key 步骤包含 not-found', () => {
    var table = createHashTable(7);
    var result = htSearch(table, 'xyz');
    var notFoundStep = result.steps.find(function(s) { return s.type === 'not-found'; });
    expect(notFoundStep).toBeDefined();
  });
});

describe('loadFactor', () => {
  test('空表负载因子为 0', () => {
    var table = createHashTable(7);
    expect(loadFactor(table)).toBe(0);
  });

  test('插入后负载因子正确', () => {
    var table = createHashTable(7);
    var r1 = htInsert(table, 'a', 1);
    expect(loadFactor(r1.table)).toBeCloseTo(1 / 7);
  });
});

describe('collisionCount', () => {
  test('无冲突时为 0', () => {
    var table = createHashTable(7);
    expect(collisionCount(table)).toBe(0);
  });
});

describe('cloneTable', () => {
  test('深拷贝产生独立副本', () => {
    var table = createHashTable(7);
    var inserted = htInsert(table, 'apple', 3);
    var cloned = cloneTable(inserted.table);
    cloned.buckets[0].entries = [];
    expect(inserted.table.buckets[0].entries.length).toBe(
      hash('apple', 7) === 0 ? 1 : 0
    );
  });
});
