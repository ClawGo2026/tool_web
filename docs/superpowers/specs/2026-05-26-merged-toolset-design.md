# Merged Data Visualization Toolkit — Design Spec

**Date:** 2026-05-26
**Status:** Approved (v2 — multi-file architecture)
**Input files:** `Histogram.html` (JSON 直方图生成器), `JsonTable.html` (JSON 表格生成器)
**Output:** `Toolset.html` + `toolset/` directory (multi-file architecture to avoid generation truncation)

---

## 1. Goal

Merge two standalone HTML tools into a unified "数据可视化工具集" with a tab switcher, preserving **100% of each tool's original functionality**. To avoid LLM generation truncation on large single files (~90KB), the output uses a multi-file architecture: one small HTML entry point plus separate CSS/JS/data files.

---

## 2. Architecture

### 2.1 Multi-file structure (方案 A: 按类型分目录)

```
web_tool/
├── Toolset.html              ← 入口文件（~2KB，纯HTML骨架 + <link> + <script src> 引用）
├── toolset/
│   ├── css/
│   │   ├── theme.css         ← :root变量 + reset + 共享组件(header/tab-bar/panels/buttons)
│   │   ├── histogram.css     ← canvas/tooltip/chart工具栏/柱状图样式选择器
│   │   └── table.css         ← gen-table/列宽调整/表格样式选择器
│   ├── js/
│   │   ├── core.js           ← switchTab / 全屏路由 / ESC监听 / 初始化调度
│   │   ├── histogram.js      ← 直方图全部逻辑（~25KB）
│   │   └── table.js          ← 表格全部逻辑（~18KB）
│   └── data/
│       ├── h-palettes.js     ← H_PALETTES 数组（15个调色板）
│       ├── t-palettes.js     ← T_PALETTES 数组（15个调色板）
│       ├── bar-styles.js     ← BAR_STYLES 数组（14种柱状图样式）
│       └── table-styles.js   ← TABLE_STYLES 数组（8种表格样式）
├── Histogram.html            ← 保持不变（仍可独立打开）
└── JsonTable.html            ← 保持不变（仍可独立打开）
```

**为什么选这个结构：**
- 最大单文件 ~25KB（histogram.js），远低于截断阈值
- 职责清晰：CSS/JS/数据三层分离
- 源文件不动，用户仍可单独打开使用
- 无需构建步骤，浏览器直接打开 Toolset.html 即可

### 2.2 Toolset.html 入口文件结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>数据可视化工具集</title>
  <link rel="stylesheet" href="toolset/css/theme.css">
  <link rel="stylesheet" href="toolset/css/histogram.css">
  <link rel="stylesheet" href="toolset/css/table.css">
</head>
<body>
  <!-- header, tab-bar, histogram-panel, table-panel, fullscreen-wrapper -->
  <!-- HTML content copied from original files with ID collision resolution -->
  <script src="toolset/data/h-palettes.js"></script>
  <script src="toolset/data/t-palettes.js"></script>
  <script src="toolset/data/bar-styles.js"></script>
  <script src="toolset/data/table-styles.js"></script>
  <script src="toolset/js/histogram.js"></script>
  <script src="toolset/js/table.js"></script>
  <script src="toolset/js/core.js"></script>
</body>
</html>
```

Script 加载顺序很重要：数据文件 → 业务逻辑 → core.js（最后初始化）。

### 2.3 Tab switching

- Two tabs in a `.tab-bar`: `📊 直方图` (default active) and `📋 表格`.
- Clicking a tab calls `switchTab('histogram')` or `switchTab('table')`.
- Implementation: toggle `display:none/block` on `#histogram-panel` and `#table-panel`.
- Active tab gets class `.active` (accent color + bottom underline via `::after` pseudo-element).
- No re-initialization on switch — each tool retains its own DOM state and JS variables.
- Fullscreen ownership tracked via `currentTool` variable so the shared overlay renders the correct tool's content.

### 2.4 State isolation

Each tool's JS state variables are already namespaced by purpose and do not collide:

| Histogram | Table |
|-----------|-------|
| `chartData` | `tableData` |
| `barRects` | — |
| `direction` | — |
| `currentPalette` (histogram) | `currentPalette` (table) |
| `currentBarStyle` | `currentStyle` |
| `BAR_STYLES` | `TABLE_STYLES` |
| `PALETTES` (histogram) | `PALETTES` (table) |

