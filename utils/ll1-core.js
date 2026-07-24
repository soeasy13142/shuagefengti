/**
 * LL(1) 核心算法模块
 *
 * 计算 FIRST/FOLLOW 集、构造预测分析表、执行预测分析。
 * 所有函数为纯函数，无副作用。
 */

const EPSILON = 'ε';
const END_MARKER = '$';
const MAX_ITERATIONS = 100;

/**
 * Compute FIRST sets for all symbols in grammar.
 * @param {Object} grammar - Grammar from parseGrammar()
 * @returns {{ FIRST: Object<string, Set<string>> }}
 * @throws {Error} If fixed-point iteration does not converge
 */
function computeFIRST(grammar) {
  const FIRST = {};
  const nonTerminals = grammar.nonTerminals;
  const terminals = grammar.terminals;
  const productions = grammar.productions;

  // Initialize: terminals have FIRST = {terminal}
  nonTerminals.forEach(function(nt) {
    FIRST[nt] = new Set();
  });
  terminals.forEach(function(t) {
    FIRST[t] = new Set([t]);
  });

  let changed = true;
  let iterations = 0;

  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;

    for (let i = 0; i < productions.length; i++) {
      const prod = productions[i];
      const lhs = prod.lhs;
      const rhs = prod.rhs;

      const firstRHS = _computeFIRSTOfSequence(rhs, FIRST, nonTerminals);

      const newSet = new Set(FIRST[lhs]);
      firstRHS.forEach(function(sym) {
        newSet.add(sym);
      });
      if (newSet.size !== FIRST[lhs].size) {
        FIRST[lhs] = newSet;
        changed = true;
      }
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    throw new Error('FIRST 计算未收敛（超过 ' + MAX_ITERATIONS + ' 轮迭代）');
  }

  return { FIRST: FIRST };
}

/**
 * Compute FIRST set of a symbol sequence.
 * @param {string[]} symbols
 * @param {Object} FIRST - FIRST sets for individual symbols
 * @param {Set<string>} nonTerminals
 * @returns {Set<string>}
 */
function _computeFIRSTOfSequence(symbols, FIRST, nonTerminals) {
  const result = new Set();
  let allNullable = true;

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    const symFirst = FIRST[sym];

    if (!symFirst) {
      // Unknown symbol — treat as terminal
      result.add(sym);
      allNullable = false;
      break;
    }

    symFirst.forEach(function(s) {
      if (s !== EPSILON) {
        result.add(s);
      }
    });

    if (!symFirst.has(EPSILON)) {
      allNullable = false;
      break;
    }
  }

  if (allNullable) {
    result.add(EPSILON);
  }

  return result;
}

/**
 * Process one RHS symbol's contribution to FOLLOW sets.
 * @param {string} B - Current non-terminal in RHS
 * @param {string[]} beta - Symbols after B in the RHS
 * @param {string} lhs - Left-hand side of the production
 * @param {Object} FOLLOW - FOLLOW sets (mutated in-place during fixed-point)
 * @param {Object} FIRST - FIRST sets
 * @param {Set<string>} nonTerminals
 * @returns {boolean} Whether FOLLOW was modified
 */
function _updateFOLLOWForSymbol(B, beta, lhs, FOLLOW, FIRST, nonTerminals) {
  let changed = false;
  const firstBeta = _computeFIRSTOfSequence(beta, FIRST, nonTerminals);

  // Add FIRST[β] - {ε} to FOLLOW[B]
  const newFollowB = new Set(FOLLOW[B]);
  firstBeta.forEach(function(sym) {
    if (sym !== EPSILON) {
      newFollowB.add(sym);
    }
  });
  if (newFollowB.size !== FOLLOW[B].size) {
    FOLLOW[B] = newFollowB;
    changed = true;
  }

  // If ε ∈ FIRST[β], add FOLLOW[lhs] to FOLLOW[B]
  if (firstBeta.has(EPSILON)) {
    const newFollowB2 = new Set(FOLLOW[B]);
    FOLLOW[lhs].forEach(function(sym) {
      newFollowB2.add(sym);
    });
    if (newFollowB2.size !== FOLLOW[B].size) {
      FOLLOW[B] = newFollowB2;
      changed = true;
    }
  }

  return changed;
}

/**
 * Initialize FOLLOW sets for all non-terminals.
 * @param {Set<string>} nonTerminals
 * @param {string} startSymbol
 * @returns {Object<string, Set<string>>}
 */
