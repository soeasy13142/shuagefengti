# Brush Up Questions (`刷个冯题`)

[中文](README.md)

A WeChat Mini Program computer science education toolkit: Markdown-based quiz + 25 interactive teaching tools covering computer networks, operating systems, cryptography, algorithms & data structures, and compiler theory.

All data is local. No backend, no account — every question you import, every record you make, lives in your phone.

## Features (25 Computer Science Education Tools)

### Quiz Core

| Module | Description |
|---|---|
| Quiz | MVP. Markdown import, 5 question types, practice/exam modes, auto wrong-question capture |
| Learning Dashboard | Cumulative stats, question-type radar, 7-day trend, rule-based suggestions |

### Computer Networks (8)

| Tool | Description |
|---|---|
| Subnet Calculator | IP/CIDR + 32-bit binary visualization + AND animation |
| TCP State Machine | Interactive TCP FSM with handshake/teardown animation |
| TLS Visualizer | TLS 1.3 handshake step-by-step animation, ECDHE→HKDF key derivation |
| DNS Resolver | Domain resolution simulation, recursive/iterative queries, cache & CNAME tracing |
| HTTP Parser | HTTP request/response message parsing, 16 core status code reference |
| IP Fragment Visualizer | MTU fragmentation animation with 8-byte offset alignment |
| NAT Simulator | SNAT/DNAT multi-scenario simulation, real-time NAT mapping table |
| Nginx Config Generator | Form-based nginx server block configuration generator |

### Operating Systems (5)

| Tool | Description |
|---|---|
| CPU Scheduling Visualizer | FCFS/SJF/RR/MFQ with Gantt chart replay and multi-metric comparison |
| Memory Paging Visualizer | Logical-to-physical address translation, LRU/FIFO page replacement |
| Deadlock Simulator | Resource allocation graph editor + Banker's Algorithm safety check |
| Disk Scheduling Visualizer | SCAN/C-SCAN/LOOK/C-LOOK head movement animation |
| Sync Visualization | Producer-consumer problem, semaphore P/V operation visualization |

### Cryptography (5)

| Tool | Description |
|---|---|
| RSA Calculator | Key generation → encryption/decryption, extended Euclidean algorithm derivation |
| AES Visualizer | 128-bit 10-round encryption, SubBytes→ShiftRows→MixColumns→AddRoundKey |
| DH Key Exchange | Diffie-Hellman protocol visualization with MITM attack simulation |
| SHA-256 Visualizer | Full 64-round compression function, avalanche effect comparison |
| Crypto Toolbox | Caesar/Vigenère/Rail Fence cipher encrypt/decrypt/crack + frequency analysis |

### Algorithms & Data Structures (3)

| Tool | Description |
|---|---|
| Sorting Visualization | Selection/bubble/quick sort with step-by-step replay, adjustable speed |
| Data Structure Viz | BST, stack/queue, hash table, graph BFS/DFS |
| B+ Tree Visualizer | Adjustable order m, node split/merge, range query path highlighting |

### Compiler Theory (4)

| Tool | Description |
|---|---|
| Regex→DFA | Thompson construction NFA → subset construction DFA, DFA simulation |
| LL(1) Parser | FIRST/FOLLOW set calculation, predictive parsing table, string analysis replay |
| Lexer Visualizer | Character-by-character tokenization, longest match rule, symbol table construction |
| AST Builder | Recursive descent parsing → abstract syntax tree → SDT evaluation |

## Design

Uses **Claude Design Warm Canvas**: cream background `#faf9f5`, cream card `#efe9de`, coral CTA `#cc785c`. No shadows, depth expressed via color contrast. See [docs/DESIGN.md](docs/DESIGN.md).

## Tech Stack

- WeChat Mini Program native (WXML + WXSS + JS)
- Local storage only (`wx.setStorageSync`)
- Markdown parsing: hand-written regex (no third-party library)
- Jest for unit tests (62 suites / 977+ tests)

## Quick Start

```bash
npm install
npm test
```

Open the project root in WeChat DevTools. To import questions: tap "Start Quiz" → "Import" → choose a Markdown file (see `test-questions.md` for format).

## Project Structure

```text
├── app.{js,json,wxss}           Entry and global config
├── pages/                       22 main package pages
│   ├── index/                   Home (Hero + toolbox)
│   ├── quiz-list/               Quiz list + import entry
│   ├── import-preview/          Import preview
│   ├── quiz/                    Quiz engine
│   ├── result/                  Score result
│   ├── records/                 Record history
│   ├── record-detail/           Record detail (per-question review)
│   ├── wrong-questions/         Wrong question book
│   ├── dashboard/               Learning dashboard
│   ├── tls-viz/                 TLS visualizer
│   ├── tools-all/               All tools (category view)
│   ├── http-parser/             HTTP parser
│   ├── ip-fragment/             IP fragmentation visualizer
│   ├── lexer-viz/               Lexer visualizer
│   ├── ll1-parser/              LL(1) parser
│   ├── regex-dfa/               Regex→DFA
│   ├── dh-viz/                  DH key exchange
│   ├── sync-viz/                Sync visualization
│   ├── crypto-tools/            Crypto toolbox
│   ├── rsa-calc/                RSA calculator
│   ├── aes-viz/                 AES visualizer
│   └── ast-builder/             AST builder
├── package-tools/               13 subpackage pages
│   ├── subnet-calc/             Subnet calculator
│   ├── tcp-viz/                 TCP state machine
│   ├── dns-viz/                 DNS resolver
│   ├── sort-viz/                Sorting visualization
│   ├── ds-viz/                  Data structure viz
│   ├── bplus-viz/               B+ tree visualizer
│   ├── cpu-sched/               CPU scheduling visualizer
│   ├── mem-paging/              Memory paging visualizer
│   ├── deadlock/                Deadlock simulator
│   ├── disk-sched/              Disk scheduling visualizer
│   ├── nat-viz/                 NAT simulator
│   ├── nginx-gen/               Nginx config generator
│   └── sha256-viz/              SHA-256 visualizer
├── components/                  5 shared components
├── utils/                       65+ utility modules (pure JS)
├── tests/                       Jest (62 suites / 977+ tests)
└── docs/                        Design / documentation
```

## Documentation

| Document | Purpose |
|---|---|
| [.claude/HANDOFF.md](.claude/HANDOFF.md) | 30-second context recovery |
| [docs/handoff/](docs/handoff/) | Module deep-dives, architecture, decisions, risks |
| [docs/DESIGN.md](docs/DESIGN.md) | Claude Design spec |
| [docs/superpowers/specs/](docs/superpowers/specs/) | Original design specs |
| [docs/superpowers/plans/](docs/superpowers/plans/) | Original implementation plans |

## Repository Notes

Files kept only locally (in `.gitignore`):

- `TCP.pdf` — Network protocol reference (3 MB binary)
- `idea.md` — Personal scratchpad

Archived/legacy documents live in [docs/archive/](docs/archive/).
