# Merged Data Visualization Toolkit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement the plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge `Histogram.html` and `JsonTable.html` into a tab-switcher toolset using a multi-file architecture (方案 A) to avoid LLM generation truncation.

**Architecture:** `Toolset.html` entry point + `toolset/{css,js,data}/` directory. HTML skeleton uses `<link>` and `<script src>` to load separate files. Max single file ~25KB.

**Tech Stack:** Vanilla HTML/CSS/JS, Canvas API, no external dependencies. No build step required.

---

## File Map

| File | Action | Responsibility | Size Estimate |
|------|--------|----------------|---------------|
| `Histogram.html` | Read-only reference | Source of histogram features | 54KB (original) |
| `JsonTable.html` | Read-only reference | Source of table features | 35KB (original) |
| `Toolset.html` | **Create** | Entry point — HTML skeleton + references | ~2KB |
| `toolset/css/theme.css` | **Create** | `:root` vars, reset, shared components | ~3KB |
| `toolset/css/histogram.css` | **Create** | Canvas, tooltip, chart toolbar, bar styles | ~4KB |
| `toolset/css/table.css` | **Create** | `.gen-table`, column resize, table styles, fullscreen | ~5KB |
| `toolset/js/core.js` | **Create** | `switchTab`, fullscreen routing, init dispatch | ~2KB |
| `toolset/js/histogram.js` | **Create** | All histogram logic (state, helpers, render, fullscreen) | ~25KB |
| `toolset/js/table.js` | **Create** | All table logic (state, helpers, render, fullscreen) | ~18KB |
| `toolset/data/h-palettes.js` | **Create** | `const H_PALETTES = [...]` | ~2KB |
| `toolset/data/t-palettes.js` | **Create** | `const T_PALETTES = [...]` | ~2KB |
| `toolset/data/bar-styles.js` | **Create** | `const BAR_STYLES = [...]` | ~8KB |
| `toolset/data/table-styles.js` | **Create** | `const TABLE_STYLES = [...]` | ~6KB |

---

## ID Collision Resolution Reference

| Shared ID | Histogram keeps | Table renamed to |
|-----------|-----------------|------------------|
| `titleInput` | `titleInput` | `tTitleInput` |
| `jsonInput` | `jsonInput` | `tJsonInput` |
| `emptyState` | `emptyState` | `tEmptyState` |
| `errorMsg` | `errorMsg` | `tErrorMsg` |
| `paletteGrid` | `paletteGrid` | `tPaletteGrid` |
| `statsBar` | `statsBar` | `tStatsBar` |
| `fullscreenWrapper` | **shared** (tool-aware via `currentTool`) | **shared** |

JS variable renames to avoid collision:
- Histogram: `PALETTES` → `H_PALETTES`, `currentPalette` → `hCurrentPalette`
- Table: `PALETTES` → `T_PALETTES`, `currentPalette` → `tCurrentPalette`

---

### Task 1: Create Toolset.html entry point + toolset/css/ stylesheets

**Files:**
- Create: `D:\claude_projects\web_tool\Toolset.html`
- Create: `D:\claude_projects\web_tool\toolset\css\theme.css`
- Create: `D:\claude_projects\web_tool\toolset\css\histogram.css`
- Create: `D:\claude_projects\web_tool\toolset\css\table.css`

- [ ] **Step 1: Create `toolset/css/theme.css`**

Content:
- `:root` variables (unified dark theme — copy from Histogram.html `<style>` block lines 7-20)
- Reset `*`, `body` styles
- `.header` styles (gradient title)
- `.tab-bar` and `.tab-btn` styles (tab switcher)
- `.container`, `.tool-panel`, `.panel-title` styles
- `textarea`, `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sample`, `.controls` styles
- `.dir-toggle`, `.unit-row`, `.text-input` styles
- `.palette-section`, `.palette-label`, `.palette-grid`, `.palette-card`, `.palette-name`, `.palette-dots`, `.palette-dot` styles
- `.barstyle-section`, `.barstyle-label`, `.barstyle-grid`, `.barstyle-card`, `.barstyle-name`, `.barstyle-icon` styles
- `.tablestyle-section`, `.tablestyle-label`, `.tablestyle-grid`, `.tablestyle-card`, `.tablestyle-name`, `.tablestyle-icon` styles
- `.error-msg`, `.stats-bar`, `.stat-item`, `.stat-label`, `.stat-value` styles
- `.fullscreen-wrapper`, `.fullscreen-header`, `.btn-close-fs`, `.fullscreen-canvas-wrap`, `.fullscreen-content` styles

