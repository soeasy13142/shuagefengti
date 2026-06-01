/**
 * 排序可视化 - 算法步骤生成器测试
 * 测试三种排序算法产出的步骤序列是否正确
 */

// 提取排序步骤生成器用于测试
function selectionSortSteps(arr) {
  var steps = [];
  var a = arr.slice();
  var n = a.length;
  for (var i = 0; i < n - 1; i++) {
    var minIdx = i;
    steps.push({ type: 'compare', indices: [minIdx] });
    for (var j = i + 1; j < n; j++) {
      steps.push({ type: 'compare', indices: [minIdx, j] });
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      steps.push({ type: 'swap', indices: [i, minIdx] });
      var temp = a[i]; a[i] = a[minIdx]; a[minIdx] = temp;
    }
    steps.push({ type: 'sorted', indices: [i] });
  }
  steps.push({ type: 'sorted', indices: [n - 1] });
  steps.push({ type: 'done', indices: [] });
  return steps;
}

function bubbleSortSteps(arr) {
  var steps = [];
  var a = arr.slice();
  var n = a.length;
  for (var i = 0; i < n - 1; i++) {
    var swapped = false;
    steps.push({ type: 'compare', indices: [] });
    for (var j = 0; j < n - 1 - i; j++) {
      steps.push({ type: 'compare', indices: [j, j + 1] });
      if (a[j] > a[j + 1]) {
        steps.push({ type: 'swap', indices: [j, j + 1] });
        var temp = a[j]; a[j] = a[j + 1]; a[j + 1] = temp;
        swapped = true;
      }
    }
    steps.push({ type: 'sorted', indices: [n - 1 - i] });
    if (!swapped) {
      for (var k = n - 2 - i; k >= 0; k--) {
        steps.push({ type: 'sorted', indices: [k] });
      }
      break;
    }
  }
  steps.push({ type: 'sorted', indices: [0] });
  steps.push({ type: 'done', indices: [] });
  return steps;
}

function quickSortSteps(arr) {
  var steps = [];
  var a = arr.slice();

  function partition(low, high) {
    var pivot = a[high];
    steps.push({ type: 'pivot', indices: [high] });
    var i = low - 1;
    for (var j = low; j < high; j++) {
      steps.push({ type: 'compare', indices: [j, high] });
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          steps.push({ type: 'swap', indices: [i, j] });
          var temp = a[i]; a[i] = a[j]; a[j] = temp;
        }
      }
    }
    if (i + 1 !== high) {
      steps.push({ type: 'swap', indices: [i + 1, high] });
      var temp2 = a[i + 1]; a[i + 1] = a[high]; a[high] = temp2;
    }
    steps.push({ type: 'sorted', indices: [i + 1] });
    return i + 1;
  }

  function qs(low, high) {
    if (low < high) {
      var pi = partition(low, high);
      qs(low, pi - 1);
      qs(pi + 1, high);
    } else if (low === high) {
      steps.push({ type: 'sorted', indices: [low] });
    }
  }

  qs(0, a.length - 1);
  steps.push({ type: 'done', indices: [] });
  return steps;
}

// 模拟排序执行，验证最终结果正确
function simulateSort(arr, steps) {
  var a = arr.slice();
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    if (step.type === 'swap' && step.indices.length === 2) {
      var idx1 = step.indices[0];
      var idx2 = step.indices[1];
      var temp = a[idx1]; a[idx1] = a[idx2]; a[idx2] = temp;
    }
  }
  return a;
}

describe('排序步骤生成器', () => {
  const testCases = [
    [5, 3, 8, 1, 9],
    [1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1],
    [42],
    [7, 7, 7],
    [9, 1, 5, 3, 7, 2, 8, 4, 6]
  ];

  describe('选择排序', () => {
    test('产出的步骤最终排序结果正确', () => {
      testCases.forEach(arr => {
        if (arr.length < 2) return;
        const steps = selectionSortSteps(arr);
        const result = simulateSort(arr, steps);
        expect(result).toEqual([...arr].sort((a, b) => a - b));
      });
    });

    test('包含 done 步骤', () => {
      const steps = selectionSortSteps([3, 1, 2]);
      expect(steps[steps.length - 1].type).toBe('done');
    });

    test('每个元素最终被标记为 sorted', () => {
      const steps = selectionSortSteps([3, 1, 2]);
      const sortedIndices = new Set();
      steps.forEach(s => {
        if (s.type === 'sorted') s.indices.forEach(i => sortedIndices.add(i));
      });
      expect(sortedIndices.size).toBe(3);
    });
  });

  describe('冒泡排序', () => {
    test('产出的步骤最终排序结果正确', () => {
      testCases.forEach(arr => {
        if (arr.length < 2) return;
        const steps = bubbleSortSteps(arr);
        const result = simulateSort(arr, steps);
        expect(result).toEqual([...arr].sort((a, b) => a - b));
      });
    });

    test('包含 done 步骤', () => {
      const steps = bubbleSortSteps([3, 1, 2]);
      expect(steps[steps.length - 1].type).toBe('done');
    });

    test('已排序数组不产生交换步骤', () => {
      const steps = bubbleSortSteps([1, 2, 3, 4, 5]);
      const swaps = steps.filter(s => s.type === 'swap');
      expect(swaps.length).toBe(0);
    });
  });

  describe('快速排序', () => {
    test('产出的步骤最终排序结果正确', () => {
      testCases.forEach(arr => {
        if (arr.length < 2) return;
        const steps = quickSortSteps(arr);
        const result = simulateSort(arr, steps);
        expect(result).toEqual([...arr].sort((a, b) => a - b));
      });
    });

    test('包含 done 步骤', () => {
      const steps = quickSortSteps([3, 1, 2]);
      expect(steps[steps.length - 1].type).toBe('done');
    });

    test('包含 pivot 步骤', () => {
      const steps = quickSortSteps([5, 3, 8, 1, 9]);
      const pivots = steps.filter(s => s.type === 'pivot');
      expect(pivots.length).toBeGreaterThan(0);
    });
  });

  describe('步骤格式', () => {
    test('每个步骤都有 type 和 indices', () => {
      const steps = selectionSortSteps([3, 1, 2]);
      steps.forEach(step => {
        expect(step).toHaveProperty('type');
        expect(step).toHaveProperty('indices');
        expect(Array.isArray(step.indices)).toBe(true);
      });
    });

    test('swap 步骤有 2 个索引', () => {
      const steps = selectionSortSteps([5, 3, 8, 1, 9]);
      steps.filter(s => s.type === 'swap').forEach(step => {
        expect(step.indices.length).toBe(2);
      });
    });
  });
});
