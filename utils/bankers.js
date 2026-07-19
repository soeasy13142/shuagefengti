/**
 * Calculate Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
 * @param {number[][]} max - Maximum demand matrix
 * @param {number[][]} allocation - Currently allocated matrix
 * @returns {number[][]} Need matrix
 */
function calculateNeed(max, allocation) {
  if (max.length !== allocation.length) {
    throw new Error('Dimension mismatch');
  }
  for (let i = 0; i < max.length; i++) {
    if (max[i].length !== allocation[i].length) {
      throw new Error('Dimension mismatch');
    }
    for (let j = 0; j < max[i].length; j++) {
      if (max[i][j] < allocation[i][j]) {
        throw new Error('Max cannot be less than Allocation at [' + i + '][' + j + ']');
      }
    }
  }

  return max.map(function(row, i) {
    return row.map(function(val, j) {
      return val - allocation[i][j];
    });
  });
}

/**
 * Run Banker's safety algorithm to determine if system is in a safe state
 * @param {number[][]} max - Maximum demand matrix
 * @param {number[][]} allocation - Currently allocated matrix
 * @param {number[]} available - Available resources vector
 * @returns {{ safe: boolean, safeSequence: string[], steps: object[] }}
 */
function isSafeState(max, allocation, available) {
  if (max.length !== allocation.length) {
    throw new Error('Dimension mismatch');
  }
  for (let i = 0; i < max.length; i++) {
    if (max[i].length !== allocation[i].length) {
      throw new Error('Dimension mismatch');
    }
    if (allocation[i].length !== available.length) {
      throw new Error('Dimension mismatch');
    }
  }

  const n = max.length;
  if (n === 0) {
    return { safe: true, safeSequence: [], steps: [] };
  }

  const need = calculateNeed(max, allocation);
  let work = available.slice();
  const finish = new Array(n).fill(false);
  const safeSequence = [];
  const steps = [];
  let progress = true;

  while (progress) {
    progress = false;
    for (let i = 0; i < n; i++) {
      if (finish[i]) continue;

      let needLEWork = true;
      for (let j = 0; j < work.length; j++) {
        if (need[i][j] > work[j]) {
          needLEWork = false;
          break;
        }
      }

      var stepRecord = {
        process: 'P' + (i + 1),
        need: need[i].slice(),
        work: work.slice(),
        needLEWork: needLEWork,
        newWork: null
      };

      if (needLEWork) {
        // Pretend the process finishes and releases its resources
        const newWork = work.slice();
        for (let k = 0; k < newWork.length; k++) {
          newWork[k] += allocation[i][k];
        }

        stepRecord.newWork = newWork.slice();
        steps.push(stepRecord);

        finish[i] = true;
        safeSequence.push('P' + (i + 1));
        work = newWork;
        progress = true;
      } else {
        steps.push(stepRecord);
      }
    }
  }

  const allFinished = finish.every(function(f) { return f; });

  return {
    safe: allFinished,
    safeSequence: safeSequence,
    steps: steps
  };
}

module.exports = {
  calculateNeed,
  isSafeState
};
