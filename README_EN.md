# Shua Ge Feng Ti (Brush the Feng Questions)

[中文](README.md)

A WeChat Mini Program learning toolbox — quiz practice, algorithm visualization, and network computing all in one multi-functional study assistant.

## Features

### Quiz System

- **Markdown Question Import**: Parse multi-format Markdown question files, auto-detect question types (single-choice, multi-choice, true/false, fill-in-the-blank, short answer)
- **Paper Management**: Paper list, import preview, question type statistics
- **Dual-Mode Practice**: Practice mode (instant feedback) and Exam mode (timed, submit all at once)
- **Answer History**: View past attempts with detailed per-question reports
- **Wrong Question Book**: Auto-collected wrong answers with redo support

### Visualization Tools

- **Sorting Visualization**: Animated demos of bubble sort, selection sort, insertion sort, quick sort, and more
- **Data Structure Visualization**: Interactive demos of BST, Stack & Queue, Hash Table, and Graph (BFS/DFS)
- **TCP Animator**: TCP state machine animation showing three-way handshake, four-way teardown, and protocol state transitions
- **Subnet Calculator**: IP/CIDR calculation, binary bit visualization, address classification

### Learning Dashboard

- Quiz statistics overview
- 7-day learning trend chart
- Smart study suggestions

## Tech Stack

- **Framework**: Native WeChat Mini Program (WXML + WXSS + JS)
- **Storage**: wx.setStorageSync / wx.getStorageSync (pure local storage)
- **Parsing**: Pure regex Markdown parsing, zero third-party dependencies
- **Testing**: Jest (11 test suites, 218 test cases — all passing)
- **Design**: Claude Design warm-canvas style

No backend, no cloud services, no account system. All data stays on the user's device.

## Project Structure

```
my-miniapp/
├── app.js / app.json / app.wxss      # Mini program entry & global config
├── project.config.json                # WeChat DevTools config
├── package.json                       # npm dependencies (Jest, etc.)
├── jest.config.js                     # Jest test config
├── test-questions.md                  # Sample test questions
│
├── pages/                             # Pages (13 pages)
│   ├── index/                         # Home / Toolbox entry
│   ├── quiz-list/                     # Paper list
│   ├── import-preview/                # Import preview
│   ├── quiz/                          # Quiz page (one question per page)
│   ├── result/                        # Quiz result
│   ├── records/                       # Answer history
│   ├── record-detail/                 # Record detail
│   ├── wrong-questions/               # Wrong question book
│   ├── dashboard/                     # Learning dashboard
│   ├── sort-viz/                      # Sorting visualization
│   ├── subnet-calc/                   # Subnet calculator
│   ├── tcp-viz/                       # TCP animator
│   └── ds-viz/                        # Data structure visualization
│
├── utils/                             # Utility library
│   ├── util.js                        # General-purpose utilities
│   ├── storage.js                     # Local storage CRUD wrapper
│   ├── markdown-parser.js             # Markdown question parser
│   ├── sample-questions.js            # Sample question data
│   ├── analytics.js                   # Learning analytics
│   ├── subnet.js                      # Subnet calculation logic
│   ├── bst.js                         # BST algorithms
│   ├── graph.js                       # Graph algorithms
│   ├── hash-table.js                  # Hash table implementation
│   ├── tcp-states.js                  # TCP state machine
│   └── tool-registry.js              # Homepage tool registry
│
├── tests/                             # Test files
│   ├── utils/                         # Util tests
│   └── pages/                         # Page logic tests
│
├── docs/                              # Design documents
├── design-previews/                   # Brand design previews (74 brands)
└── __mocks__/                         # Jest mocks (wx APIs, etc.)
```

## Quick Start

### Prerequisites

- WeChat DevTools
- Node.js ≥ 16

### Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Open the project root in WeChat DevTools
```

### Importing Questions

1. Prepare a Markdown question file (see `test-questions.md` for format reference)
2. Run the mini program in WeChat DevTools
3. Tap "Start Quiz" → "Import Paper" → Select file

## Design

Uses the **Claude Design warm-canvas** style:

| Element | Color |
|---|---|
| Page background | `#faf9f5` warm cream |
| Card background | `#efe9de` cream card |
| Primary (CTA) | `#cc785c` coral |
| Body text | `#141413` warm ink |
| Dark surface | `#181715` |

See `PROJECT_HANDOFF.md` for details.

## Testing

```bash
npm test
```

Current status: 11 test suites, 218 test cases — all passing.

## Related Documents

- `PROJECT_HANDOFF.md` — Project handoff document with complete architecture design, data flow, and development progress
- `docs/superpowers/specs/` — Design specifications
- `docs/superpowers/plans/` — Implementation plans
