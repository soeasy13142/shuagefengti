/**
 * NFA - DFA 转换器（子集构造法）
 *
 * 算法：
 *   1. ε-闭包({nfa.start}) → 初始 DFA 状态
 *   2. 对每个未处理的 DFA 状态，对字母表中每个字符计算 move + ε-闭包
 *   3. 新集合 → 新区 → 新 DFA 状态，直到没有新状态
 */

const DFA_STATE_LIMIT = 50;

/**
 * 计算 ε-闭包（从状态集合出发，沿 ε 转移可到达的所有状态）
 * @param {object} nfa - { states: [{ id, transitions, isAccept }] }
 * @param {number[]} stateIds - 起始状态 ID 集合
 * @returns {Set<number>}
 */
function epsilonClosure(nfa, stateIds) {
  const visited = new Set();
  const stack = [];

  for (let i = 0; i < stateIds.length; i++) {
    const sid = stateIds[i];
    if (!visited.has(sid)) {
      visited.add(sid);
      stack.push(sid);
    }
  }

  while (stack.length > 0) {
    const current = stack.pop();
    const state = nfa.states.find(function(s) { return s.id === current; });
    if (!state) continue;

    const epsTransitions = state.transitions['ε'];
    if (epsTransitions) {
      for (let i = 0; i < epsTransitions.length; i++) {
        const next = epsTransitions[i];
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }
  }

  return visited;
}

/**
 * move：从状态集合出发，沿指定字符转移可到达的状态（不含 ）
 * @param {object} nfa
 * @param {number[]} stateIds
 * @param {string} char
 * @returns {number[]}
 */
function move(nfa, stateIds, char) {
  const result = [];
  const seen = new Set();

  for (let i = 0; i < stateIds.length; i++) {
    const state = nfa.states.find(function(s) { return s.id === stateIds[i]; });
    if (!state) continue;

    const transitions = state.transitions[char];
    if (transitions) {
      for (let j = 0; j < transitions.length; j++) {
        const tid = transitions[j];
        if (!seen.has(tid)) {
          seen.add(tid);
          result.push(tid);
        }
      }
    }
  }

  return result;
}

/**
 * NFA → DFA（子集构造法）
 * @param {object} nfa - { start: number, accept: number, states: [...] }
 * @returns {{ start: string, states: object[], alphabet: string[] }}
 *
 * DFAState 形状：
 *   { id: string, nfaStates: number[], transitions: { [char]: string }, isAccept: boolean }
 */
function nfaToDFA(nfa) {
  // Collect alphabet (all non-  transition keys)
  const alphabetSet = new Set();
  for (let i = 0; i < nfa.states.length; i++) {
    const state = nfa.states[i];
    const keys = Object.keys(state.transitions);
    for (let j = 0; j < keys.length; j++) {
      if (keys[j] !== 'ε') {
        alphabetSet.add(keys[j]);
      }
    }
  }
  const alphabet = Array.from(alphabetSet).sort();

  // DFA state naming: A, B, C, ...
  let dfaStateCount = 0;
  function nextDfaId() {
    const code = 65 + dfaStateCount; // 'A'.charCodeAt(0) = 65
    dfaStateCount++;
    return String.fromCharCode(code);
  }

  // Helper: check if any of the NFA states is an accept state
  function containsAccept(nfaStateIds) {
    for (let i = 0; i < nfaStateIds.length; i++) {
      const state = nfa.states.find(function(s) { return s.id === nfaStateIds[i]; });
      if (state && state.isAccept) return true;
    }
    return false;
  }

  // Key function: NFA state set → unique string key
  function setKey(stateSet) {
    const sorted = Array.from(stateSet).sort(function(a, b) { return a - b; });
    return sorted.join(',');
  }

  // Initial DFA state = ε-closure({nfa.start})
  const initClosure = epsilonClosure(nfa, [nfa.start]);
  const dfaStates = []; // { id, nfaStateIds, isAccept, transitions: {} }
  const stateMap = {};  // setKey → DFA state id

  const initId = nextDfaId();
  const initStates = Array.from(initClosure);
  const initDFA = {
    id: initId,
    nfaStates: initStates,
    transitions: {},
    isAccept: containsAccept(initStates)
  };
  dfaStates.push(initDFA);
  stateMap[setKey(initClosure)] = initId;

  // Process queue
  const queue = [initDFA];

  while (queue.length > 0) {
    const current = queue.shift();

    for (let i = 0; i < alphabet.length; i++) {
      const ch = alphabet[i];

      // move + epsilonClosure
      const moveResult = move(nfa, current.nfaStates, ch);
      if (moveResult.length === 0) continue; // no transition on this char

      const closure = epsilonClosure(nfa, moveResult);
      const key = setKey(closure);

      if (stateMap[key]) {
        // Already exists
        current.transitions[ch] = stateMap[key];
      } else {
        // Create new DFA state
        if (dfaStateCount >= DFA_STATE_LIMIT) {
          throw new Error(
            'DFA state limit exceeded (' + DFA_STATE_LIMIT + '). ' +
            'Please simplify your regex.'
          );
        }
        const newId = nextDfaId();
        const newStates = Array.from(closure);
        const newDFA = {
          id: newId,
          nfaStates: newStates,
          transitions: {},
          isAccept: containsAccept(newStates)
        };
        dfaStates.push(newDFA);
        stateMap[key] = newId;
        current.transitions[ch] = newId;
        queue.push(newDFA);
      }
    }
  }

  return {
    start: initId,
    states: dfaStates,
    alphabet: alphabet
  };
}

module.exports = {
  epsilonClosure: epsilonClosure,
  move: move,
  nfaToDFA: nfaToDFA
};