Source: Extract from Histogram.html `<style>` block (lines 7-266) and JsonTable.html `<style>` block (lines 7-245), merge into one file with no duplicates.

- [ ] **Step 2: Create `toolset/css/histogram.css`**

Content:
- `.chart-wrapper`, `#chartCanvas` styles
- `.chart-toolbar`, `.toolbar-btn` styles
- `.unit-badge` style
- `.tooltip` style
- `.chart-disclaimer` style
- `.empty-state` style

Source: Extract histogram-specific styles from Histogram.html `<style>` block.

- [ ] **Step 3: Create `toolset/css/table.css`**

Content:
- `.table-wrapper`, `.table-title` styles
- `.gen-table` base styles (from JsonTable.html)
- `.col-resize-handle` style
- `.table-disclaimer` style

Source: Extract table-specific styles from JsonTable.html `<style>` block.

- [ ] **Step 4: Create `Toolset.html` entry point**

HTML structure:
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
  <div class="header">
    <h1>🎨 数据可视化工具集</h1>
    <p>直方图 · 表格 · 一键生成</p>
  </div>
  <div class="tab-bar">
    <button class="tab-btn active" data-tab="histogram">📊 直方图</button>
    <button class="tab-btn" data-tab="table">📋 表格</button>
  </div>
  <!-- Histogram panel — copy from Histogram.html body (lines 274-367), keep original IDs -->
  <div id="histogram-panel" class="tool-panel" style="display:flex">
    <!-- ... histogram HTML with original IDs ... -->
  </div>
  <!-- Table panel — copy from JsonTable.html body (lines 254-311), rename IDs per collision table -->
  <div id="table-panel" class="tool-panel" style="display:none">
    <!-- ... table HTML with t-prefixed IDs ... -->
  </div>
  <!-- Shared fullscreen overlay -->
  <div id="fullscreen-wrapper" class="fullscreen-wrapper">
    <!-- ... from Histogram.html lines 313-367, tool-aware ... -->
  </div>
  <!-- Scripts: data first, then logic, then core -->
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

HTML body content (histogram panel, table panel, fullscreen wrapper) is copied from the original files with ID collision resolution applied.

- [ ] **Step 5: Verify in browser**

Open `Toolset.html` in browser. Expected:
- Dark page with gradient header
- Tab bar showing "📊 直方图" active (accent underline)
- Histogram input panel visible, table panel hidden
- No console errors (no JS yet, so no tool functionality)

- [ ] **Step 6: Commit**

```bash
git add Toolset.html toolset/css/
git commit -m "feat: scaffold Toolset.html + CSS stylesheets"
```

---

### Task 2: Create data files (palettes + styles)

**Files:**
- Create: `D:\claude_projects\web_tool\toolset\data\h-palettes.js`
- Create: `D:\claude_projects\web_tool\toolset\data\t-palettes.js`
- Create: `D:\claude_projects\web_tool\toolset\data\bar-styles.js`
- Create: `D:\claude_projects\web_tool\toolset\data\table-styles.js`

- [ ] **Step 1: Create `toolset/data/h-palettes.js`**

Copy the `PALETTES` array from Histogram.html (inside `<script>`, lines ~698-770). Wrap with `const H_PALETTES = [...]`. No other changes to array content.

- [ ] **Step 2: Create `toolset/data/t-palettes.js`**

Copy the `PALETTES` array from JsonTable.html (inside `<script>`, lines ~333-414). Wrap with `const T_PALETTES = [...]`. No other changes.

- [ ] **Step 3: Create `toolset/data/bar-styles.js`**

Copy the `BAR_STYLES` array from Histogram.html (inside `<script>`, lines ~380-693). Wrap with `const BAR_STYLES = [...]`. No changes.

- [ ] **Step 4: Create `toolset/data/table-styles.js`**

Copy the `TABLE_STYLES` array from JsonTable.html (inside `<script>`, lines ~417-602). Wrap with `const TABLE_STYLES = [...]`. No changes.

