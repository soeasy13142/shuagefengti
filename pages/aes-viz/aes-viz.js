const { hexToBytes, bytesToHex, sBox } = require('../../utils/aes-core');
const { bytesToState, stateToBytes, subBytes, shiftRows, mixColumns, addRoundKey } = require('../../utils/aes-state');
const { keyExpansion, getRoundKey, keyExpansionWithSteps } = require('../../utils/aes-key-expansion');

const STEP_NAMES = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const PRESETS = [
  { name: 'FIPS 197 标准向量', pt: '00112233445566778899aabbccddeeff', key: '000102030405060708090a0b0c0d0e0f' },
  { name: '全零', pt: '00000000000000000000000000000000', key: '00000000000000000000000000000000' },
  { name: '全 0xFF', pt: 'ffffffffffffffffffffffffffffffff', key: 'ffffffffffffffffffffffffffffffff' }
];

Page({
  data: {
    hexPlaintext: '',
    hexKey: '',
    presetIndex: 0,
    presetRange: ['FIPS 197 标准向量', '全零', '全 0xFF'],
    inputError: '',
    hasComputed: false,
    currentRound: 0,
    currentStep: 0,
    totalRounds: 10,
    trace: [],
    keyTrace: null,
    showKeyExpansion: false,
    currentStepName: '',
    ciphertextHex: '',
    initialRoundKey: '',

    // Precomputed matrix display data
    matrixCells: [],
    stepSequence: [],
    sboxDisplay: [],
    mixcolDisplay: [],
    shiftRowInfo: [],
    roundKeyDisplay: '',
    keyWordsDisplay: []
  },

  onLoad: function() {
    this._applyPreset(0);
  },

  // ── 预设 ──

  onPresetChange: function(e) {
    const idx = Number(e.detail.value);
    this._applyPreset(idx);
  },

  _applyPreset: function(idx) {
    const preset = PRESETS[idx] || PRESETS[0];
    this.setData({
      hexPlaintext: preset.pt,
      hexKey: preset.key,
      presetIndex: idx,
      inputError: '',
      hasComputed: false
    });
  },

  // ── 输入 ──

  onPlaintextInput: function(e) {
    this.setData({ hexPlaintext: e.detail.value, inputError: '' });
  },

  onKeyInput: function(e) {
    this.setData({ hexKey: e.detail.value, inputError: '' });
  },

  _validateInput: function(text) {
    const cleaned = text.replace(/\s+/g, '');
    if (cleaned.length === 0) return '请输入十六进制数据';
    if (cleaned.length !== 32) return '需要 32 个十六进制字符（16 字节）';
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) return '包含非法十六进制字符';
    return '';
  },

  // ── 格式化 ──

  _fmtHex: function(b) {
    return (b < 16 ? '0' : '') + b.toString(16);
  },

  _fmtWord: function(w) {
    if (!w) return '';
    return w.map(function(b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(' ');
  },

  _makeMatrixCells: function(stateBytes, modifiedRowCols) {
    if (!stateBytes) return [];
    const modSet = {};
    if (modifiedRowCols) {
      modifiedRowCols.forEach(function(m) {
        modSet[m.row * 4 + m.col] = true;
      });
    }
    const cells = [];
    // Column-major: iterate col then row to build visual grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const idx = col * 4 + row;
        const hex = this._fmtHex(stateBytes[idx]);
        const isMod = !!modSet[row * 4 + col];
        cells.push({
          hex: hex,
          isModified: isMod,
          row: row,
          col: col
        });
      }
    }
    return cells;
  },

  // ── 加密 ──

  onEncryptTap: function() {
    const ptErr = this._validateInput(this.data.hexPlaintext);
    if (ptErr) {
      this.setData({ inputError: '明文: ' + ptErr });
      return;
    }
    const keyErr = this._validateInput(this.data.hexKey);
    if (keyErr) {
      this.setData({ inputError: '密钥: ' + keyErr });
      return;
    }

    try {
      this._computeAes();
    } catch (e) {
      this.setData({ inputError: '计算失败: ' + e.message });
    }
  },

  onResetTap: function() {
    this._applyPreset(this.data.presetIndex);
    this.setData({
      hasComputed: false,
      trace: [],
      keyTrace: null,
      currentRound: 0,
      currentStep: 0,
      currentStepName: '',
      ciphertextHex: '',
      initialRoundKey: '',
      matrixCells: [],
      stepSequence: [],
      sboxDisplay: [],
      mixcolDisplay: [],
      shiftRowInfo: [],
      roundKeyDisplay: '',
      keyWordsDisplay: []
    });
  },

  _computeAes: function() {
    const plaintext = hexToBytes(this.data.hexPlaintext);
    const key = hexToBytes(this.data.hexKey);
    const w = keyExpansion(key);
    const keyTrace = keyExpansionWithSteps(key);

    // Compute full trace
    const trace = [];
    let state = bytesToState(plaintext);

    // Round 0: Initial AddRoundKey (plaintext XOR round key 0)
    const roundKey0 = getRoundKey(w, 0);
    const afterARK0 = addRoundKey(state, roundKey0);
    const arkBytes0 = stateToBytes(afterARK0);
    const beforeBytes0 = stateToBytes(state);

    trace.push({
      round: 0,
      beforeBytes: beforeBytes0,
      arkBytes: arkBytes0,
      roundKey: roundKey0
    });

    state = afterARK0;

    for (let round = 1; round <= 10; round++) {
      const roundKey = getRoundKey(w, round);

      // Before round
      const beforeBytes = stateToBytes(state);

      // Step 1: SubBytes
      const afterSB = subBytes(state);
      const sbBytes = stateToBytes(afterSB);

      // Step 2: ShiftRows
      const afterSR = shiftRows(afterSB);
      const srBytes = stateToBytes(afterSR);

      // Step 3: MixColumns (skip for round 10)
      let mcBytes;
      let mixColDetails = null;
      if (round < 10) {
        const afterMC = mixColumns(afterSR);
        mcBytes = stateToBytes(afterMC);
        mixColDetails = this._buildMixColDetail(afterSR, afterMC);
      } else {
        mcBytes = srBytes;
      }

      // Step 4: AddRoundKey
      const afterARK = addRoundKey(bytesToState(mcBytes), roundKey);
      const arkBytes = stateToBytes(afterARK);

      // S-box details for SubBytes
      const sBoxDetails = this._buildSBoxDetail(state, afterSB);

      trace.push({
        round: round,
        beforeBytes: beforeBytes,
        sbBytes: sbBytes,
        srBytes: srBytes,
        mcBytes: mcBytes,
        arkBytes: arkBytes,
        roundKey: roundKey,
        sBoxDetails: sBoxDetails,
        mixColDetails: mixColDetails
      });

      state = afterARK;
    }

    const ciphertext = bytesToHex(stateToBytes(state));
    const initialRoundKeyBytes = this._fmtWord(roundKey0);

    this.setData({
      trace: trace,
      keyTrace: keyTrace,
      hasComputed: true,
      currentRound: 0,
      currentStep: 0,
      ciphertextHex: ciphertext,
      initialRoundKey: initialRoundKeyBytes
    });

    this._renderCurrentStep();
  },

  _buildSBoxDetail: function(before, after) {
    const detail = [];
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        detail.push({
          row: row,
          col: col,
          before: before[row][col],
          after: after[row][col]
        });
      }
    }
    return detail;
  },

  _buildMixColDetail: function(before, after) {
    const details = [];
    for (let col = 0; col < 4; col++) {
      details.push({
        col: col,
        inputs: [before[0][col], before[1][col], before[2][col], before[3][col]],
        outputs: [after[0][col], after[1][col], after[2][col], after[3][col]]
      });
    }
    return details;
  },

  // ── 步进控制 ──

  onPrevRound: function() {
    if (this.data.currentRound <= 0) return;
    this.setData({ currentRound: this.data.currentRound - 1, currentStep: 0 });
    this._renderCurrentStep();
  },

  onNextRound: function() {
    if (this.data.currentRound >= 10) return;
    this.setData({ currentRound: this.data.currentRound + 1, currentStep: 0 });
    this._renderCurrentStep();
  },

  onPrevStep: function() {
    const round = this.data.currentRound;
    const step = this.data.currentStep;
    if (round === 0) return; // Round 0 has no sub-steps
    if (step > 0) {
      this.setData({ currentStep: step - 1 });
      this._renderCurrentStep();
    }
  },

  onNextStep: function() {
    const round = this.data.currentRound;
    const step = this.data.currentStep;
    if (round === 0) return; // Round 0 has no sub-steps
    if (step < 3) {
      this.setData({ currentStep: step + 1 });
      this._renderCurrentStep();
    }
  },

  _renderCurrentStep: function() {
    const round = this.data.currentRound;
    const step = this.data.currentStep;
    const trace = this.data.trace;
    if (!trace || trace.length === 0) return;

    // trace is now 0-indexed: trace[0] = Round 0, trace[1..10] = Rounds 1-10
    const entry = trace[round];
    if (!entry) return;

    let stateBytes;
    let modifiedRowCols = [];
    let sboxDisplay = [];
    let mixcolDisplay = [];
    let shiftRowInfo = [];
    let roundKeyDisplay = '';

    if (round === 0) {
      // Round 0: initial AddRoundKey (single operation)
      stateBytes = entry.arkBytes;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          modifiedRowCols.push({ row: row, col: col });
        }
      }
      roundKeyDisplay = this._fmtWord(entry.roundKey);
    } else if (step === 0) {
      // SubBytes: show before state, all cells modified
      stateBytes = entry.beforeBytes;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          modifiedRowCols.push({ row: row, col: col });
        }
      }
      // Build S-box display
      if (entry.sBoxDetails) {
        sboxDisplay = entry.sBoxDetails.map(function(d) {
          return {
            beforeHex: (d.before < 16 ? '0' : '') + d.before.toString(16),
            afterHex: (d.after < 16 ? '0' : '') + d.after.toString(16)
          };
        });
      }
    } else if (step === 1) {
      // ShiftRows: show state after SubBytes
      stateBytes = entry.sbBytes;
      // Rows 1-3 have shifted cells
      for (let col = 0; col < 4; col++) {
        modifiedRowCols.push({ row: 1, col: col });
        modifiedRowCols.push({ row: 2, col: col });
        modifiedRowCols.push({ row: 3, col: col });
      }
      shiftRowInfo = [
        '第 0 行不移位',
        '第 1 行循环左移 1 字节',
        '第 2 行循环左移 2 字节',
        '第 3 行循环左移 3 字节'
      ];
    } else if (step === 2) {
      // MixColumns
      stateBytes = entry.srBytes;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          modifiedRowCols.push({ row: row, col: col });
        }
      }
      if (entry.mixColDetails) {
        mixcolDisplay = entry.mixColDetails.map(function(mc) {
          return {
            col: mc.col,
            inputHexes: mc.inputs.map(function(b) { return (b < 16 ? '0' : '') + b.toString(16); }),
            outputHexes: mc.outputs.map(function(b) { return (b < 16 ? '0' : '') + b.toString(16); })
          };
        });
      }
    } else {
      // AddRoundKey
      stateBytes = entry.arkBytes;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          modifiedRowCols.push({ row: row, col: col });
        }
      }
      roundKeyDisplay = this._fmtWord(entry.roundKey);
    }

    // Build step sequence
    let stepSequence;
    if (round === 0) {
      stepSequence = STEP_NAMES.map(function(name, i) {
        return {
          name: name,
          active: i === 3, // Only AddRoundKey is active for round 0
          done: i === 3
        };
      });
    } else {
      stepSequence = STEP_NAMES.map(function(name, i) {
        return {
          name: name,
          active: i === step,
          done: i < step
        };
      });
    }

    // Build key words display
    const keyWordsDisplay = [];
    if (this.data.keyTrace) {
      this.data.keyTrace.steps.forEach(function(s) {
        keyWordsDisplay.push({
          index: s.index,
          type: s.type === 'initial' ? '初始' : s.type === 'rotSubRcon' ? 'RotWord+SubWord+Rcon' : '直接 XOR',
          hex: s.output.map(function(b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(' '),
          inputHex: s.type !== 'initial' ? s.input.map(function(b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(' ') : '',
          rotatedHex: s.rotatedWord ? s.rotatedWord.map(function(b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(' ') : '',
          subWordHex: s.substitutedWord ? s.substitutedWord.map(function(b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(' ') : '',
          rconHex: s.rcon ? s.rcon.map(function(b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(' ') : '',
          isSpecial: s.type === 'rotSubRcon'
        });
      });
    }

    const currentTitle = round === 0
      ? 'Round 0: AddRoundKey（初始密钥）'
      : currentStepName + ' · 第 ' + round + ' 轮';

    this.setData({
      currentStateBytes: stateBytes,
      currentStepName: round === 0 ? 'AddRoundKey（初始密钥）' : STEP_NAMES[step],
      currentTitle: currentTitle,
      matrixCells: this._makeMatrixCells(stateBytes, modifiedRowCols),
      stepSequence: stepSequence,
      sboxDisplay: sboxDisplay,
      mixcolDisplay: mixcolDisplay,
      shiftRowInfo: shiftRowInfo,
      roundKeyDisplay: roundKeyDisplay,
      keyWordsDisplay: keyWordsDisplay
    });
  },

  // ── 密钥扩展面板 ──

  onToggleKeyExpansion: function() {
    this.setData({ showKeyExpansion: !this.data.showKeyExpansion });
  }
});
