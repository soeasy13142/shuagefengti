const { parseRegex, regexToNFA, resetStateId } = require('../../utils/regex-nfa');
const { epsilonClosure, move, nfaToDFA } = require('../../utils/nfa-dfa');
const { simulateDFA } = require('../../utils/dfa-simulate');

// 预置示例
var PRESETS = [
  { label: '（自定义输入）', regex: '' },
  { label: 'a*', regex: 'a*' },
  { label: 'a|b', regex: 'a|b' },
  { label: 'ab', regex: 'ab' },
  { label: 'a(b|c)*', regex: 'a(b|c)*' },
  { label: '(a|b)*abb', regex: '(a|b)*abb' },
  { label: 'a+', regex: 'a+' },
  { label: 'a?', regex: 'a?' }
];

Page({
  data: {
    regex: 'a*',
    presetLabels: PRESETS.map(function(p) { return p.label; }),
    presetIndex: 1,
    errorMessage: '',
    activeStep: 1,

    nfa: null,
    nfaStates: [],
    nfaTransitions: [],

    dfa: null,
    dfaStatesList: [],
    dfaAlphabet: [],
    dfaTableRows: [],
    dfaTransitions: [],

    subsetSteps: [],

    testInput: '',
    simResult: null
  },

  onLoad: function() {
    this.loadPreset(1);
  },

  // ── 输入事件 ──

  onRegexInput: function(e) {
    this.setData({
      regex: e.detail.value,
      presetIndex: 0,
      errorMessage: ''
    });
  },

  onTestInput: function(e) {
    this.setData({ testInput: e.detail.value });
  },

  onPresetChange: function(e) {
    var idx = parseInt(e.detail.value, 10);
    this.loadPreset(idx);
  },

  loadPreset: function(idx) {
    if (idx < 0 || idx >= PRESETS.length) return;
    var preset = PRESETS[idx];
    this.setData({
      regex: preset.regex,
      presetIndex: idx,
      errorMessage: '',
      simResult: null,
      testInput: ''
    });
    if (preset.regex) {
      this.doConstruct();
    }
  },

  onConstruct: function() {
    this.doConstruct();
  },

  onClear: function() {
    this.setData({
      regex: '',
      presetIndex: 0,
      errorMessage: '',
      nfa: null,
      nfaStates: [],
      nfaTransitions: [],
      dfa: null,
      dfaStatesList: [],
      dfaAlphabet: [],
      dfaTableRows: [],
      dfaTransitions: [],
      subsetSteps: [],
      simResult: null
    });
  },

  onStepChange: function(e) {
    var step = parseInt(e.currentTarget.dataset.step, 10);
    this.setData({ activeStep: step });
  },

  // ── 核心构造 ──

  doConstruct: function() {
    var regex = this.data.regex;
    if (!regex || regex.trim() === '') {
      this.setData({ errorMessage: '请输入正则表达式' });
      return;
    }
    regex = regex.trim();

    try {
      resetStateId();

      // Parse + NFA
      var nfa = regexToNFA(regex);

      // Build DFA
      var dfa = nfaToDFA(nfa);

      // Generate visualization data
      var nfaStates = this.buildNFAStateList(nfa);
      var nfaTransitions = this.buildNFATransitions(nfa);

      var subsetSteps = this.buildSubsetSteps(nfa, dfa);
      var dfaStatesList = this.buildDFAStateList(dfa);
      var dfaTableRows = this.buildDFATable(dfa);
      var dfaTransitions = this.buildDFATransitions(dfa);

      this.setData({
        errorMessage: '',
        nfa: { start: nfa.start, accept: nfa.accept },
        nfaStates: nfaStates,
        nfaTransitions: nfaTransitions,
        dfa: { start: dfa.start, alphabet: dfa.alphabet },
        dfaStatesList: dfaStatesList,
        dfaAlphabet: dfa.alphabet,
        dfaTableRows: dfaTableRows,
        dfaTransitions: dfaTransitions,
        subsetSteps: subsetSteps,
        activeStep: 1,
        simResult: null
      });
    } catch (e) {
      this.setData({
        errorMessage: e.message || '构造失败',
        nfa: null,
        dfa: null
      });
    }
  },

  // ── 模拟运行 ──

  onSimulate: function() {
    var dfa = this.data.dfa;
    var testInput = this.data.testInput;
    if (!dfa) {
      this.setData({ errorMessage: '请先构造 DFA' });
      return;
    }
    if (!testInput || testInput.trim() === '') {
      this.setData({ errorMessage: '请输入测试串' });
      return;
    }
    try {
      // Rebuild DFA object with full states
      resetStateId();
      var nfa = regexToNFA(this.data.regex);
      var fullDfa = nfaToDFA(nfa);
      var result = simulateDFA(fullDfa, testInput);
      this.setData({
        errorMessage: '',
        simResult: {
          accepted: result.accepted,
          path: result.path
        }
      });
    } catch (e) {
      this.setData({ errorMessage: e.message || '模拟失败' });
    }
  },

  // ── 数据转换 ──

  buildNFAStateList: function(nfa) {
    var result = [];
    for (var i = 0; i < nfa.states.length; i++) {
      var s = nfa.states[i];
      result.push({
        id: s.id,
        isAccept: s.isAccept,
        isStart: s.id === nfa.start
      });
    }
    return result;
  },

  buildNFATransitions: function(nfa) {
    var result = [];
    for (var i = 0; i < nfa.states.length; i++) {
      var s = nfa.states[i];
      var keys = Object.keys(s.transitions);
      for (var j = 0; j < keys.length; j++) {
        var input = keys[j];
        var targets = s.transitions[input];
        for (var k = 0; k < targets.length; k++) {
          result.push({
            from: s.id,
            input: input,
            to: targets[k]
          });
        }
      }
    }
    return result;
  },

  buildSubsetSteps: function(nfa, dfa) {
    var steps = [];
    var seenKeys = {};

    // Initial state
    var initClosure = epsilonClosure(nfa, [nfa.start]);
    var initKey = this.closureToKey(initClosure);
    var initStr = this.closureToString(initClosure);
    seenKeys[initKey] = true;
    steps.push({
      label: '初始 DFA 状态 A',
      lines: [
        '-闭包({' + nfa.start + '}) = {' + initStr + '}',
        'isAccept = ' + dfa.states[0].isAccept
      ]
    });

    for (var si = 0; si < dfa.states.length; si++) {
      var ds = dfa.states[si];
      for (var ai = 0; ai < dfa.alphabet.length; ai++) {
        var ch = dfa.alphabet[ai];
        var nextId = ds.transitions[ch];
        if (!nextId) continue;

        // Find the NFA state set for this DFA state
        var moveResult = move(nfa, ds.nfaStates, ch);
        var closure = epsilonClosure(nfa, moveResult);
        var key = this.closureToKey(closure);
        if (!seenKeys[key]) {
          seenKeys[key] = true;
          var closureStr = this.closureToString(closure);
          var nextState = dfa.states.find(function(s) { return s.id === nextId; });
          steps.push({
            label: 'DFA 状态 ' + nextId + '（来自 ' + ds.id + ' ─' + ch + '→）',
            lines: [
              'move({' + ds.nfaStates.join(',') + '}, ' + ch + ') = {' + moveResult.join(',') + '}',
              '-闭包(...) = {' + closureStr + '}',
              'isAccept = ' + (nextState ? nextState.isAccept : false)
            ]
          });
        }
      }
    }

    return steps;
  },

  closureToKey: function(closureSet) {
    return Array.from(closureSet).sort(function(a, b) { return a - b; }).join(',');
  },

  closureToString: function(closureSet) {
    return Array.from(closureSet).sort(function(a, b) { return a - b; }).join(', ');
  },

  buildDFAStateList: function(dfa) {
    var result = [];
    for (var i = 0; i < dfa.states.length; i++) {
      var ds = dfa.states[i];
      result.push({
        id: ds.id,
        isAccept: ds.isAccept,
        isStart: ds.id === dfa.start,
        nfaSummary: '{' + ds.nfaStates.join(',') + '}'
      });
    }
    return result;
  },

  buildDFATable: function(dfa) {
    var rows = [];
    for (var i = 0; i < dfa.states.length; i++) {
      var ds = dfa.states[i];
      var transitions = [];
      for (var j = 0; j < dfa.alphabet.length; j++) {
        var ch = dfa.alphabet[j];
        var nextId = ds.transitions[ch];
        transitions.push(nextId || '-');
      }
      rows.push({
        state: ds.id,
        isStart: ds.id === dfa.start,
        isAccept: ds.isAccept,
        transitions: transitions
      });
    }
    return rows;
  },

  buildDFATransitions: function(dfa) {
    var result = [];
    for (var i = 0; i < dfa.states.length; i++) {
      var ds = dfa.states[i];
      var keys = Object.keys(ds.transitions);
      for (var j = 0; j < keys.length; j++) {
        result.push({
          from: ds.id,
          input: keys[j],
          to: ds.transitions[keys[j]]
        });
      }
    }
    return result;
  }
});