- [ ] **Step 5: Verify data files parse correctly**

Open browser console on Toolset.html. Expected: `H_PALETTES`, `T_PALETTES`, `BAR_STYLES`, `TABLE_STYLES` all defined as arrays with correct lengths (15, 15, 14, 8).

- [ ] **Step 6: Commit**

```bash
git add toolset/data/
git commit -m "feat: add palette and style data files"
```

---

### Task 3: Create histogram JavaScript logic

**Files:**
- Create: `D:\claude_projects\web_tool\toolset\js\histogram.js`

- [ ] **Step 1: Add histogram state variables**

```javascript
// ── Histogram State ──
let direction = 'vertical';
let chartData = null;
let barRects = [];
let hCurrentPalette = 0;
let currentBarStyle = 0;
let isFullscreen = false;
```

Note: `currentTool` is declared in `core.js` (loaded after), so we reference it as a global without `let`.

- [ ] **Step 2: Add histogram helper functions**

Copy verbatim from Histogram.html:
- `roundRect(ctx, x, y, w, h, r)` — rounded rectangle path helper
- `adjustColor(hex, amount)` — lighten/darken hex color
- `truncate(str, max)` — truncate string with ellipsis
- `hexToRgba(hex, alpha)` — hex to rgba conversion
- `isLightColor(hex)` — determine if color is light

- [ ] **Step 3: Add histogram init + UI builders**

Copy and rename — `currentPalette` → `hCurrentPalette`, `PALETTES` → `H_PALETTES`:
- `initHistogram()` — calls `buildPaletteGrid()` + `buildBarStyleGrid()`
- `buildPaletteGrid()` — builds palette cards in `#paletteGrid`
- `selectHPalette(i)` — selects histogram palette, triggers `renderChart()`
- `buildBarStyleGrid()` — builds bar style cards in `#barstyleGrid`
- `selectBarStyle(i)` — selects bar style, triggers `renderChart()`

- [ ] **Step 4: Add histogram controls**

Copy and rename:
- `setDirection(dir, btn)` — vertical/horizontal toggle
- `getUnit()` — reads `#unitInput`
- `onUnitChange()` — unit input listener
- `getTitle()` — reads `#titleInput`
- `onTitleChange()` — title input listener
- `updateUnitBadge()` — updates unit badge display
- `loadSample()` — fills sample data into `#jsonInput`, calls `renderChart()`

- [ ] **Step 5: Add histogram parse + render**

Copy from Histogram.html, update references:
- `parseData(input)` — parses JSON input to chart data array
- `renderChart()` — main render entry, references `H_PALETTES[hCurrentPalette]`, `BAR_STYLES[currentBarStyle]`
- `draw(canvas, overrideW, overrideH)` — canvas draw orchestrator
- `drawVertical(ctx, W, H, pad, maxVal, pal)` — vertical bar chart
- `drawHorizontal(ctx, W, H, pad, maxVal, pal)` — horizontal bar chart
- `updateStats()` — updates `#statsBar` children

- [ ] **Step 6: Add histogram fullscreen functions**

Copy and rename to avoid collision:
- `showFsHeaderH()` — show header in fullscreen
- `enterFsHistogram()` — enter fullscreen (sets `currentTool = 'histogram'`)
- `exitFsHistogram()` — exit fullscreen
- `toggleFsHistogram()` — toggle fullscreen state
- `onFullscreenChangeH()` — native fullscreen change handler

- [ ] **Step 7: Add histogram event listeners**

- Tooltip listener block on `#chartCanvas` (mousemove/mouseout)
- Resize listener block (redraw chart on window resize)
- Input listener on `#jsonInput` (auto-render on input change)

- [ ] **Step 8: Test histogram in isolation**

Open `Toolset.html` in browser. Expected:
- Default view shows histogram panel
- Click "📊 示例数据" → chart renders
- Direction toggle works
- Palette picker switches colors
- Bar style picker switches rendering
- Tooltip on hover
- Stats bar shows correct values
- Fullscreen button works
- No console errors

- [ ] **Step 9: Commit**

```bash
git add toolset/js/histogram.js
git commit -m "feat: add histogram JavaScript logic"
```

---

### Task 4: Create table JavaScript logic

