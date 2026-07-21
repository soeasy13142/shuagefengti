# Brush Up Questions (`刷个冯题`)

[中文](README.md)

A WeChat Mini Program learning toolkit: Markdown-based quiz, learning dashboard, subnet calculator, TCP state machine, data structure visualization, and sorting visualization.

All data is local. No backend, no account — every question you import, every record you make, lives in your phone.

## Modules

| Module | Description |
|---|---|
| Quiz | MVP. Markdown import, 5 question types, practice/exam modes, auto wrong-question capture |
| Learning Dashboard | Cumulative stats, question-type radar, 7-day trend, rule-based suggestions |
| Subnet Calculator | IP/CIDR + 32-bit binary visualization + AND animation |
| TCP State Machine | Interactive TCP FSM with handshake/teardown animation |
| Data Structure Viz | BST, stack/queue, hash table, graph BFS/DFS |
| Sorting Visualization | Selection/bubble/quick sort with step-by-step replay |
| Vocabulary Memory | Coming soon |

## Design

Uses **Claude Design Warm Canvas**: cream background `#faf9f5`, cream card `#efe9de`, coral CTA `#cc785c`. No shadows, depth expressed via color contrast. See [docs/DESIGN.md](docs/DESIGN.md).

## Tech Stack

- WeChat Mini Program native (WXML + WXSS + JS)
- Local storage only (`wx.setStorageSync`)
- Markdown parsing: hand-written regex (no third-party library)
- Jest for unit tests

## Quick Start

```bash
npm install
npm test
```

Open the project root in WeChat DevTools. To import questions: tap "Start Quiz" → "Import" → choose a Markdown file (see `test-questions.md` for format).

## Documentation

| Document | Purpose |
|---|---|
| [.claude/HANDOFF.md](.claude/HANDOFF.md) | 30-second context recovery |
| [docs/handoff/](docs/handoff/) | Module deep-dives, architecture, decisions, risks |
| [docs/DESIGN.md](docs/DESIGN.md) | Claude Design spec |
| [docs/superpowers/specs/](docs/superpowers/specs/) | Original design |
| [docs/superpowers/plans/](docs/superpowers/plans/) | Original implementation plan |

## Repository Notes

Files kept only locally (in `.gitignore`):

- `TCP.pdf` — Network protocol reference (3 MB binary)
- `idea.md` — Personal scratchpad

Archived/legacy documents live in [docs/archive/](docs/archive/).
