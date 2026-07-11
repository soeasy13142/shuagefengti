/**
 * 排序算法步骤生成器（纯函数）
 *
 * 抽自 pages/sort-viz/sort-viz.js · 仅纯 sort-step 函数 · 与 WeChat mini-program runtime 无关
 * 每个函数接收一个数组，返回该数组排序过程中的步骤序列（compare / swap / sorted / pivot / done）
 * 供可视化回放使用，函数本身不持有任何外部状态。
 */

/**
 * 选择排序步骤生成器
 * @param {number[]} arr 输入数组
 * @returns {Array<{type: string, indices: number[], desc?: string}>} 步骤序列
 */
function selectionSort(arr) {
  const steps = [];
  const a = arr.slice();
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({ type: 'compare', indices: [minIdx], desc: '从位置 ' + i + ' 开始寻找最小值' });
    for (let j = i + 1; j < n; j++) {
      steps.push({ type: 'compare', indices: [minIdx, j], desc: '比较 a[' + minIdx + ']=' + a[minIdx] + ' 和 a[' + j + ']=' + a[j] });
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      steps.push({ type: 'swap', indices: [i, minIdx], desc: '交换 a[' + i + ']=' + a[i] + ' 和 a[' + minIdx + ']=' + a[minIdx] });
      let temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
    }
    steps.push({ type: 'sorted', indices: [i], desc: '位置 ' + i + ' 确定为 ' + a[i] });
  }
  steps.push({ type: 'sorted', indices: [n - 1], desc: '最后一个元素 ' + a[n - 1] + ' 自动归位' });
  steps.push({ type: 'done', indices: [], desc: '选择排序完成！共 ' + steps.length + ' 步' });
  return steps;
}

/**
 * 冒泡排序步骤生成器
 * @param {number[]} arr 输入数组
 * @returns {Array<{type: string, indices: number[], desc?: string}>} 步骤序列
 */
function bubbleSort(arr) {
  const steps = [];
  const a = arr.slice();
  const n = a.length;
  let sortedCount = 0;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    steps.push({ type: 'compare', indices: [], desc: '第 ' + (i + 1) + ' 轮冒泡开始' });
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({ type: 'compare', indices: [j, j + 1], desc: '比较相邻元素 a[' + j + ']=' + a[j] + ' 和 a[' + (j + 1) + ']=' + a[j + 1] });
      if (a[j] > a[j + 1]) {
        steps.push({ type: 'swap', indices: [j, j + 1], desc: '交换 a[' + j + ']=' + a[j] + ' 和 a[' + (j + 1) + ']=' + a[j + 1] });
        let temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
        swapped = true;
      }
    }
    steps.push({ type: 'sorted', indices: [n - 1 - i], desc: '位置 ' + (n - 1 - i) + ' 确定为 ' + a[n - 1 - i] });
    if (!swapped) {
      for (let k = n - 2 - i; k >= 0; k--) {
        steps.push({ type: 'sorted', indices: [k], desc: '位置 ' + k + ' 确定为 ' + a[k] });
      }
      break;
    }
  }
  steps.push({ type: 'sorted', indices: [0], desc: '第一个元素 ' + a[0] + ' 自动归位' });
  steps.push({ type: 'done', indices: [], desc: '冒泡排序完成！共 ' + steps.length + ' 步' });
  return steps;
}

/**
 * 快速排序步骤生成器
 * @param {number[]} arr 输入数组
 * @returns {Array<{type: string, indices: number[], desc?: string}>} 步骤序列
 */
function quickSort(arr) {
  const steps = [];
  const a = arr.slice();

  function partition(low, high) {
    let pivot = a[high];
    steps.push({ type: 'pivot', indices: [high], desc: '选择基准 a[' + high + ']=' + pivot });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ type: 'compare', indices: [j, high], desc: '比较 a[' + j + ']=' + a[j] + ' 和基准 ' + pivot });
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          steps.push({ type: 'swap', indices: [i, j], desc: '交换 a[' + i + ']=' + a[i] + ' 和 a[' + j + ']=' + a[j] });
          let temp = a[i];
          a[i] = a[j];
          a[j] = temp;
        }
      }
    }
    if (i + 1 !== high) {
      steps.push({ type: 'swap', indices: [i + 1, high], desc: '将基准放到正确位置 a[' + (i + 1) + ']=' + a[i + 1] + ' 和 a[' + high + ']=' + a[high] });
      let temp2 = a[i + 1];
      a[i + 1] = a[high];
      a[high] = temp2;
    }
    steps.push({ type: 'sorted', indices: [i + 1], desc: '基准 ' + a[i + 1] + ' 归位到位置 ' + (i + 1) });
    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      steps.push({ type: 'sorted', indices: [low], desc: '单元素 a[' + low + ']=' + a[low] + ' 已有序' });
    }
  }

  quickSort(0, a.length - 1);
  steps.push({ type: 'done', indices: [], desc: '快速排序完成！共 ' + steps.length + ' 步' });
  return steps;
}

module.exports = {
  selectionSort: selectionSort,
  bubbleSort: bubbleSort,
  quickSort: quickSort
};