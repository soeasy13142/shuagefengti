/**
 * DFA 模拟运行器
 *
 * 逐字符沿 DFA 转移，记录路径，判断接受/拒绝
 */

/**
 * 模拟 DFA 运行
 * @param {object} dfa - { start: string, states: [...], alphabet: [...] }
 * @param {string} input - 输入字符串
 * @returns {{ accepted: boolean, path: object[] }}
 *
 * path 每步格式：
 *   { fromState: string, char: string, toState: string }
 */
function simulateDFA(dfa, input) {
  if (input === undefined || input === null) {
    throw new Error('Input must be a string');
  }
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  const path = [];
  let currentId = dfa.start;

  // Empty string: check if start state is accept
  if (input.length === 0) {
    const startState = findDfaState(dfa, currentId);
    return {
      accepted: startState ? startState.isAccept : false,
      path: []
    };
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    // Check if character is in alphabet
    if (dfa.alphabet.indexOf(ch) === -1) {
      throw new Error('Character "' + ch + '" is not in the DFA alphabet');
    }

    const state = findDfaState(dfa, currentId);
    if (!state) {
      throw new Error('DFA state "' + currentId + '" not found');
    }

    const nextId = state.transitions[ch];
    if (nextId === undefined) {
      // No transition: rejected
      path.push({
        fromState: currentId,
        char: ch,
        toState: null
      });
      return {
        accepted: false,
        path: path
      };
    }

    path.push({
      fromState: currentId,
      char: ch,
      toState: nextId
    });
    currentId = nextId;
  }

  // Check if final state is accept
  const finalState = findDfaState(dfa, currentId);
  return {
    accepted: finalState ? finalState.isAccept : false,
    path: path
  };
}

/**
 * 按 ID 查找 DFA 状态
 */
function findDfaState(dfa, id) {
  for (let i = 0; i < dfa.states.length; i++) {
    if (dfa.states[i].id === id) return dfa.states[i];
  }
  return null;
}

module.exports = {
  simulateDFA: simulateDFA
};
