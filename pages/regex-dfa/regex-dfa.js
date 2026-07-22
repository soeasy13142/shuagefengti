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
    simResult: null,

    // 引导弹窗
    showRegexIntro: false,
    regexIntroContent: [
      {
        icon: '📝',
        title: '输入正则',
        body: '在输入框中输入正则表达式。\n支持语法：*（克林闭包）、|（选择）、.（连接）、()（分组）、?（可选）、+（一次或多次）\n\n例如：a(b|c)* 或 (01)*1'
      },
      {
        icon: '🔄',
        title: 'Thompson 构造法',
        body: '工具会自动将正则表达式转化为 NFA（非确定性有限自动机）。\n展示每个子表达式的 NFA 片段如何组合。\n\n你可以看到 ε-转移、状态编号和转移标签。'
      },
      {
        icon: '📊',
        title: '子集构造 → DFA',
        body: 'NFA 通过子集构造法转化为 DFA（确定性有限自动机）。\n逐步骤展示：ε-闭包 → move 转移 → 新 DFA 状态。\n\n完成后可以看到 DFA 状态图和转移表。'
      },
      {
        icon: '▶️',
        title: '模拟运行',
        body: '在「测试输入」框中输入字符串，点击运行。\n工具会逐字符追踪 DFA 的转移路径。\n\n绿色路径 = 接受（匹配），红色路径 = 拒绝（不匹配）。'
      }
    ]
  },

  onLoad: function() {
    this.loadPreset(1);
    var showIntro = false;
    try {
      showIntro = !wx.getStorageSync('intro_seen_regex_dfa');
    } catch(e) {}
    this.setData({ showRegexIntro: showIntro });
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

      var arrowCount = nfaArrows.length;
      var dArrowCount = dfaArrows.length;
      var subCount = subsetSteps.length;

      // Apply initial highlights (before setData to avoid async timing)
      var initNfaArrows = arrowCount > 0 ? nfaArrows.map(function(a, i) {
        return Object.assign({}, a, { isHighlight: i === 0 });
      }) : nfaArrows;
      var initDfaArrows = dArrowCount > 0 ? dfaArrows.map(function(a, i) {
        return Object.assign({}, a, { isHighlight: i === 0 });
      }) : dfaArrows;
      var initSubsetSteps = subCount > 0 ? subsetSteps.map(function(s, i) {
        return Object.assign({}, s, { isHighlight: i === 0 });
      }) : subsetSteps;
      var initNfaStates = arrowCount > 0 ? nfaDiagramStates.map(function(s) {
        var involved = s.id === nfaArrows[0].from || s.id === nfaArrows[0].to;
        return Object.assign({}, s, { isHighlighted: involved });
      }) : nfaDiagramStates.map(function(s) {
        return Object.assign({}, s, { isHighlighted: false });
      });
      var initDfaStates = dArrowCount > 0 ? dfaDiagramStates.map(function(s) {
        var involved = s.id === dfaArrows[0].from || s.id === dfaArrows[0].to;
        return Object.assign({}, s, { isHighlighted: involved });
      }) : dfaDiagramStates.map(function(s) {
        return Object.assign({}, s, { isHighlighted: false });
      });

      this.setData({
        errorMessage: '',
        nfa: { start: nfa.start, accept: nfa.accept },
        nfaStates: nfaStates,
        nfaTransitions: nfaTransitions,
        nfaDiagramStates: initNfaStates,
        nfaArrows: initNfaArrows,
        dfa: { start: dfa.start, alphabet: dfa.alphabet },
        dfaStatesList: dfaStatesList,
        dfaAlphabet: dfa.alphabet,
        dfaTableRows: dfaTableRows,
        dfaTransitions: dfaTransitions,
        dfaDiagramStates: initDfaStates,
        dfaArrows: initDfaArrows,
        subsetSteps: initSubsetSteps,
        activeStep: 1,
        simResult: null,
        nfaStepIndex: 0,
        subsetStepIndex: 0,
        dfaStepIndex: 0,
        nfaTotalSteps: arrowCount,
        subsetTotalSteps: subCount,
        dfaTotalSteps: dArrowCount
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
  },

  // ── 状态图布局 ──

  _computeLayoutFromStates: function(states, startId) {
    // BFS layering: group states into layers by distance from start
    const adj = {};
    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      adj[s.id] = new Set();
      if (!s.transitions) continue;
      var keys = Object.keys(s.transitions);
      for (let j = 0; j < keys.length; j++) {
        var targets = s.transitions[keys[j]];
        if (Array.isArray(targets)) {
          for (let k = 0; k < targets.length; k++) {
            adj[s.id].add(targets[k]);
          }
        } else {
          // DFA style: single target
          adj[s.id].add(targets);
        }
      }
    }

    // BFS
    const layers = [];
    const visited = new Set();
    var queue = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      layers.push(queue.slice());
      var nextQueue = [];
      for (let qi = 0; qi < queue.length; qi++) {
        var sid = queue[qi];
        var neighbors = adj[sid] || new Set();
        var neighborArr = [];
        neighbors.forEach(function(n) { neighborArr.push(n); });
        for (let ni = 0; ni < neighborArr.length; ni++) {
          if (!visited.has(neighborArr[ni])) {
            visited.add(neighborArr[ni]);
            nextQueue.push(neighborArr[ni]);
          }
        }
      }
      queue = nextQueue;
    }

    // Add any unvisited states
    for (let i = 0; i < states.length; i++) {
      if (!visited.has(states[i].id)) {
        layers.push([states[i].id]);
        visited.add(states[i].id);
      }
    }

    return layers;
  },

  _layoutToPositions: function(layers, stateCount) {
    var DIAGRAM_W = 640;
    var DIAGRAM_H = 320;
    var positions = {};
    var numLayers = layers.length;

    for (var li = 0; li < numLayers; li++) {
      var layer = layers[li];
      var x = DIAGRAM_W * (li + 1) / (numLayers + 1);
      var yStep = DIAGRAM_H / (layer.length + 1);
      for (var si = 0; si < layer.length; si++) {
        var y = yStep * (si + 1);
        positions[layer[si]] = { x: Math.round(x), y: Math.round(y) };
      }
    }

    return positions;
  },

  _statesWithPositions: function(stateList, positions) {
    return stateList.map(function(s) {
      var pos = positions[s.id] || { x: 0, y: 0 };
      return Object.assign({}, s, {
        x: pos.x,
        y: pos.y,
        isHighlighted: false
      });
    });
  },

  _buildArrows: function(transitions, positions) {
    var STATE_R = 33;
    var arrows = [];

    for (var ti = 0; ti < transitions.length; ti++) {
      var t = transitions[ti];
      if (t.from === t.to) continue; // skip self-loops for diagram simplicity

      var src = positions[t.from];
      var dst = positions[t.to];
      if (!src || !dst) continue;

      var dx = dst.x - src.x;
      var dy = dst.y - src.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;

      var angle = Math.atan2(dy, dx);

      // Adjust for multiple arrows between same pair
      var multiKey = t.from < t.to ? t.from + '-' + t.to : t.to + '-' + t.from;
      var startX = src.x + STATE_R * Math.cos(angle);
      var startY = src.y + STATE_R * Math.sin(angle);
      var endX = dst.x - STATE_R * Math.cos(angle);
      var endY = dst.y - STATE_R * Math.sin(angle);

      var lineLen = Math.sqrt((endX - startX) * (endX - startX) + (endY - startY) * (endY - startY));
      if (lineLen < 5) continue;

      var midX = (startX + endX) / 2;
      var midY = (startY + endY) / 2;

      arrows.push({
        key: t.from + '->' + t.to + '-' + t.input,
        from: t.from,
        to: t.to,
        input: t.input,
        isEpsilon: t.input === 'ε',
        isHighlight: false,
        x: Math.round(startX),
        y: Math.round(startY),
        len: Math.round(lineLen),
        deg: angle * 180 / Math.PI,
        headX: Math.round(endX),
        headY: Math.round(endY),
        labelX: Math.round(midX),
        labelY: Math.round(midY - 20)
      });
    }

    return arrows;
  },

  // ── 引导弹窗 ──

  onRegexIntroClose: function() {
    this.setData({ showRegexIntro: false });
    try { wx.setStorageSync('intro_seen_regex_dfa', true); } catch(e) {}
  }
});
