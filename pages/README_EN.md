# Pages

[中文](README.md)

Mini program page directory. Each subdirectory corresponds to a page and contains four files: `.js` / `.wxml` / `.wxss` / `.json`.

## Page List (13 pages)

| Page | Path | Description |
|---|---|---|
| Home / Toolbox | `index/` | Brand area, Hero card, feature entry cards, quick links |
| Paper List | `quiz-list/` | List of imported papers, import new paper entry |
| Import Preview | `import-preview/` | Confirm import: question type stats, question preview |
| Quiz | `quiz/` | One question per page, supports practice and exam modes |
| Result | `result/` | Accuracy, per-question detail, time statistics |
| Answer History | `records/` | List of past quiz sessions |
| Record Detail | `record-detail/` | Full detail of a single quiz session |
| Wrong Questions | `wrong-questions/` | Collected wrong answers, redo entry |
| Dashboard | `dashboard/` | Learning stats, 7-day trend, smart suggestions |
| Sort Visualization | `sort-viz/` | Sorting algorithm animation demos |
| Subnet Calculator | `subnet-calc/` | IP/CIDR calculation, binary visualization |
| TCP Animator | `tcp-viz/` | TCP state machine animation |
| DS Visualization | `ds-viz/` | BST, Stack & Queue, Hash Table, Graph search |

## Data Flow Between Pages

```
index (Home)
  ├─→ quiz-list (Paper List)
  │     └─→ import-preview (Import Preview)
  │           └─→ quiz-list (back)
  │     └─→ quiz (Start Quiz)
  │           └─→ result (Result)
  │                 └─→ record-detail (View Detail)
  │
  ├─→ records (Answer History)
  │     └─→ record-detail (Record Detail)
  │           └─→ quiz (Redo)
  │
  ├─→ wrong-questions (Wrong Questions)
  │     └─→ quiz (Redo)
  │
  ├─→ dashboard (Dashboard)
  ├─→ sort-viz (Sort Visualization)
  ├─→ subnet-calc (Subnet Calculator)
  ├─→ tcp-viz (TCP Animator)
  └─→ ds-viz (DS Visualization)
```

## Conventions

- Data is passed between pages via `wx.setStorageSync('key', data)`: the previous page writes, the next page reads
- Page logic should be extracted into pure functions in `utils/` whenever possible; page files only handle lifecycle and UI binding
- Design follows Claude Design warm-canvas style guidelines