Because both tools' `PALETTES` and `currentPalette` share the same name, the merged file **renames** them to avoid collision:
- Histogram: `PALETTES` → `H_PALETTES`, `currentPalette` → `hCurrentPalette`
- Table: `PALETTES` → `T_PALETTES`, `currentPalette` → `tCurrentPalette`

Data files use `const` declarations to avoid polluting global scope accidentally:
- `toolset/data/h-palettes.js`: `const H_PALETTES = [...]`
- `toolset/data/t-palettes.js`: `const T_PALETTES = [...]`
- `toolset/data/bar-styles.js`: `const BAR_STYLES = [...]`
- `toolset/data/table-styles.js`: `const TABLE_STYLES = [...]`

---

## 3. Unified Theme

### 3.1 Design tokens (in theme.css)

```css
:root {
  --bg: #0f1117;
  --surface: #1a1d27;
  --surface2: #242836;
  --border: #2e3348;
  --text: #e4e6f0;
  --text2: #8b8fa8;
  --accent: #6c5ce7;
  --accent2: #a29bfe;
  --green: #00cec9;
  --red: #ff6b6b;
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0,0,0,.3);
}
```

### 3.2 Tab bar styling (in theme.css)

```css
.tab-bar { display:flex; gap:0; margin:0 auto 20px; max-width:400px; }
.tab-btn {
  flex:1; padding:10px 0; text-align:center; cursor:pointer;
  background:transparent; border:none; color:var(--text2);
  font-size:.9rem; font-weight:600; position:relative;
  transition:color .2s;
}
.tab-btn.active { color:var(--accent2); }
.tab-btn.active::after {
  content:''; position:absolute; bottom:0; left:20%; right:20%;
  height:3px; background:var(--accent); border-radius:2px 2px 0 0;
}
```

### 3.3 Header (in Toolset.html)

```html
<div class="header">
  <h1>🎨 数据可视化工具集</h1>
  <p>直方图 · 表格 · 一键生成</p>
</div>
```

---

## 4. Feature Preservation (Critical Requirement)

### 4.1 Histogram — 100% preserved

Every feature from the original Histogram.html is retained:
- JSON input (array of `{label, value}` objects or plain numbers)
- Vertical / horizontal direction toggle (`.dir-toggle`)
- Chart title input (`#titleInput`)
- Data unit input (`#unitInput`, displayed as `.unit-badge`)
- 15 color palettes (`H_PALETTES`: 梦幻紫, 日落橙, 海洋蓝, 森林绿, 糖果色, 霓虹灯, 莫兰迪, 暗夜金, 纯白简约, 浅灰优雅, 暖阳米白, 薄荷清凉, 天空浅蓝, 樱花粉白)
- 14 bar styles (`BAR_STYLES`: 经典渐变, 扁平纯色, 胶囊圆角, 描边空心, 3D立体, 玻璃质感, 条纹填充, 霓虹发光, 圆点图案, 浮雕阴影, 双色分割, 内发光, 渐变边框, 圆顶尖角, 阶梯堆叠)
- Canvas-based rendering with devicePixelRatio scaling
- `drawVertical` / `drawHorizontal` with grid lines, value labels, rotated category labels
- Tooltip on hover (label + value)
- Stats bar (数据量, 最大值, 最小值, 平均值, 总和)
- Sample data button
- Fullscreen overlay with auto-hide header (native Fullscreen API + fallback)
- `resize` event listener
- All helpers: `roundRect`, `adjustColor`, `truncate`, `hexToRgba`, `isLightColor`

### 4.2 Table — 100% preserved

