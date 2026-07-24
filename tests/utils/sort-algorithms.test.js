/**
 * 排序算法步骤生成器测试
 * 测试三种排序算法产出的步骤序列是否正确
 */

const { bubbleSort, selectionSort, quickSort } = require('../../utils/sort-algorithms');

// 模拟排序执行，验证最终结果正确
function simulateSort(arr, steps) {
  let a = arr.slice();
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];
    if (step.type === 'swap' && step.indices.length === 2) {
      let idx1 = step.indices[0];
      let idx2 = step.indices[1];
      let temp = a[idx1]; a[idx1] = a[idx2]; a[idx2] = temp;
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
        const steps = selectionSort(arr);
        const result = simulateSort(arr, steps);
        expect(result).toEqual([...arr].sort((a, b) => a - b));
      });
    });

    test('包含 done 步骤', () => {
      const steps = selectionSort([3, 1, 2]);
      expect(steps[steps.length - 1].type).toBe('done');
    });

    test('每个元素最终被标记为 sorted', () => {
      const steps = selectionSort([3, 1, 2]);
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
        const steps = bubbleSort(arr);
        const result = simulateSort(arr, steps);
        expect(result).toEqual([...arr].sort((a, b) => a - b));
      });
    });

    test('包含 done 步骤', () => {
      const steps = bubbleSort([3, 1, 2]);
      expect(steps[steps.length - 1].type).toBe('done');
    });

    test('已排序数组不产生交换步骤', () => {
      const steps = bubbleSort([1, 2, 3, 4, 5]);
      const swaps = steps.filter(s => s.type === 'swap');
      expect(swaps.length).toBe(0);
    });
  });

  describe('快速排序', () => {
    test('产出的步骤最终排序结果正确', () => {
      testCases.forEach(arr => {
        if (arr.length < 2) return;
        const steps = quickSort(arr);
        const result = simulateSort(arr, steps);
        expect(result).toEqual([...arr].sort((a, b) => a - b));
      });
    });

    test('包含 done 步骤', () => {
      const steps = quickSort([3, 1, 2]);
      expect(steps[steps.length - 1].type).toBe('done');
    });

    test('包含 pivot 步骤', () => {
      const steps = quickSort([5, 3, 8, 1, 9]);
      const pivots = steps.filter(s => s.type === 'pivot');
      expect(pivots.length).toBeGreaterThan(0);
    });
  });

  describe('步骤格式', () => {
    test('每个步骤都有 type 和 indices', () => {
      const steps = selectionSort([3, 1, 2]);
      steps.forEach(step => {
        expect(step).toHaveProperty('type');
        expect(step).toHaveProperty('indices');
        expect(Array.isArray(step.indices)).toBe(true);
      });
    });

    test('swap 步骤有 2 个索引', () => {
      const steps = selectionSort([5, 3, 8, 1, 9]);
      steps.filter(s => s.type === 'swap').forEach(step => {
        expect(step.indices.length).toBe(2);
      });
    });
  });
});