**Files:**
- Create: `D:\claude_projects\web_tool\toolset\js\table.js`

- [ ] **Step 1: Add table state variables**

```javascript
// ── Table State ──
let tableData = null;
let tCurrentPalette = 0;
let tCurrentStyle = 0;
```

- [ ] **Step 2: Add table init + UI builders**

Copy from JsonTable.html and rename:
- `initTable()` — calls `buildTPaletteGrid()` + `buildTTableStyleGrid()`
- `buildTPaletteGrid()` — builds palette cards in `#tPaletteGrid`
- `selectTPalette(i)` — selects table palette, triggers `renderTable()`
- `buildTTableStyleGrid()` — builds table style cards in `#tablestyleGrid`
- `selectTTableStyle(i)` — selects table style, triggers `renderTable()`

- [ ] **Step 3: Add table controls**

Copy and rename ID references per collision table:
- `getTTitle()` — reads `#tTitleInput`
- `onTTitleChange()` — title input listener
- `loadTSample()` — fills sample data into `#tJsonInput`, sets `#tTitleInput`, calls `renderTable()`

Sample data content:
```javascript
const samples = [
  {"姓名": "张三", "部门": "技术部", "职位": "高级工程师", "年龄": 28, "薪资": 25000, "城市": "北京"},
  {"姓名": "李四", "部门": "市场部", "职位": "市场总监", "年龄": 35, "薪资": 32000, "城市": "上海"},
  {"姓名": "王五", "部门": "技术部", "职位": "架构师", "年龄": 42, "薪资": 45000, "城市": "深圳"},
  {"姓名": "赵六", "部门": "财务部", "职位": "财务主管", "年龄": 31, "薪资": 28000, "城市": "广州"},
  {"姓名": "孙七", "部门": "人事部", "职位": "HR经理", "年龄": 29, "薪资": 22000, "城市": "杭州"},
  {"姓名": "周八", "部门": "技术部", "职位": "前端开发", "年龄": 26, "薪资": 20000, "城市": "成都"},
  {"姓名": "吴九", "部门": "市场部", "职位": "品牌策划", "年龄": 33, "薪资": 26000, "城市": "武汉"},
  {"姓名": "郑十", "部门": "技术部", "职位": "测试工程师", "年龄": 27, "薪资": 18000, "城市": "南京"}
];
```

- [ ] **Step 4: Add table parse + render**

Copy from JsonTable.html and update references:
- `parseTData(input)` — parses JSON input, reads `#tJsonInput`
- `buildTableHTML(data, title, pal, styleIdx, isFullscreen)` — generates HTML string, references `TABLE_STYLES[tCurrentStyle]`, `T_PALETTES[tCurrentPalette]`
- `renderTable()` — main render entry, reads `#tJsonInput`, `#tTitleInput`; uses `tEmptyState`, `tableContent`, `tableToolbar`, `tStatsBar`, `tableDisclaimer`, `tableWrapper`
- `updateTStats()` — updates `#tStatsBar` child stat elements

- [ ] **Step 5: Add table fullscreen functions**

Copy from JsonTable.html and rename:
- `showFsHeaderT()` — show header in fullscreen
- `enterFsTable()` — enter fullscreen (sets `currentTool = 'table'`)
- `exitFsTable()` — exit fullscreen
- `toggleFsTable()` — toggle fullscreen state
- `onFullscreenChangeT()` — native fullscreen change handler

- [ ] **Step 6: Add table event listeners**

- Input listener on `#tJsonInput` (auto-render on input change)
- Column resize handle creation (in `buildTableHTML` or `renderTable`)

- [ ] **Step 7: Test table in isolation**

Switch to "📋 表格" tab (manually set `display:block` for table-panel if needed for testing). Expected:
- Table panel visible
- Click "📊 示例数据" → table renders
- Palette picker switches colors
- Table style picker switches appearance
- Stats bar shows correct values
- Fullscreen works
- No console errors

- [ ] **Step 8: Commit**

```bash
git add toolset/js/table.js
git commit -m "feat: add table JavaScript logic"
```

---

### Task 5: Create core.js (tab switching + fullscreen routing + init)

**Files:**
- Create: `D:\claude_projects\web_tool\toolset\js\core.js`

- [ ] **Step 1: Add shared state and tab switching**