Every feature from the original JsonTable.html is retained:
- JSON input (array of objects, or arrays, or primitives)
- Table title input (`#titleInput` → renamed to `#tTitleInput` to avoid collision with histogram's title input)
- 15 color palettes (`T_PALETTES`:梦幻紫, 深邃蓝, 暗夜绿, 暗夜金, 酒红, 莫兰迪, 碳黑, 纯白简约, 浅灰优雅, 天空蓝, 薄荷绿, 暖阳米白, 樱花粉)
- 8 table styles (`TABLE_STYLES`: 经典线框, 斑马条纹, 现代卡片, 简约无线, 圆角柔和, 左侧强调, 底部线框, 全边框)
- Dynamic `<style>` injection per palette+style combination
- Column resize handles (`.col-resize-handle`)
- Stats bar (行数, 列数, 数值列, 字段)
- Sample data button
- Fullscreen overlay with auto-hide header
- All helpers: `buildTableHTML`, `parseData`, `updateStats`

### 4.3 DOM ID collision resolution

Both tools share several identical IDs. Resolution:

| ID | Histogram | Table |
|----|-----------|-------|
| `titleInput` | keeps `titleInput` | → `tTitleInput` |
| `jsonInput` | keeps `jsonInput` | → `tJsonInput` |
| `emptyState` | keeps `emptyState` | → `tEmptyState` |
| `errorMsg` | keeps `errorMsg` | → `tErrorMsg` |
| `paletteGrid` | keeps `paletteGrid` | → `tPaletteGrid` |
| `statsBar` | keeps `statsBar` | → `tStatsBar` |
| `fullscreenWrapper` | **shared** — tool-aware via `currentTool` variable |
| `unitInput` | keeps `unitInput` | *(table has no unit input — no collision)* |

Each tool's JS functions are updated to reference their own IDs. `getElementById('jsonInput')` in histogram stays; in table it becomes `getElementById('tJsonInput')`.

No other ID collisions exist between the two files.

---

## 5. Fullscreen Overlay

The shared `#fullscreenWrapper` is tool-aware:

```javascript
let currentTool = 'histogram'; // updated by switchTab()

function toggleFullscreen() {
  if (currentTool === 'histogram') toggleFsHistogram();
  else toggleFsTable();
}
```

Each tool's fullscreen enter/exit functions are renamed:
- Histogram: `enterFsHistogram` / `exitFsHistogram`
- Table: `enterFsTable` / `exitFsTable`

The ESC key handler and `fullscreenchange` event listener route through `toggleFullscreen()` which checks `currentTool`.

---

## 6. File Inventory

| File | Action | Responsibility |
|------|--------|----------------|
| `Histogram.html` | Read-only reference; left untouched | Source of histogram features |
| `JsonTable.html` | Read-only reference; left untouched | Source of table features |
| `Toolset.html` | **Created** | Entry point — HTML skeleton + `<link>` + `<script>` references |
| `toolset/css/theme.css` | **Created** | `:root` variables, reset, shared components (header, tab-bar, panels, buttons) |
| `toolset/css/histogram.css` | **Created** | Canvas, tooltip, chart toolbar, bar style picker |
| `toolset/css/table.css` | **Created** | `.gen-table`, column resize, table style picker, fullscreen overlay |
| `toolset/js/core.js` | **Created** | `switchTab`, fullscreen routing, ESC handler, `initHistogram()` + `initTable()` calls |
| `toolset/js/histogram.js` | **Created** | All histogram logic (state vars, helpers, render, fullscreen) |
| `toolset/js/table.js` | **Created** | All table logic (state vars, helpers, render, fullscreen) |
| `toolset/data/h-palettes.js` | **Created** | `const H_PALETTES = [...]` (15 palettes) |
| `toolset/data/t-palettes.js` | **Created** | `const T_PALETTES = [...]` (15 palettes) |
| `toolset/data/bar-styles.js` | **Created** | `const BAR_STYLES = [...]` (14 bar styles) |
| `toolset/data/table-styles.js` | **Created** | `const TABLE_STYLES = [...]` (8 table styles) |

---

## 7. Success Criteria

1. Opening `Toolset.html` in a browser shows the tab bar with "📊 直方图" active by default.
2. All histogram features work identically to the original `Histogram.html`.
3. Switching to "📋 表格" tab shows the table tool; all table features work identically to the original `JsonTable.html`.
4. Switching back to histogram tab preserves its state (data, palette, bar style, chart direction).
5. No console errors in either tab.
6. Fullscreen works correctly for each tool independently.
7. Original files remain unchanged.
8. All files in `toolset/` directory are individually small enough to generate without truncation (max ~25KB).
