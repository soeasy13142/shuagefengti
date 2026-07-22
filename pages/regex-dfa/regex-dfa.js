const { parseRegex, regexToNFA, resetStateId } = require('../../utils/regex-nfa');
const { epsilonClosure, move, nfaToDFA } = require('../../utils/nfa-dfa');
const { simulateDFA } = require('../../utils/dfa-simulate');

// 预置示例
const PRESETS = [
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
    nfaDiagramStates: [],
    nfaArrows: [],

    dfa: null,
    dfaStatesList: [],
    dfaAlphabet: [],
    dfaTableRows: [],
    dfaTransitions: [],
    dfaDiagramStates: [],
    dfaArrows: [],

    subsetSteps: [],

    nfaStepIndex: 0,
    subsetStepIndex: 0,
    dfaStepIndex: 0,
    nfaTotalSteps: 0,
    subsetTotalSteps: 0,
    dfaTotalSteps: 0,

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
    const idx = parseInt(e.detail.value, 10);
    this.loadPreset(idx);
  },

  loadPreset: function(idx) {
    if (idx < 0 || idx >= PRESETS.length) return;
    const preset = PRESETS[idx];
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
      nfaDiagramStates: [],
      nfaArrows: [],
      dfa: null,
      dfaStatesList: [],
      dfaAlphabet: [],
      dfaTableRows: [],
      dfaTransitions: [],
      dfaDiagramStates: [],
      dfaArrows: [],
      subsetSteps: [],
      simResult: null
    });
  },

  onStepChange: function(e) {
    const step = parseInt(e.currentTarget.dataset.step, 10);
    this.setData({ activeStep: step });
  },

  // ── 步进控制 ──

  onStepPrev: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === 'nfa') {
      let idx = this.data.nfaStepIndex;
      if (idx > 0) {
        idx--;
        this.setData({ nfaStepIndex: idx });
        this._updateNFAHighlight(idx);
      }
    } else if (tab === 'subset') {
      let idx = this.data.subsetStepIndex;
      if (idx > 0) {
        idx--;
        this.setData({ subsetStepIndex: idx });
        this._updateSubsetHighlight(idx);
      }
    } else if (tab === 'dfa') {
      let idx = this.data.dfaStepIndex;
      if (idx > 0) {
        idx--;
        this.setData({ dfaStepIndex: idx });
        this._updateDFAHighlight(idx);
      }
    }
  },

  onStepNext: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === 'nfa') {
      let idx = this.data.nfaStepIndex;
      if (idx < this.data.nfaTotalSteps - 1) {
        idx++;
        this.setData({ nfaStepIndex: idx });
        this._updateNFAHighlight(idx);
      }
    } else if (tab === 'subset') {
      let idx = this.data.subsetStepIndex;
      if (idx < this.data.subsetTotalSteps - 1) {
        idx++;
        this.setData({ subsetStepIndex: idx });
        this._updateSubsetHighlight(idx);
      }
    } else if (tab === 'dfa') {
      let idx = this.data.dfaStepIndex;
      if (idx < this.data.dfaTotalSteps - 1) {
        idx++;
        this.setData({ dfaStepIndex: idx });
        this._updateDFAHighlight(idx);
      }
    }
  },

  _updateNFAHighlight: function(idx) {
    const arrows = this.data.nfaArrows.map(function(a, i) {
      return Object.assign({}, a, { isHighlight: i === idx });
    });
    // Find which states are involved in the current transition
    const highlightedFrom = idx >= 0 && idx < arrows.length ? arrows[idx].from : null;
    const highlightedTo = idx >= 0 && idx < arrows.length ? arrows[idx].to : null;
    const states = this.data.nfaDiagramStates.map(function(s) {
      return Object.assign({}, s, {
        isHighlighted: s.id === highlightedFrom || s.id === highlightedTo
      });
    });
    this.setData({ nfaArrows: arrows, nfaDiagramStates: states });
  },

  _updateSubsetHighlight: function(idx) {
    // Highlight current subset step by updating its visual
    const steps = this.data.subsetSteps.map(function(s, i) {
      return Object.assign({}, s, { isHighlight: i === idx });
    });
    this.setData({ subsetSteps: steps });
  },

  _updateDFAHighlight: function(idx) {
    const arrows = this.data.dfaArrows.map(function(a, i) {
      return Object.assign({}, a, { isHighlight: i === idx });
    });
    const highlightedFrom = idx >= 0 && idx < arrows.length ? arrows[idx].from : null;
    const highlightedTo = idx >= 0 && idx < arrows.length ? arrows[idx].to : null;
    const states = this.data.dfaDiagramStates.map(function(s) {
      return Object.assign({}, s, {
        isHighlighted: s.id === highlightedFrom || s.id === highlightedTo
      });
    });
    this.setData({ dfaArrows: arrows, dfaDiagramStates: states });
  },

  // ── 核心构造 ──

  doConstruct: function() {
    let regex = this.data.regex;
    if (!regex || regex.trim() === '') {
      this.setData({ errorMessage: '请输入正则表达式' });
      return;
    }
    regex = regex.trim();

    try {
      resetStateId();

      // Parse + NFA
      const nfa = regexToNFA(regex);

      // Build DFA
      const dfa = nfaToDFA(nfa);

      // Generate visualization data
      const nfaStates = this.buildNFAStateList(nfa);
      const nfaTransitions = this.buildNFATransitions(nfa);

      const subsetSteps = this.buildSubsetSteps(nfa, dfa);
      const dfaStatesList = this.buildDFAStateList(dfa);
      const dfaTableRows = this.buildDFATable(dfa);
      const dfaTransitions = this.buildDFATransitions(dfa);

      // Build diagram data
      const nfaLayout = this._computeLayoutFromStates(nfa.states, nfa.start);
      const nfaPositions = this._layoutToPositions(nfaLayout, nfa.states.length);
      const nfaDiagramStates = this._statesWithPositions(nfaStates, nfaPositions);
      const nfaArrows = this._buildArrows(nfaTransitions, nfaPositions);

      const dfaLayout = this._computeLayoutFromStates(dfa.states, dfa.start);
      const dfaPositions = this._layoutToPositions(dfaLayout, dfa.states.length);
      const dfaDiagramStates = this._statesWithPositions(dfaStatesList, dfaPositions);
      const dfaArrows = this._buildArrows(dfaTransitions, dfaPositions);

      const nfaArrowCount = nfaArrows.length;
      const dfaArrowCount = dfaArrows.length;
      const subsetCount = subsetSteps.length;

      this.setData({
        errorMessage: '',
        nfa: { start: nfa.start, accept: nfa.accept },
        nfaStates: nfaStates,
        nfaTransitions: nfaTransitions,
        nfaDiagramStates: nfaDiagramStates,
        nfaArrows: nfaArrows,
        dfa: { start: dfa.start, alphabet: dfa.alphabet },
        dfaStatesList: dfaStatesList,
        dfaAlphabet: dfa.alphabet,
        dfaTableRows: dfaTableRows,
        dfaTransitions: dfaTransitions,
        dfaDiagramStates: dfaDiagramStates,
        dfaArrows: dfaArrows,
        subsetSteps: subsetSteps,
        activeStep: 1,
        simResult: null,
        nfaStepIndex: 0,
        subsetStepIndex: 0,
        dfaStepIndex: 0,
        nfaTotalSteps: nfaArrowCount,
        subsetTotalSteps: subsetCount,
        dfaTotalSteps: dfaArrowCount
      });
      // Apply initial highlights
      if (nfaArrowCount > 0) this._updateNFAHighlight(0);
      if (subsetCount > 0) this._updateSubsetHighlight(0);
      if (dfaArrowCount > 0) this._updateDFAHighlight(0);
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
    const dfa = this.data.dfa;
    const testInput = this.data.testInput;
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
      const nfa = regexToNFA(this.data.regex);
      const fullDfa = nfaToDFA(nfa);
      const result = simulateDFA(fullDfa, testInput);
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
    const result = [];
    for (let i = 0; i < nfa.states.length; i++) {
      const s = nfa.states[i];
      result.push({
        id: s.id,
        isAccept: s.isAccept,
        isStart: s.id === nfa.start
      });
    }
    return result;
  },

  buildNFATransitions: function(nfa) {
    const result = [];
    for (let i = 0; i < nfa.states.length; i++) {
      const s = nfa.states[i];
      const keys = Object.keys(s.transitions);
      for (let j = 0; j < keys.length; j++) {
        const input = keys[j];
        const targets = s.transitions[input];
        for (let k = 0; k < targets.length; k++) {
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
    const steps = [];
    const seenKeys = {};

    // Initial state
    const initClosure = epsilonClosure(nfa, [nfa.start]);
    const initKey = this.closureToKey(initClosure);
    const initStr = this.closureToString(initClosure);
    seenKeys[initKey] = true;
    steps.push({
      label: '初始 DFA 状态 A',
      lines: [
        '-闭包({' + nfa.start + '}) = {' + initStr + '}',
        'isAccept = ' + dfa.states[0].isAccept
      ]
    });

    for (let si = 0; si < dfa.states.length; si++) {
      const ds = dfa.states[si];
      for (let ai = 0; ai < dfa.alphabet.length; ai++) {
        const ch = dfa.alphabet[ai];
        const nextId = ds.transitions[ch];
        if (!nextId) continue;

        // Find the NFA state set for this DFA state
        const moveResult = move(nfa, ds.nfaStates, ch);
        const closure = epsilonClosure(nfa, moveResult);
        const key = this.closureToKey(closure);
        if (!seenKeys[key]) {
          seenKeys[key] = true;
          const closureStr = this.closureToString(closure);
          const nextState = dfa.states.find(function(s) { return s.id === nextId; });
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
    const result = [];
    for (let i = 0; i < dfa.states.length; i++) {
      const ds = dfa.states[i];
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
    const rows = [];
    for (let i = 0; i < dfa.states.length; i++) {
      const ds = dfa.states[i];
      const transitions = [];
      for (let j = 0; j < dfa.alphabet.length; j++) {
        const ch = dfa.alphabet[j];
        const nextId = ds.transitions[ch];
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
    const result = [];
    for (let i = 0; i < dfa.states.length; i++) {
      const ds = dfa.states[i];
      const keys = Object.keys(ds.transitions);
      for (let j = 0; j < keys.length; j++) {
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
