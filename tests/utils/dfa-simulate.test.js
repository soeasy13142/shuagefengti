const { simulateDFA } = require('../../utils/dfa-simulate');
const { regexToNFA, resetStateId } = require('../../utils/regex-nfa');
const { nfaToDFA } = require('../../utils/nfa-dfa');

/**
 * Helper: build DFA from regex string
 */
function dfaFromRegex(regex) {
  resetStateId();
  const nfa = regexToNFA(regex);
  return nfaToDFA(nfa);
}

describe('simulateDFA', () => {
  test('a* 接受空串', () => {
    const dfa = dfaFromRegex('a*');
    const result = simulateDFA(dfa, '');
    expect(result.accepted).toBe(true);
    expect(result.path.length).toBe(0);
  });

  test('a* 接受 aaa', () => {
    const dfa = dfaFromRegex('a*');
    const result = simulateDFA(dfa, 'aaa');
    expect(result.accepted).toBe(true);
    expect(result.path.length).toBe(3);
  });

  test('a* 拒绝 b', () => {
    const dfa = dfaFromRegex('a*');
    expect(function() {
      simulateDFA(dfa, 'b');
    }).toThrow('not in the DFA alphabet');
  });

  test('a|b 接受 a', () => {
    const dfa = dfaFromRegex('a|b');
    const result = simulateDFA(dfa, 'a');
    expect(result.accepted).toBe(true);
  });

  test('a|b 接受 b', () => {
    const dfa = dfaFromRegex('a|b');
    const result = simulateDFA(dfa, 'b');
    expect(result.accepted).toBe(true);
  });

  test('a|b 拒绝 c', () => {
    const dfa = dfaFromRegex('a|b');
    expect(function() {
      simulateDFA(dfa, 'c');
    }).toThrow('not in the DFA alphabet');
  });

  test('a(b|c)* 接受 abcbc', () => {
    const dfa = dfaFromRegex('a(b|c)*');
    const result = simulateDFA(dfa, 'abcbc');
    expect(result.accepted).toBe(true);
  });

  test('a(b|c)* 拒绝空串', () => {
    const dfa = dfaFromRegex('a(b|c)*');
    const result = simulateDFA(dfa, '');
    expect(result.accepted).toBe(false);
  });

  test('路径记录完整', () => {
    const dfa = dfaFromRegex('ab');
    const result = simulateDFA(dfa, 'ab');
    expect(result.path.length).toBe(2);
    expect(result.path[0].char).toBe('a');
    expect(result.path[0].toState).toBeTruthy();
    expect(result.path[1].char).toBe('b');
    expect(result.path[1].toState).toBeTruthy();
  });

  test('路径包含 fromState 和 toState', () => {
    const dfa = dfaFromRegex('a');
    const result = simulateDFA(dfa, 'a');
    expect(result.path[0].fromState).toBe('A');
    expect(result.path[0].toState).toBe('B');
  });

  test('错误：非字符串输入', () => {
    const dfa = dfaFromRegex('a');
    expect(function() {
      simulateDFA(dfa, null);
    }).toThrow('Input must be a string');
    expect(function() {
      simulateDFA(dfa, undefined);
    }).toThrow('Input must be a string');
    expect(function() {
      simulateDFA(dfa, 123);
    }).toThrow('Input must be a string');
  });

  test('字母表外字符抛出错误', () => {
    const dfa = dfaFromRegex('a');
    expect(function() {
      simulateDFA(dfa, 'b');
    }).toThrow('not in the DFA alphabet');
  });
});
