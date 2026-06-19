# Tests

[中文](README.md)

Jest test directory. Covers all pure JavaScript logic.

## Test Structure

```
tests/
├── utils/                              # Utility tests
│   ├── util.test.js                    # General-purpose utilities
│   ├── storage.test.js                 # Local storage wrapper
│   ├── markdown-parser.test.js         # Markdown parser
│   ├── analytics.test.js               # Learning analytics
│   ├── subnet.test.js                  # Subnet calculation
│   ├── bst.test.js                     # Binary search tree
│   ├── graph.test.js                   # Graph algorithms
│   ├── hash-table.test.js              # Hash table
│   ├── tcp-states.test.js              # TCP state machine
│   └── tool-registry.test.js           # Tool registry
│
└── pages/                              # Page logic tests
    ├── quiz-engine.test.js             # Quiz engine
    └── sort-viz.test.js                # Sort visualization
```

## Running Tests

```bash
npm test
```

## Current Status

- 11 test suites
- 218 test cases
- All passing ✓

## Conventions

- Test file naming: `<module>.test.js`
- Pure logic must have 100% coverage
- Page logic should be extracted to `utils/` before testing
- WeChat APIs are mocked via `__mocks__/wx.js`
