const {
  parseRegex,
  regexToNFA,
  resetStateId,
  AST_LITERAL,
  AST_CONCAT,
  AST_ALT,
  AST_STAR,
  AST_PLUS,
  AST_OPTIONAL,
  AST_EPSILON
} = require('../../utils/regex-nfa');

// ── parseRegex ──

describe('parseRegex', () => {
  test('单字符', () => {
    const ast = parseRegex('a');
    expect(ast).toEqual({ type: AST_LITERAL, char: 'a' });
  });

  test('连接 ab', () => {
    const ast = parseRegex('ab');
    expect(ast.type).toBe(AST_CONCAT);
    expect(ast.left).toEqual({ type: AST_LITERAL, char: 'a' });
    expect(ast.right).toEqual({ type: AST_LITERAL, char: 'b' });
  });

  test('选择 a|b', () => {
    const ast = parseRegex('a|b');
    expect(ast.type).toBe(AST_ALT);
    expect(ast.left).toEqual({ type: AST_LITERAL, char: 'a' });
    expect(ast.right).toEqual({ type: AST_LITERAL, char: 'b' });
  });

  test('闭包 a*', () => {
    const ast = parseRegex('a*');
    expect(ast.type).toBe(AST_STAR);
    expect(ast.child).toEqual({ type: AST_LITERAL, char: 'a' });
  });

  test('可选 a?', () => {
    const ast = parseRegex('a?');
    expect(ast.type).toBe(AST_OPTIONAL);
    expect(ast.child).toEqual({ type: AST_LITERAL, char: 'a' });
  });

  test('加 a+', () => {
    const ast = parseRegex('a+');
    expect(ast.type).toBe(AST_PLUS);
    expect(ast.child).toEqual({ type: AST_LITERAL, char: 'a' });
  });

  test('空字符串返回 epsilon', () => {
    const ast = parseRegex('');
    expect(ast).toEqual({ type: AST_EPSILON });
  });

  test('分组 (a|b)*', () => {
    const ast = parseRegex('(a|b)*');
    expect(ast.type).toBe(AST_STAR);
    expect(ast.child.type).toBe(AST_ALT);
    expect(ast.child.left).toEqual({ type: AST_LITERAL, char: 'a' });
    expect(ast.child.right).toEqual({ type: AST_LITERAL, char: 'b' });
  });

  test('多重连接 abc', () => {
    const ast = parseRegex('abc');
    // Should be concat(a, concat(b, c)) -- right associative
    expect(ast.type).toBe(AST_CONCAT);
    expect(ast.left).toEqual({ type: AST_LITERAL, char: 'a' });
    expect(ast.right.type).toBe(AST_CONCAT);
    expect(ast.right.left).toEqual({ type: AST_LITERAL, char: 'b' });
    expect(ast.right.right).toEqual({ type: AST_LITERAL, char: 'c' });
  });

  test('转义字符 \\.', () => {
    const ast = parseRegex('\\.');
    expect(ast).toEqual({ type: AST_LITERAL, char: '.' });
  });

  test('转义括号 \\(', () => {
    const ast = parseRegex('\\(');
    expect(ast).toEqual({ type: AST_LITERAL, char: '(' });
  });

  test('错误：不匹配的左括号', () => {
    expect(() => parseRegex('(a')).toThrow('Unmatched opening parenthesis');
  });

  test('错误：不匹配的右括号', () => {
    expect(() => parseRegex('a)')).toThrow('Unmatched closing parenthesis');
  });

  test('错误：空选择', () => {
    expect(() => parseRegex('a|')).toThrow('Empty alternation');
  });

  test('错误：行尾反斜杠', () => {
    expect(() => parseRegex('a\\')).toThrow('Trailing backslash');
  });

  test('错误：操作符在开始', () => {
    expect(() => parseRegex('*a')).toThrow('Unexpected operator');
  });

  test('错误：非字符串输入', () => {
    expect(() => parseRegex(null)).toThrow('Input must be a string');
    expect(() => parseRegex(undefined)).toThrow('Input must be a string');
    expect(() => parseRegex(123)).toThrow('Input must be a string');
  });
});

// ── regexToNFA ──

describe('regexToNFA', () => {
  beforeEach(() => {
    resetStateId();
  });

  test('单字符 a 生成 2 个 NFA 状态', () => {
    const nfa = regexToNFA('a');
    expect(nfa.states.length).toBe(2);
    expect(nfa.start).not.toBe(nfa.accept);
  });

  test('单字符 a 有正确转移', () => {
    const nfa = regexToNFA('a');
    const startState = nfa.states.find(s => s.id === nfa.start);
    expect(startState.transitions['a']).toBeDefined();
    expect(startState.transitions['a'][0]).toBe(nfa.accept);
  });

  test('epsilon 空串 NFA', () => {
    const nfa = regexToNFA('');
    expect(nfa.states.length).toBe(2);
    const startState = nfa.states.find(s => s.id === nfa.start);
    expect(startState.transitions['ε']).toBeDefined();
    expect(startState.transitions['ε'][0]).toBe(nfa.accept);
  });

  test('连接 ab 生成正确状态数', () => {
    const nfa = regexToNFA('ab');
    // Each literal = 2 states, concat merges them via ε
    expect(nfa.states.length).toBeGreaterThanOrEqual(3);
  });

  test('选择 a|b 有 ε 分支', () => {
    const nfa = regexToNFA('a|b');
    const startState = nfa.states.find(s => s.id === nfa.start);
    expect(startState.transitions['ε']).toBeDefined();
    expect(startState.transitions['ε'].length).toBe(2);
  });

  test('闭包 a* 有 3 个状态', () => {
    const nfa = regexToNFA('a*');
    // a*: start(ε→child.start, ε→accept), child(2 states), accept
    expect(nfa.states.length).toBe(4);
    const startState = nfa.states.find(s => s.id === nfa.start);
    expect(startState.transitions['ε']).toBeDefined();
    expect(startState.transitions['ε'].length).toBe(2); // to child.start and to accept
  });

  test('闭包 a* 接受空串', () => {
    const nfa = regexToNFA('a*');
    const startState = nfa.states.find(s => s.id === nfa.start);
    // start has ε to accept
    expect(startState.transitions['ε']).toContain(nfa.accept);
  });

  test('可选 a? 有 ε 分支和 ε 到接受', () => {
    const nfa = regexToNFA('a?');
    const startState = nfa.states.find(s => s.id === nfa.start);
    expect(startState.transitions['ε']).toBeDefined();
    expect(startState.transitions['ε'].length).toBe(2);
    expect(startState.transitions['ε']).toContain(nfa.accept);
  });

  test('a+ 没有直接 ε 从 start 到 accept', () => {
    const nfa = regexToNFA('a+');
    const startState = nfa.states.find(s => s.id === nfa.start);
    // plus: start has ε to child.start but NOT directly to accept
    const epsTransitions = startState.transitions['ε'] || [];
    expect(epsTransitions).not.toContain(nfa.accept);
  });

  test('最终接受状态标记正确', () => {
    const nfa = regexToNFA('a');
    const acceptState = nfa.states.find(s => s.id === nfa.accept);
    expect(acceptState.isAccept).toBe(true);
    const startState = nfa.states.find(s => s.id === nfa.start);
    expect(startState.isAccept).toBe(false);
  });

  test('组合 (a|b)* 正确生成', () => {
    const nfa = regexToNFA('(a|b)*');
    expect(nfa.states.length).toBeGreaterThan(4);
  });

  test('非 ASCII 字符处理', () => {
    const nfa = regexToNFA('中');
    expect(nfa.states.length).toBe(2);
  });
});
