# Utils

[中文](README.md)

Pure JavaScript utility libraries. No WeChat API dependencies — independently testable with Jest.

## File List

| File | Description | Test File |
|---|---|---|
| `util.js` | General-purpose utilities (date formatting, array dedup, deep copy, etc.) | `tests/utils/util.test.js` |
| `storage.js` | Local storage CRUD wrapper (set/get/remove/clear) | `tests/utils/storage.test.js` |
| `markdown-parser.js` | Markdown question parser (pure regex, zero dependencies) | `tests/utils/markdown-parser.test.js` |
| `sample-questions.js` | Sample question data for development and testing | — |
| `analytics.js` | Learning analytics (accuracy, trends, suggestions) | `tests/utils/analytics.test.js` |
| `subnet.js` | Subnet calculation logic (IP parsing, CIDR, address classification) | `tests/utils/subnet.test.js` |
| `bst.js` | BST algorithms (insert, delete, traverse, etc.) | `tests/utils/bst.test.js` |
| `graph.js` | Graph algorithms (BFS, DFS, shortest path) | `tests/utils/graph.test.js` |
| `hash-table.js` | Hash table implementation | `tests/utils/hash-table.test.js` |
| `tcp-states.js` | TCP state machine definition and transition logic | `tests/utils/tcp-states.test.js` |
| `tool-registry.js` | Homepage tool registry configuration | `tests/utils/tool-registry.test.js` |

## Conventions

- Pure functions — no WeChat API (`wx.*`) dependencies
- Each file has a corresponding `tests/utils/<name>.test.js` test file
- New utility functions must be paired with new tests
- Use CommonJS exports (`module.exports`) for WeChat Mini Program compatibility
