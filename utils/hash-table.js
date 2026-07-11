/**
 * 哈希表纯函数模块（链地址法）
 *
 * 提供创建、插入、查找等操作，
 * 每个操作返回步骤数组用于可视化回放。
 */

// ======================== 创建 ========================

/**
 * 创建空哈希表
 * @param {number} size - 桶数量
 * @returns {{ size: number, buckets: Array, count: number }}
 */
function createHashTable(size) {
  const buckets = [];
  for (let i = 0; i < size; i++) {
    buckets.push({ entries: [] });
  }
  return { size: size, buckets: buckets, count: 0 };
}

// ======================== 哈希函数 ========================

/**
 * 计算字符串 key 的哈希值
 * 使用字符编码求和取模法
 * @param {string} key
 * @param {number} tableSize
 * @returns {number}
 */
function hash(key, tableSize) {
  let sum = 0;
  for (let i = 0; i < key.length; i++) {
    sum += key.charCodeAt(i);
  }
  return sum % tableSize;
}

// ======================== 辅助函数 ========================

/**
 * 深拷贝哈希表（用于步骤快照）
 */
function cloneTable(table) {
  const buckets = [];
  for (let i = 0; i < table.buckets.length; i++) {
    const entries = [];
    for (let j = 0; j < table.buckets[i].entries.length; j++) {
      const e = table.buckets[i].entries[j];
      entries.push({ key: e.key, value: e.value });
    }
    buckets.push({ entries: entries });
  }
  return { size: table.size, buckets: buckets, count: table.count };
}

// ======================== 插入 ========================

/**
 * 向哈希表插入一个键值对
 * @param {object} table - 哈希表
 * @param {string} key
 * @param {*} value
 * @returns {{ table: object, steps: Array }}
 */
function htInsert(table, key, value) {
  const steps = [];
  const newTable = cloneTable(table);
  const bucketIndex = hash(key, newTable.size);

  // 步骤 1：计算哈希值
  steps.push({
    type: 'hash-calc',
    key: key,
    hashValue: bucketIndex,
    bucketIndex: bucketIndex,
    description: 'hash("' + key + '") = ' + key.length + ' % ' + newTable.size + ' = ' + bucketIndex,
    tableSnapshot: cloneTable(newTable)
  });

  const bucket = newTable.buckets[bucketIndex];

  // 检查是否已存在（更新值）
  let found = false;
  for (let i = 0; i < bucket.entries.length; i++) {
    if (bucket.entries[i].key === key) {
      bucket.entries[i].value = value;
      found = true;
      break;
    }
  }

  if (!found) {
    // 检查是否冲突
    if (bucket.entries.length > 0) {
      steps.push({
        type: 'collision',
        key: key,
        hashValue: bucketIndex,
        bucketIndex: bucketIndex,
        description: '桶 ' + bucketIndex + ' 已有 ' + bucket.entries.length + ' 个元素，发生冲突！',
        tableSnapshot: cloneTable(newTable)
      });
    }

    bucket.entries.push({ key: key, value: value });
    newTable.count++;
  }

  // 步骤：插入
  steps.push({
    type: 'insert',
    key: key,
    hashValue: bucketIndex,
    bucketIndex: bucketIndex,
    description: (found ? '更新 ' : '插入 ') + '"' + key + '" 到桶 ' + bucketIndex,
    tableSnapshot: cloneTable(newTable)
  });

  // 完成
  steps.push({
    type: 'done',
    description: '插入完成',
    tableSnapshot: cloneTable(newTable)
  });

  return { table: newTable, steps: steps };
}

// ======================== 查找 ========================

/**
 * 在哈希表中查找一个 key
 * @param {object} table - 哈希表
 * @param {string} key
 * @returns {{ found: boolean, value: *, steps: Array }}
 */
function htSearch(table, key) {
  const steps = [];
  const bucketIndex = hash(key, table.size);

  // 步骤 1：计算哈希值
  steps.push({
    type: 'hash-calc',
    key: key,
    hashValue: bucketIndex,
    bucketIndex: bucketIndex,
    description: 'hash("' + key + '") = ' + key.length + ' % ' + table.size + ' = ' + bucketIndex,
    tableSnapshot: cloneTable(table)
  });

  const bucket = table.buckets[bucketIndex];

  // 遍历链表
  for (let i = 0; i < bucket.entries.length; i++) {
    const entry = bucket.entries[i];
    if (entry.key === key) {
      steps.push({
        type: 'found',
        key: key,
        value: entry.value,
        hashValue: bucketIndex,
        bucketIndex: bucketIndex,
        position: i,
        description: '在桶 ' + bucketIndex + ' 的第 ' + (i + 1) + ' 个位置找到 "' + key + '"',
        tableSnapshot: cloneTable(table)
      });
      return { found: true, value: entry.value, steps: steps };
    }
  }

  // 未找到
  steps.push({
    type: 'not-found',
    key: key,
    hashValue: bucketIndex,
    bucketIndex: bucketIndex,
    description: '在桶 ' + bucketIndex + ' 中未找到 "' + key + '"',
    tableSnapshot: cloneTable(table)
  });

  return { found: false, value: undefined, steps: steps };
}

// ======================== 统计 ========================

/**
 * 计算负载因子
 * @param {object} table
 * @returns {number}
 */
function loadFactor(table) {
  if (table.size === 0) return 0;
  return table.count / table.size;
}

/**
 * 统计冲突桶数
 * @param {object} table
 * @returns {number}
 */
function collisionCount(table) {
  let count = 0;
  for (let i = 0; i < table.buckets.length; i++) {
    if (table.buckets[i].entries.length > 1) {
      count++;
    }
  }
  return count;
}

// ======================== 导出 ========================

module.exports = {
  createHashTable: createHashTable,
  hash: hash,
  htInsert: htInsert,
  htSearch: htSearch,
  loadFactor: loadFactor,
  collisionCount: collisionCount,
  cloneTable: cloneTable
};