function _initFollowSets(nonTerminals, startSymbol) {
  const FOLLOW = {};
  nonTerminals.forEach(function(nt) {
    FOLLOW[nt] = new Set();
  });
  FOLLOW[startSymbol].add(END_MARKER);
  return FOLLOW;
}

/**
 * Iterate FOLLOW computation until fixed point.
 * @param {Object[]} productions
 * @param {Set<string>} nonTerminals
 * @param {Object<string, Set<string>>} FIRST
 * @param {Object<string, Set<string>>} FOLLOW
 * @returns {Object<string, Set<string>>}
 * @throws {Error} If fixed-point iteration does not converge
 */
function _iterateFollowComputation(productions, nonTerminals, FIRST, FOLLOW) {
  let changed = true;
  let iterations = 0;

  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;

    for (let p = 0; p < productions.length; p++) {
      const prod = productions[p];
      const lhs = prod.lhs;
      const rhs = prod.rhs;

      for (let i = 0; i < rhs.length; i++) {
        const B = rhs[i];
        if (!nonTerminals.has(B)) {
          continue;
        }

        // β = symbols after B in RHS
        const beta = rhs.slice(i + 1);
        if (_updateFOLLOWForSymbol(B, beta, lhs, FOLLOW, FIRST, nonTerminals)) {
          changed = true;
        }
      }
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    throw new Error('FOLLOW 计算未收敛（超过 ' + MAX_ITERATIONS + ' 轮迭代）');
  }

  return FOLLOW;
}

/**
 * Compute FOLLOW sets for all non-terminals.
 * @param {Object} grammar - Grammar from parseGrammar()
 * @param {{ FIRST: Object<string, Set<string>> }} firstResult
 * @returns {{ FOLLOW: Object<string, Set<string>> }}
 * @throws {Error} If fixed-point iteration does not converge
 */
function computeFOLLOW(grammar, firstResult) {
  const FIRST = firstResult.FIRST;
  const nonTerminals = grammar.nonTerminals;
  const productions = grammar.productions;
  const startSymbol = grammar.startSymbol;

  const FOLLOW = _initFollowSets(nonTerminals, startSymbol);
  _iterateFollowComputation(productions, nonTerminals, FIRST, FOLLOW);
  return { FOLLOW: FOLLOW };
}

/**
 * Fill parse table entry for one production.
 * @param {Object} prod - Production object
 * @param {Object} table - Parse table (mutated in-place)
 * @param {Object} conflicts - Conflict tracker (mutated in-place)
 * @param {Object} FIRST - FIRST sets
 * @param {Object} FOLLOW - FOLLOW sets
 * @param {Set<string>} nonTerminals
 */
function _fillParseTableEntry(prod, table, conflicts, FIRST, FOLLOW, nonTerminals) {
  const lhs = prod.lhs;
  const rhs = prod.rhs;
  const firstRHS = _computeFIRSTOfSequence(rhs, FIRST, nonTerminals);

  firstRHS.forEach(function(a) {
    if (a === EPSILON) return;

    if (table[lhs][a] === null) {
      table[lhs][a] = prod;
    } else {
      conflicts[lhs][a].push(table[lhs][a]);
      conflicts[lhs][a].push(prod);
    }
  });

  if (firstRHS.has(EPSILON)) {
    FOLLOW[lhs].forEach(function(b) {
      if (table[lhs][b] === null) {
        table[lhs][b] = prod;
      } else {
        conflicts[lhs][b].push(table[lhs][b]);
        conflicts[lhs][b].push(prod);
      }
    });
  }
}

/**
 * Create empty parse table and conflicts structure.
 * @param {Set<string>} terminals
 * @param {Set<string>} nonTerminals
 * @returns {{ table: Object, conflicts: Object }}
 */
function _initializeTable(terminals, nonTerminals) {
  const columns = [];
  terminals.forEach(function(t) { columns.push(t); });
  columns.push(END_MARKER);

  const rows = [];
  nonTerminals.forEach(function(nt) { rows.push(nt); });

  const table = {};
  const conflicts = {};

  rows.forEach(function(nt) {
    table[nt] = {};
    conflicts[nt] = {};
    columns.forEach(function(col) {
      table[nt][col] = null;
      conflicts[nt][col] = [];
    });
  });

  return { table: table, conflicts: conflicts };
}

/**
 * Build LL(1) predictive parsing table.
 * @param {Object} grammar
 * @param {{ FIRST: Object }} firstResult
 * @param {{ FOLLOW: Object }} followResult
 * @returns {{ table: Object, conflicts: Object }}
 */