```javascript
// ── Shared State ──
let currentTool = 'histogram';

function switchTab(tab) {
  currentTool = tab;
  document.getElementById('histogram-panel').style.display = tab === 'histogram' ? 'flex' : 'none';
  document.getElementById('table-panel').style.display = tab === 'table' ? 'flex' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  // Exit fullscreen when switching tools
  if (isFullscreen) {
    if (tab === 'histogram') exitFsHistogram();
    else exitFsTable();
  }
}

document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
```

- [ ] **Step 2: Add shared fullscreen routing**

```javascript
function toggleFullscreen() {
  if (!isFullscreen) {
    if (currentTool === 'histogram') enterFsHistogram();
    else enterFsTable();
  } else {
    if (currentTool === 'histogram') exitFsHistogram();
    else exitFsTable();
  }
}

// Shared ESC handler
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isFullscreen) {
    if (currentTool === 'histogram') exitFsHistogram();
    else exitFsTable();
  }
});

// Shared fullscreenchange listener
function onFullscreenChangeShared() {
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (!fsEl && isFullscreen) {
    isFullscreen = false;
    document.getElementById('fullscreenWrapper').classList.remove('active');
    if (currentTool === 'histogram' && chartData) draw(document.getElementById('chartCanvas'));
  }
}
document.addEventListener('fullscreenchange', onFullscreenChangeShared);
document.addEventListener('webkitfullscreenchange', onFullscreenChangeShared);
document.addEventListener('mozfullscreenchange', onFullscreenChangeShared);
document.addEventListener('MSFullscreenChange', onFullscreenChangeShared);
```

- [ ] **Step 3: Initialize both tools**

```javascript
// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHistogram();
    initTable();
  });
} else {
  initHistogram();
  initTable();
}
```

- [ ] **Step 4: Test tab switching**

Open `Toolset.html`. Expected:
- Default: histogram visible, table hidden, "📊 直方图" tab active
- Click "📋 表格" → table visible, histogram hidden, "📋 表格" tab active
- Click "📊 直方图" → histogram visible again
- No console errors

- [ ] **Step 5: Test full workflow**

1. Switch to histogram, load sample, pick non-default palette, generate chart
2. Switch to table, load sample, pick non-default palette, generate table
3. Switch back to histogram — chart still visible with same palette
4. Switch back to table — table still visible with same palette
5. Fullscreen works for each tool independently
6. No console errors in either tab

- [ ] **Step 6: Commit**

```bash
git add toolset/js/core.js
git commit - "feat: add core.js with tab switching and fullscreen routing"
```

---

### Task 6: Final verification

**Files:**
- All created files

- [ ] **Step 1: Verify all features work**

Checklist:
- [ ] Histogram: sample data renders chart
- [ ] Histogram: direction toggle (vertical/horizontal)
- [ ] Histogram: all 15 palettes selectable
- [ ] Histogram: all 14 bar styles selectable
- [ ] Histogram: tooltip on hover
- [ ] Histogram: stats bar (count/max/min/avg/sum)
- [ ] Histogram: title + unit inputs
- [ ] Histogram: fullscreen + ESC exit
- [ ] Table: sample data renders table
- [ ] Table: all 15 palettes selectable
- [ ] Table: all 8 table styles selectable
- [ ] Table: column resize handles
- [ ] Table: stats bar (rows/cols/numeric cols/fields)
- [ ] Table: title input
- [ ] Table: fullscreen + ESC exit
- [ ] Tab switching preserves both tools' state
- [ ] No console errors in either tab
- [ ] Original files unchanged

- [ ] **Step 2: Verify original files unchanged**

```bash
git diff Histogram.html  # should show no changes
git diff JsonTable.html  # should show no changes
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete merged data visualization toolkit (multi-file architecture)"
```

---

## Execution Order

Tasks must run sequentially:
1. Task 1 (Toolset.html + CSS) → working tab switcher with styled empty panels
2. Task 2 (data files) → palettes and styles loaded as JS data
3. Task 3 (histogram.js) → working histogram in tab 1
4. Task 4 (table.js) → working table in tab 2
5. Task 5 (core.js) → tab switching + fullscreen routing + init
6. Task 6 (verify) → final QA

Each task's commit is independently usable.