function buildParseTable(grammar, firstResult, followResult) {
  const FIRST = firstResult.FIRST;
  const FOLLOW = followResult.FOLLOW;
  const nonTerminals = grammar.nonTerminals;
  const terminals = grammar.terminals;
  const productions = grammar.productions;

  const { table, conflicts } = _initializeTable(terminals, nonTerminals);

  for (let i = 0; i < productions.length; i++) {
    const prod = productions[i];
    _fillParseTableEntry(prod, table, conflicts, FIRST, FOLLOW, nonTerminals);
  }

  return { table: table, conflicts: conflicts };
}

/**
 * Build input buffer from input tokens, appending end marker.
 * @param {string[]} input - Input tokens
 * @returns {string[]}
 */
function _buildInputBuffer(input) {
  const inputBuf = [];
  for (let i = 0; i < input.length; i++) {
    inputBuf.push(input[i]);
  }
  inputBuf.push(END_MARKER);
  return inputBuf;
}

/**
 * Perform expand operation: pop non-terminal, push RHS symbols in reverse,
 * record production string.
 * @param {string[]} stack - Parse stack (mutated in-place)
 * @param {string[]} output - Output list (mutated in-place)
 * @param {Object} prod - Production to expand
 * @returns {string} Production string for logging
 */
function _performExpand(stack, output, prod) {
  stack.pop();
  const rhs = prod.rhs;
  for (let j = rhs.length - 1; j >= 0; j--) {
    stack.push(rhs[j]);
  }

  let prodStr = prod.lhs + ' → ';
  if (rhs.length > 0) {
    prodStr += rhs.join(' ');
  } else {
    prodStr += 'ε';
  }
  output.push(prodStr);
  return prodStr;
}

/**
 * Parse input string using LL(1) predictive parsing.
 * @param {Object} grammar
 * @param {Object} table - Parse table from buildParseTable()
 * @param {string[]} input - Array of terminal symbols (without $)
 * @returns {{ steps: Object[], accepted: boolean }}
 */
function parseInput(grammar, table, input) {
  const startSymbol = grammar.startSymbol;
  const nonTerminals = grammar.nonTerminals;

  const stack = [END_MARKER, startSymbol];
  const inputBuf = _buildInputBuffer(input);
  const output = [];
  const steps = [];

  // Record initial state
  steps.push({
    stack: [].concat(stack),
    input: [].concat(inputBuf),
    output: [],
    action: null,
    production: null
  });

  while (true) {
    let top = stack[stack.length - 1];
    let lookahead = inputBuf[0];

    // Accept
    if (top === END_MARKER && lookahead === END_MARKER) {
      steps.push({
        stack: [].concat(stack),
        input: [].concat(inputBuf),
        output: [].concat(output),
        action: 'accept',
        production: null
      });
      break;
    }

    // Match terminal
    if (top === lookahead) {
      stack.pop();
      inputBuf.shift();
      steps.push({
        stack: [].concat(stack),
        input: [].concat(inputBuf),
        output: [].concat(output),
        action: 'match',
        production: null,
        matched: top
      });
      continue;
    }

    // Terminal mismatch
    if (!nonTerminals.has(top)) {
      steps.push({
        stack: [].concat(stack),
        input: [].concat(inputBuf),
        output: [].concat(output),
        action: 'error',
        production: null,
        error: '期望 "' + top + '"，但遇到 "' + lookahead + '"'
      });
      break;
    }

    // Look up parse table
    const row = table[top];
    const prod = row ? row[lookahead] : null;
    if (!prod) {
      steps.push({
        stack: [].concat(stack),
        input: [].concat(inputBuf),
        output: [].concat(output),
        action: 'error',
        production: null,
        error: '表项 M[' + top + ', ' + lookahead + '] 为空，无法展开'
      });
      break;
    }

    // Expand
    const prodStr = _performExpand(stack, output, prod);

    steps.push({
      stack: [].concat(stack),
      input: [].concat(inputBuf),
      output: [].concat(output),
      action: 'expand',
      production: prodStr
    });
  }

  const lastStep = steps[steps.length - 1];
  return {
    steps: steps,
    accepted: lastStep && lastStep.action === 'accept'
  };
}

/**
 * Check if a grammar is LL(1) (no conflicts in parse table).
 * @param {Object} conflicts - Conflicts object from buildParseTable()
 * @returns {boolean}
 */
function isLL1(conflicts) {
  const nonTerminals = Object.keys(conflicts);
  for (let i = 0; i < nonTerminals.length; i++) {
    const nt = nonTerminals[i];
    const cols = Object.keys(conflicts[nt]);
    for (let j = 0; j < cols.length; j++) {
      if (conflicts[nt][cols[j]].length > 0) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Build a parse tree data structure from parse steps.
 * Takes the leftmost derivation (expand steps) and constructs a tree.
 * @param {Object[]} steps - Parse steps from parseInput()
 * @param {Object} grammar - Grammar from parseGrammar()
 * @returns {{ root: Object, flatNodes: Object[] }}
 */
function buildParseTree(steps, grammar) {
  if (!steps || steps.length === 0) {
    return { root: null, flatNodes: [] };
  }

  var root = {
    symbol: grammar.startSymbol,
    children: [],
    isNonTerminal: true,
    depth: 0,
    isLastChild: true
  };

  // Collect only expand steps
  var expandSteps = [];
  for (var i = 0; i < steps.length; i++) {
    if (steps[i].action === 'expand') {
      expandSteps.push(steps[i]);
    }
  }

  for (var e = 0; e < expandSteps.length; e++) {
    var step = expandSteps[e];
    // Parse production string: "E → T E'" or "E' → ε"
    var arrowIdx = step.production.indexOf(' → ');
    if (arrowIdx < 0) continue;
    var lhs = step.production.substring(0, arrowIdx);
    var rhsStr = step.production.substring(arrowIdx + 3);
    var rhs = rhsStr === EPSILON ? ['ε'] : rhsStr.split(' ');

    // Find the leftmost unexpanded non-terminal
    var target = _findLeftmostUnexpanded(root);
    if (target) {
      for (var j = 0; j < rhs.length; j++) {
        var sym = rhs[j];
        target.children.push({
          symbol: sym,
          children: [],
          isNonTerminal: grammar.nonTerminals.has(sym),
          depth: target.depth + 1,
          isLastChild: j === rhs.length - 1
        });
      }
    }
  }

  // Mark isLastChild for all children (fix after tree build)
  _markLastChild(root);

  // Flatten tree for WXML rendering
  var flatNodes = _flattenTree(root);

  return { root: root, flatNodes: flatNodes };
}

/**
 * Find the leftmost non-terminal that has no children yet (unexpanded).
 * @param {Object} node - Tree node
 * @returns {Object|null}
 */
function _findLeftmostUnexpanded(node) {
  if (node.children.length === 0) {
    return node;
  }
  for (var i = 0; i < node.children.length; i++) {
    var result = _findLeftmostUnexpanded(node.children[i]);
    if (result) return result;
  }
  return null;
}

/**
 * Recursively mark isLastChild on all children.
 * @param {Object} node
 */
function _markLastChild(node) {
  for (var i = 0; i < node.children.length; i++) {
    node.children[i].isLastChild = (i === node.children.length - 1);
    _markLastChild(node.children[i]);
  }
}

/**
 * Flatten tree into ordered list with prefix indicators for WXML rendering.
 * @param {Object} node - Root node
 * @returns {Object[]}
 */
function _flattenTree(node) {
  var result = [];
  var ancestorIsLast = [];
  _flattenNode(node, result, ancestorIsLast);
  return result;
}

/**
 * Recursive helper for _flattenTree.
 * @param {Object} node
 * @param {Object[]} result
 * @param {boolean[]} ancestorIsLast - Track whether each ancestor is the last child
 */
function _flattenNode(node, result, ancestorIsLast) {
  // Build prefix string
  var prefix = '';
  for (var i = 0; i < ancestorIsLast.length; i++) {
    if (i === ancestorIsLast.length - 1) {
      prefix += node.isLastChild ? '└── ' : '├── ';
    } else {
      prefix += ancestorIsLast[i] ? '    ' : '│   ';
    }
  }

  result.push({
    symbol: node.symbol,
    depth: node.depth,
    isNonTerminal: node.isNonTerminal,
    isLastChild: node.isLastChild,
    hasChildren: node.children.length > 0,
    prefix: prefix
  });

  var newAncestorIsLast = ancestorIsLast.concat([node.isLastChild]);

  for (var i = 0; i < node.children.length; i++) {
    _flattenNode(node.children[i], result, newAncestorIsLast);
  }
}

module.exports = {
  computeFIRST: computeFIRST,
  computeFOLLOW: computeFOLLOW,
  buildParseTable: buildParseTable,
  parseInput: parseInput,
  isLL1: isLL1,
  buildParseTree: buildParseTree,
  EPSILON: EPSILON,
  END_MARKER: END_MARKER
};
