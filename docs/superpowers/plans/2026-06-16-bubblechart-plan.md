# Bubble Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bubble chart (气泡图) as the 5th tab in Toolset.html with 4 layout algorithms and 8 color palettes.

**Architecture:** New bubble chart panel follows existing tab structure (input panel + chart panel). Uses Canvas API for rendering. Layout algorithms calculate X/Y positions, radius is proportional to value. Shares existing fullscreen wrapper.

**Tech Stack:** Vanilla HTML/CSS/JS, Canvas API, no external dependencies.

---

## File Map

| File | Action | Responsibility | Size Estimate |
|------|--------|----------------|---------------|
| `Toolset.html` | **Modify** | Add 5th tab button + bubblechart-panel HTML | +50 lines |
| `toolset/css/bubblechart.css` | **Create** | Canvas, tooltip, layout selector, bubble chart specific styles | ~4KB |
| `toolset/data/b-palettes.js` | **Create** | `const BUBBLE_PALETTES = [...]` (8 palettes) | ~3KB |
| `toolset/data/layout-algorithms.js` | **Create** | 4 layout algorithm implementations | ~12KB |
| `toolset/js/bubblechart.js` | **Create** | All bubble chart logic (state, parse, render, fullscreen) | ~20KB |
| `toolset/js/core.js` | **Modify** | Add 'bubblechart' to tab switching logic | +10 lines |

---

## ID Naming Convention

All bubble chart IDs use `b` prefix:

| Element | ID |
|---------|-----|
| Panel | `bubblechart-panel` |
| JSON input | `bJsonInput` |
| Error message | `bErrorMsg` |
| Title input | `bTitleInput` |
| Palette grid | `bPaletteGrid` |
| Layout grid | `bLayoutGrid` |
| Canvas | `bCanvas` |
| Chart wrapper | `bChartWrapper` |
| Chart toolbar | `bChartToolbar` |
| Empty state | `bEmptyState` |
| Tooltip | `bTooltip` |
| Stats bar | `bStatsBar` |
| Stat: count | `bStatCount` |
| Stat: max | `bStatMax` |
| Stat: min | `bStatMin` |
| Stat: avg | `bStatAvg` |
| Stat: sum | `bStatSum` |
| Stat: layout | `bStatLayout` |
| Disclaimer | `bChartDisclaimer` |

---

### Task 1: Modify Toolset.html — Add bubble chart tab + panel

**Files:**
- Modify: `D:\claude_projects\web_tool\Toolset.html`

- [ ] **Step 1: Add 5th tab button**

In the `.tab-bar` div (line 20-25), add the bubble chart tab:

```html
<div class="tab-bar">
  <button class="tab-btn active" data-tab="histogram">📊 直方图</button>
  <button class="tab-btn" data-tab="linechart">📈 折线图</button>
  <button class="tab-btn" data-tab="piechart">🥧 饼图</button>
  <button class="tab-btn" data-tab="bubblechart">🫧 气泡图</button>
  <button class="tab-btn" data-tab="table">📋 表格</button>
</div>
```

- [ ] **Step 2: Add bubblechart-panel HTML**

After the piechart-panel (line 253) and before the table-panel (line 258), add:

```html
<!-- ═══════════════════════════════════════════════
     BUBBLECHART PANEL — IDs with 'b' prefix
     ═══════════════════════════════════════════════ -->
<div id="bubblechart-panel" class="container" style="display:none">
  <!-- Input Panel -->
  <div class="panel panel-input">
    <div class="panel-title">数据输入</div>
    <textarea id="bJsonInput" placeholder='输入 JSON 对象，例如：
{
  "苹果": 35,
  "香蕉": 28,
  "橙子": 42,
  "葡萄": 15,
  "西瓜": 50
}'></textarea>
    <div class="error-msg" id="bErrorMsg"></div>
    <div class="controls">
      <button class="btn btn-primary" onclick="renderBubbleChart()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        生成图表
      </button>
      <button class="btn btn-sample" onclick="loadBSample()">📊 示例数据</button>
    </div>
    <div class="unit-row">
      <label>图表标题：</label>
      <input type="text" class="text-input" id="bTitleInput" placeholder="如：2024年水果销量" oninput="onBTitleChange()">
    </div>

    <div class="palette-section">
      <div class="palette-label">配色方案</div>
      <div class="palette-grid" id="bPaletteGrid"></div>
    </div>
    <div class="layout-section">
      <div class="layout-label">布局算法</div>
      <div class="layout-grid" id="bLayoutGrid"></div>
    </div>
  </div>

  <!-- Chart Panel -->
  <div class="panel panel-chart">
    <div class="panel-title">气泡图</div>
    <div class="chart-toolbar" id="bChartToolbar" style="display:none;">
      <button class="toolbar-btn" onclick="toggleFullscreen()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
        全屏展示
      </button>
    </div>
    <div class="chart-wrapper" id="bChartWrapper">
      <div class="empty-state" id="bEmptyState">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        <p>输入数据后点击「生成图表」</p>
      </div>
      <canvas id="bCanvas" style="display:none;"></canvas>
      <div class="tooltip" id="bTooltip">
        <div class="tt-label" id="bTtLabel"></div>
        <div class="tt-value" id="bTtValue"></div>
      </div>
      <div class="chart-disclaimer" id="bChartDisclaimer" style="display:none;">* 数据来源于网络，仅供参考</div>
    </div>
    <div class="stats" id="bStatsBar" style="display:none;">
      <div class="stat-item"><div class="stat-value" id="bStatCount">-</div><div class="stat-label">数据量</div></div>
      <div class="stat-item"><div class="stat-value" id="bStatMax">-</div><div class="stat-label">最大值</div></div>
      <div class="stat-item"><div class="stat-value" id="bStatMin">-</div><div class="stat-label">最小值</div></div>
      <div class="stat-item"><div class="stat-value" id="bStatAvg">-</div><div class="stat-label">平均值</div></div>
      <div class="stat-item"><div class="stat-value" id="bStatSum">-</div><div class="stat-label">总和</div></div>
      <div class="stat-item"><div class="stat-value" id="bStatLayout">-</div><div class="stat-label">布局</div></div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Add bubblechart.css link in head**

In the `<head>` section (line 6-11), add:

```html
<link rel="stylesheet" href="toolset/css/bubblechart.css">
```

- [ ] **Step 4: Add script references before core.js**

Before `<script src="toolset/js/core.js"></script>` (line 349), add:

```html
<script src="toolset/data/b-palettes.js"></script>
<script src="toolset/data/layout-algorithms.js"></script>
<script src="toolset/js/bubblechart.js"></script>
```

- [ ] **Step 5: Verify HTML structure**

Open `Toolset.html` in browser. Expected:
- Tab bar shows 5 tabs including "🫧 气泡图"
- Clicking bubble chart tab shows input panel + empty canvas
- No console errors (no JS yet, so no functionality)

- [ ] **Step 6: Commit**

```bash
git add Toolset.html
git commit -m "feat: add bubble chart tab and panel HTML to Toolset.html"
```

---

### Task 2: Create bubblechart.css

**Files:**
- Create: `D:\claude_projects\web_tool\toolset\css\bubblechart.css`

- [ ] **Step 1: Create bubblechart.css with layout selector styles**

```css
/* ── Bubble Chart Styles ── */

/* Layout selector section */
.layout-section {
  margin-top: 14px;
}

.layout-label {
  font-size: .78rem;
  color: var(--text2);
  margin-bottom: 8px;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
}

.layout-card {
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 8px 6px;
  cursor: pointer;
  transition: all .2s;
  background: var(--surface2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.layout-card:hover {
  border-color: rgba(255,255,255,.15);
}

.layout-card.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

.layout-name {
  font-size: .65rem;
  color: var(--text2);
  text-align: center;
}

.layout-icon {
  font-size: 1.2rem;
  line-height: 1;
}

/* Bubble chart specific canvas styles */
#bChartWrapper {
  position: relative;
  min-height: 300px;
}

#bCanvas {
  display: block;
  width: 100%;
  height: auto;
}

/* Tooltip already styled in theme.css, just ensure bubble chart tooltip works */
#bTooltip {
  position: absolute;
  pointer-events: none;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: .78rem;
  box-shadow: var(--shadow);
  z-index: 100;
  display: none;
}

#bTtLabel {
  font-weight: 600;
  color: var(--text);
}

#bTtValue {
  color: var(--text2);
  font-size: .72rem;
}
```

- [ ] **Step 2: Verify CSS loads**

Open `Toolset.html` in browser. Expected:
- Bubble chart tab shows styled layout selector grid (empty, no JS yet)
- No console errors

- [ ] **Step 3: Commit**

```bash
git add toolset/css/bubblechart.css
git commit -m "feat: add bubble chart CSS styles"
```

---

### Task 3: Create b-palettes.js (bubble color palettes)

**Files:**
- Create: `D:\claude_projects\web_tool\toolset\data\b-palettes.js`

- [ ] **Step 1: Create b-palettes.js with 8 bubble-specific palettes**

```javascript
// ── Bubble Chart Palettes ──
// Optimized for multi-bubble visualization with high contrast

const BUBBLE_PALETTES = [
  {
    name: '海洋泡泡',
    colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#023e8a', '#0096c7', '#48cae4', '#ade8f4', '#03045e', '#0077b6']
  },
  {
    name: '日落暖色',
    colors: ['#ff6b35', '#f7c59f', '#efefd0', '#004e89', '#1a659e', '#ff9f1c', '#e63946', '#457b9d', '#f1faee', '#a8dadc']
  },
  {
    name: '森林绿意',
    colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#1b4332', '#081c15', '#344e41']
  },
  {
    name: '梦幻渐变',
    colors: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf', '#72efdd', '#80ffdb']
  },
  {
    name: '糖果缤纷',
    colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06d6a0', '#118ab2', '#ef476f', '#ffd166', '#073b4c']
  },
  {
    name: '莫兰迪柔',
    colors: ['#b8b8d1', '#9c89b8', '#8e7dbe', '#7a6f9e', '#665a80', '#524a62', '#3e3644', '#2a2233', '#161022', '#c4b7cb']
  },
  {
    name: '霓虹夜色',
    colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f']
  },
  {
    name: '大地色系',
    colors: ['#bc6c25', '#dda15e', '#606c38', '#283618', '#fefae0', '#b5838d', '#e5989b', '#ffb4a2', '#ffcdb2', '#a68a64']
  }
];
```

- [ ] **Step 2: Verify data file loads**

Open browser console on Toolset.html. Expected: `BUBBLE_PALETTES` is defined as array with length 8.

- [ ] **Step 3: Commit**

```bash
git add toolset/data/b-palettes.js
git commit -m "feat: add bubble chart color palettes"
```

---

### Task 4: Create layout-algorithms.js

**Files:**
- Create: `D:\claude_projects\web_tool\toolset\data\layout-algorithms.js`

- [ ] **Step 1: Create layout-algorithms.js with 4 algorithms**

```javascript
// ── Bubble Chart Layout Algorithms ──

const LAYOUT_ALGORITHMS = [
  { id: 'force', name: '力导向', icon: '🔵' },
  { id: 'grid', name: '网格', icon: '📊' },
  { id: 'circular', name: '圆形', icon: '⭕' },
  { id: 'treemap', name: '树图', icon: '🌳' }
];

// ── Force-Directed Layout ──
function layoutForceDirected(bubbles, canvasW, canvasH) {
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;
  const damping = 0.9;
  const iterations = 100;

  // Initialize positions randomly in center area
  const positions = bubbles.map((b, i) => ({
    x: centerX + (Math.random() - 0.5) * canvasW * 0.5,
    y: centerY + (Math.random() - 0.5) * canvasH * 0.5,
    vx: 0,
    vy: 0,
    radius: b.radius
  }));

  // Physics simulation
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < positions.length; i++) {
      const p1 = positions[i];
      let fx = 0, fy = 0;

      // Repulsion from all other bubbles
      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;
        const p2 = positions[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = p1.radius + p2.radius;

        if (dist < minDist * 2) {
          const force = (minDist * 2 - dist) / dist * 0.5;
          fx += dx * force;
          fy += dy * force;
        }
      }

      // Attraction to center
      fx += (centerX - p1.x) * 0.001;
      fy += (centerY - p1.y) * 0.001;

      // Update velocity
      p1.vx = (p1.vx + fx) * damping;
      p1.vy = (p1.vy + fy) * damping;

      // Update position
      p1.x += p1.vx;
      p1.y += p1.vy;

      // Constrain to canvas bounds
      p1.x = Math.max(p1.radius, Math.min(canvasW - p1.radius, p1.x));
      p1.y = Math.max(p1.radius, Math.min(canvasH - p1.radius, p1.y));
    }
  }

  return positions.map((p, i) => ({
    x: p.x,
    y: p.y,
    radius: bubbles[i].radius,
    label: bubbles[i].label,
    value: bubbles[i].value
  }));
}

// ── Grid/Spiral Layout ──
function layoutGrid(bubbles, canvasW, canvasH) {
  // Sort by size (largest first)
  const sorted = [...bubbles].sort((a, b) => b.radius - a.radius);
  const count = sorted.length;

  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(count * (canvasW / canvasH)));
  const rows = Math.ceil(count / cols);
  const cellW = canvasW / cols;
  const cellH = canvasH / rows;

  return sorted.map((b, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: cellW * (col + 0.5),
      y: cellH * (row + 0.5),
      radius: b.radius,
      label: b.label,
      value: b.value
    };
  });
}

// ── Circular Packing Layout ──
function layoutCircular(bubbles, canvasW, canvasH) {
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;
  const maxRadius = Math.min(canvasW, canvasH) * 0.45;

  // Sort by size (largest first)
  const sorted = [...bubbles].sort((a, b) => b.radius - a.radius);
  const positions = [];

  // Place largest in center
  positions.push({
    x: centerX,
    y: centerY,
    radius: sorted[0].radius,
    label: sorted[0].label,
    value: sorted[0].value
  });

  // Place remaining in spiral
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
  for (let i = 1; i < sorted.length; i++) {
    const b = sorted[i];
    const angle = i * goldenAngle;
    const r = Math.sqrt(i / sorted.length) * maxRadius;

    let x = centerX + r * Math.cos(angle);
    let y = centerY + r * Math.sin(angle);

    // Ensure no overlap with existing bubbles
    let attempts = 0;
    while (attempts < 50) {
      let overlap = false;
      for (const p of positions) {
        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.radius + p.radius + 5) {
          overlap = true;
          break;
        }
      }
      if (!overlap) break;

      // Adjust position
      r *= 1.05;
      x = centerX + r * Math.cos(angle + attempts * 0.1);
      y = centerY + r * Math.sin(angle + attempts * 0.1);
      attempts++;
    }

    // Constrain to canvas
    x = Math.max(b.radius, Math.min(canvasW - b.radius, x));
    y = Math.max(b.radius, Math.min(canvasH - b.radius, y));

    positions.push({ x, y, radius: b.radius, label: b.label, value: b.value });
  }

  return positions;
}

// ── Treemap Packing Layout ──
function layoutTreemap(bubbles, canvasW, canvasH) {
  // Sort by size (largest first)
  const sorted = [...bubbles].sort((a, b) => b.radius - a.radius);
  const positions = [];

  // Simple row-based packing
  let x = 0, y = 0, rowHeight = 0;

  for (const b of sorted) {
    const diameter = b.radius * 2;

    // Check if we need a new row
    if (x + diameter > canvasW && x > 0) {
      x = 0;
      y += rowHeight + 5;
      rowHeight = 0;
    }

    positions.push({
      x: x + b.radius,
      y: y + b.radius,
      radius: b.radius,
      label: b.label,
      value: b.value
    });

    x += diameter + 5;
    rowHeight = Math.max(rowHeight, diameter);
  }

  // Center the entire layout
  const totalHeight = y + rowHeight;
  const offsetY = (canvasH - totalHeight) / 2;
  for (const p of positions) {
    p.y += offsetY;
  }

  return positions;
}

// ── Main Layout Function ──
function calculateLayout(bubbles, canvasW, canvasH, algorithm) {
  switch (algorithm) {
    case 'force': return layoutForceDirected(bubbles, canvasW, canvasH);
    case 'grid': return layoutGrid(bubbles, canvasW, canvasH);
    case 'circular': return layoutCircular(bubbles, canvasW, canvasH);
    case 'treemap': return layoutTreemap(bubbles, canvasW, canvasH);
    default: return layoutGrid(bubbles, canvasW, canvasH);
  }
}
```

- [ ] **Step 2: Verify data file loads**

Open browser console on Toolset.html. Expected: `LAYOUT_ALGORITHMS` is defined, `calculateLayout` is a function.

- [ ] **Step 3: Commit**

```bash
git add toolset/data/layout-algorithms.js
git commit -m "feat: add bubble chart layout algorithms"
```

---

### Task 5: Create bubblechart.js

**Files:**
- Create: `D:\claude_projects\web_tool\toolset\js\bubblechart.js`

- [ ] **Step 1: Add state variables, helpers, and init function**

```javascript
// ── Bubble Chart State ──
let bubbleData = null;
let bCurrentPalette = 0;
let bCurrentLayout = 'force';
let bubblePositions = [];
let bIsFullscreen = false;

// ── Bubble Chart Helpers ──

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// ── Init ──

function initBubbleChart() {
  buildBPaletteGrid();
  buildBLayoutGrid();
}

function buildBPaletteGrid() {
  const grid = document.getElementById('bPaletteGrid');
  grid.innerHTML = '';
  BUBBLE_PALETTES.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'palette-card' + (i === bCurrentPalette ? ' active' : '');
    card.onclick = () => selectBPalette(i);
    const preview = document.createElement('div');
    preview.className = 'palette-preview';
    p.colors.slice(0, 5).forEach(c => {
      const d = document.createElement('div');
      d.style.background = c;
      preview.appendChild(d);
    });
    const name = document.createElement('div');
    name.className = 'palette-name';
    name.textContent = p.name;
    card.appendChild(preview);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

function selectBPalette(i) {
  bCurrentPalette = i;
  document.querySelectorAll('#bPaletteGrid .palette-card').forEach((c, j) => c.classList.toggle('active', j === i));
  if (bubbleData) renderBubbleChart();
}

function buildBLayoutGrid() {
  const grid = document.getElementById('bLayoutGrid');
  grid.innerHTML = '';
  LAYOUT_ALGORITHMS.forEach((a, i) => {
    const card = document.createElement('div');
    card.className = 'layout-card' + (a.id === bCurrentLayout ? ' active' : '');
    card.onclick = () => selectBLayout(a.id);
    const icon = document.createElement('div');
    icon.className = 'layout-icon';
    icon.textContent = a.icon;
    const name = document.createElement('div');
    name.className = 'layout-name';
    name.textContent = a.name;
    card.appendChild(icon);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

function selectBLayout(id) {
  bCurrentLayout = id;
  document.querySelectorAll('#bLayoutGrid .layout-card').forEach(c => c.classList.toggle('active', c.dataset.layout === id));
  if (bubbleData) renderBubbleChart();
}
```

- [ ] **Step 2: Add parse, calculate radius, and render functions**

```javascript
// ── Parse ──

function parseBubbleData(input) {
  const obj = JSON.parse(input);
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('请输入 JSON 对象');
  }
  const entries = Object.entries(obj);
  if (entries.length === 0) throw new Error('对象不能为空');
  return entries.map(([label, value]) => ({
    label: String(label),
    value: Number(value)
  }));
}

// ── Calculate Radius ──

function calculateRadius(value, minVal, maxVal, canvasSize) {
  const minRadius = Math.max(15, canvasSize * 0.03);
  const maxRadius = Math.min(80, canvasSize * 0.15);
  if (maxVal === minVal) return (minRadius + maxRadius) / 2;
  const ratio = (value - minVal) / (maxVal - minVal);
  return minRadius + ratio * (maxRadius - minRadius);
}

// ── Render ──

function renderBubbleChart() {
  const errEl = document.getElementById('bErrorMsg');
  const empty = document.getElementById('bEmptyState');
  const canvas = document.getElementById('bCanvas');
  const toolbar = document.getElementById('bChartToolbar');
  const statsBar = document.getElementById('bStatsBar');
  const disclaimer = document.getElementById('bChartDisclaimer');
  const wrapper = document.getElementById('bChartWrapper');

  try {
    errEl.textContent = '';
    const input = document.getElementById('bJsonInput').value.trim();
    if (!input) { errEl.textContent = '请输入数据'; return; }

    bubbleData = parseBubbleData(input);
    const values = bubbleData.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Calculate radii
    const canvasSize = Math.min(wrapper.clientWidth - 40, 600);
    bubbleData = bubbleData.map(d => ({
      ...d,
      radius: calculateRadius(d.value, minVal, maxVal, canvasSize)
    }));

    // Calculate positions
    const rect = wrapper.getBoundingClientRect();
    const canvasW = rect.width - 40;
    const canvasH = Math.max(300, canvasW * 0.7);
    bubblePositions = calculateLayout(bubbleData, canvasW, canvasH, bCurrentLayout);

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Draw bubbles
    const pal = BUBBLE_PALETTES[bCurrentPalette];
    bubblePositions.forEach((p, i) => {
      const color = pal.colors[i % pal.colors.length];

      // Bubble circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, 0.7);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label (always visible)
      ctx.fillStyle = isLightColor(color) ? '#000' : '#fff';
      const fontSize = Math.max(10, Math.min(14, p.radius * 0.35));
      ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(truncate(p.label, 8), p.x, p.y - p.radius * 0.1);

      // Value (if bubble large enough)
      if (p.radius > 22) {
        ctx.font = `500 ${Math.max(9, fontSize * 0.75)}px sans-serif`;
        ctx.fillText(p.value, p.x, p.y + p.radius * 0.25);
      }
    });

    // Update UI
    empty.style.display = 'none';
    canvas.style.display = 'block';
    toolbar.style.display = 'flex';
    disclaimer.style.display = 'block';
    statsBar.style.display = 'flex';

    updateBStats();
  } catch(e) {
    errEl.textContent = e.message;
    bubbleData = null;
  }
}

function updateBStats() {
  if (!bubbleData) return;
  const values = bubbleData.map(d => d.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const layoutName = LAYOUT_ALGORITHMS.find(a => a.id === bCurrentLayout)?.name || '';

  document.getElementById('bStatCount').textContent = bubbleData.length;
  document.getElementById('bStatMax').textContent = Math.max(...values);
  document.getElementById('bStatMin').textContent = Math.min(...values);
  document.getElementById('bStatAvg').textContent = avg.toFixed(1);
  document.getElementById('bStatSum').textContent = sum;
  document.getElementById('bStatLayout').textContent = layoutName;
}
```

- [ ] **Step 3: Add controls, fullscreen, and event listeners**

```javascript
// ── Controls ──

function getTitle() {
  return document.getElementById('bTitleInput').value.trim();
}

function onBTitleChange() {
  // Title not rendered in bubble chart, but kept for future use
}

function loadBSample() {
  const sample = {
    "苹果": 35, "香蕉": 28, "橙子": 42, "葡萄": 15, "西瓜": 50,
    "草莓": 22, "樱桃": 18, "芒果": 31, "菠萝": 25, "柠檬": 12
  };
  document.getElementById('bJsonInput').value = JSON.stringify(sample, null, 2);
  document.getElementById('bTitleInput').value = '水果销量气泡图';
  renderBubbleChart();
}

// ── Tooltip ──

const bCanvas = document.getElementById('bCanvas');
const bTooltip = document.getElementById('bTooltip');
const bTtLabel = document.getElementById('bTtLabel');
const bTtValue = document.getElementById('bTtValue');

bCanvas.addEventListener('mousemove', (e) => {
  if (!bubblePositions.length) return;
  const rect = bCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const hovered = bubblePositions.find(p => {
    const dx = x - p.x;
    const dy = y - p.y;
    return Math.sqrt(dx * dx + dy * dy) <= p.radius;
  });

  if (hovered) {
    bTtLabel.textContent = hovered.label;
    bTtValue.textContent = hovered.value;
    bTooltip.style.display = 'block';
    bTooltip.style.left = (e.clientX - rect.left + 10) + 'px';
    bTooltip.style.top = (e.clientY - rect.top - 30) + 'px';
  } else {
    bTooltip.style.display = 'none';
  }
});

bCanvas.addEventListener('mouseout', () => {
  bTooltip.style.display = 'none';
});

// ── Resize ──

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (bubbleData) renderBubbleChart();
  }, 200);
});

// ── Fullscreen ──

function enterFsBubble() {
  const wrapper = document.getElementById('fullscreenWrapper');
  bIsFullscreen = true;
  currentTool = 'bubblechart';
  wrapper.classList.add('active');
  wrapper.style.background = 'var(--bg)';

  // Copy canvas to fullscreen
  const fsCanvas = document.getElementById('fsCanvas');
  const fsCtx = fsCanvas.getContext('2d');
  const rect = wrapper.getBoundingClientRect();
  const fsW = rect.width - 40;
  const fsH = rect.height - 100;
  const dpr = window.devicePixelRatio || 1;

  fsCanvas.width = fsW * dpr;
  fsCanvas.height = fsH * dpr;
  fsCanvas.style.width = fsW + 'px';
  fsCanvas.style.height = fsH + 'px';
  fsCtx.scale(dpr, dpr);

  // Recalculate positions for fullscreen size
  if (bubbleData) {
    const canvasSize = Math.min(fsW, fsH);
    const dataWithRadius = bubbleData.map(d => ({
      ...d,
      radius: calculateRadius(d.value, Math.min(...bubbleData.map(x => x.value)), Math.max(...bubbleData.map(x => x.value)), canvasSize)
    }));
    const positions = calculateLayout(dataWithRadius, fsW, fsH, bCurrentLayout);

    // Draw in fullscreen
    const pal = BUBBLE_PALETTES[bCurrentPalette];
    positions.forEach((p, i) => {
      const color = pal.colors[i % pal.colors.length];
      fsCtx.beginPath();
      fsCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      fsCtx.fillStyle = hexToRgba(color, 0.7);
      fsCtx.fill();
      fsCtx.strokeStyle = color;
      fsCtx.lineWidth = 2;
      fsCtx.stroke();

      fsCtx.fillStyle = isLightColor(color) ? '#000' : '#fff';
      const fontSize = Math.max(12, Math.min(18, p.radius * 0.4));
      fsCtx.font = `600 ${fontSize}px sans-serif`;
      fsCtx.textAlign = 'center';
      fsCtx.textBaseline = 'middle';
      fsCtx.fillText(p.label, p.x, p.y - p.radius * 0.1);
      if (p.radius > 30) {
        fsCtx.font = `500 ${fontSize * 0.75}px sans-serif`;
        fsCtx.fillText(p.value, p.x, p.y + p.radius * 0.25);
      }
    });
  }

  // Update header
  document.getElementById('fsHeaderTitle').textContent = '🫧 气泡图';
  document.getElementById('fsTitle').textContent = getTitle();

  // Try native fullscreen
  const el = wrapper;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (req) { try { req.call(el); } catch(e) {} }
}

function exitFsBubble() {
  bIsFullscreen = false;
  const wrapper = document.getElementById('fullscreenWrapper');
  wrapper.classList.remove('active');
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if (exit) { try { exit.call(document); } catch(e) {} }
  // Redraw normal canvas
  if (bubbleData) renderBubbleChart();
}

// ── Init ──

initBubbleChart();
```

- [ ] **Step 4: Test bubble chart**

Open `Toolset.html` in browser. Expected:
- Click "🫧 气泡图" tab → bubble chart panel visible
- Click "📊 示例数据" → bubbles render with default layout (force)
- Click different layout cards → bubbles rearrange
- Click different palette cards → colors change
- Hover over bubble → tooltip shows label + value
- Stats bar shows correct values
- Fullscreen button works
- No console errors

- [ ] **Step 5: Commit**

```bash
git add toolset/js/bubblechart.js
git commit -m "feat: add bubble chart JavaScript logic"
```

---

### Task 6: Modify core.js — Add bubblechart to tab switching

**Files:**
- Modify: `D:\claude_projects\web_tool\toolset\js\core.js`

- [ ] **Step 1: Add bubblechart to switchTab function**

Find the `switchTab` function in core.js and add 'bubblechart' case:

```javascript
function switchTab(tab) {
  currentTool = tab;
  document.getElementById('histogram-panel').style.display = tab === 'histogram' ? 'flex' : 'none';
  document.getElementById('linechart-panel').style.display = tab === 'linechart' ? 'flex' : 'none';
  document.getElementById('piechart-panel').style.display = tab === 'piechart' ? 'flex' : 'none';
  document.getElementById('bubblechart-panel').style.display = tab === 'bubblechart' ? 'flex' : 'none';
  document.getElementById('table-panel').style.display = tab === 'table' ? 'flex' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

  // Exit fullscreen when switching tools
  if (isFullscreen) {
    if (currentTool === 'histogram') exitFsHistogram();
    else if (currentTool === 'linechart') exitFsLinechart();
    else if (currentTool === 'piechart') exitFsPiechart();
    else if (currentTool === 'bubblechart') exitFsBubble();
    else exitFsTable();
  }
}
```

- [ ] **Step 2: Add bubblechart to toggleFullscreen function**

Find the `toggleFullscreen` function and add bubblechart case:

```javascript
function toggleFullscreen() {
  if (!isFullscreen) {
    if (currentTool === 'histogram') enterFsHistogram();
    else if (currentTool === 'linechart') enterFsLinechart();
    else if (currentTool === 'piechart') enterFsPiechart();
    else if (currentTool === 'bubblechart') enterFsBubble();
    else enterFsTable();
  } else {
    if (currentTool === 'histogram') exitFsHistogram();
    else if (currentTool === 'linechart') exitFsLinechart();
    else if (currentTool === 'piechart') exitFsPiechart();
    else if (currentTool === 'bubblechart') exitFsBubble();
    else exitFsTable();
  }
}
```

- [ ] **Step 3: Add bubblechart to ESC handler**

Find the ESC keydown listener and add bubblechart case:

```javascript
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isFullscreen) {
    if (currentTool === 'histogram') exitFsHistogram();
    else if (currentTool === 'linechart') exitFsLinechart();
    else if (currentTool === 'piechart') exitFsPiechart();
    else if (currentTool === 'bubblechart') exitFsBubble();
    else exitFsTable();
  }
});
```

- [ ] **Step 4: Test tab switching**

Open `Toolset.html`. Expected:
- All 5 tabs work correctly
- Clicking each tab shows correct panel
- Bubble chart tab shows bubble chart
- Fullscreen works from bubble chart tab
- ESC exits fullscreen
- No console errors

- [ ] **Step 5: Commit**

```bash
git add toolset/js/core.js
git commit -m "feat: add bubblechart to tab switching and fullscreen routing"
```

---

### Task 7: Final verification

**Files:**
- All created and modified files

- [ ] **Step 1: Verify all bubble chart features**

Checklist:
- [ ] Tab bar shows 5 tabs including "🫧 气泡图"
- [ ] Bubble chart panel visible when tab clicked
- [ ] Sample data button loads data and renders bubbles
- [ ] All 4 layout algorithms work (force, grid, circular, treemap)
- [ ] All 8 color palettes work
- [ ] Bubbles have strokes (visible borders)
- [ ] Bubbles are semi-transparent
- [ ] Labels always visible on bubbles
- [ ] Tooltip shows on hover
- [ ] Stats bar shows: count, max, min, avg, sum, layout name
- [ ] Fullscreen button works
- [ ] ESC exits fullscreen
- [ ] Tab switching preserves bubble chart state
- [ ] No console errors

- [ ] **Step 2: Verify existing tools still work**

Checklist:
- [ ] Histogram tab works correctly
- [ ] Line chart tab works correctly
- [ ] Pie chart tab works correctly
- [ ] Table tab works correctly
- [ ] No regressions in existing functionality

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete bubble chart implementation with 4 layouts and 8 palettes"
```

---

## Execution Order

Tasks must run sequentially:
1. Task 1 (Toolset.html) → bubble chart tab visible with empty panel
2. Task 2 (bubblechart.css) → styles applied
3. Task 3 (b-palettes.js) → color palettes loaded
4. Task 4 (layout-algorithms.js) → layout algorithms loaded
5. Task 5 (bubblechart.js) → bubble chart fully functional
6. Task 6 (core.js) → tab switching + fullscreen routing
7. Task 7 (verify) → final QA

Each task's commit is independently usable.

---

## Self-Review

**1. Spec coverage:**
- ✅ Data format (JSON object) → Task 5 (parseBubbleData)
- ✅ 4 layout algorithms → Task 4 (layout-algorithms.js)
- ✅ 8 color palettes → Task 3 (b-palettes.js)
- ✅ Panel structure → Task 1 (Toolset.html)
- ✅ Stats bar → Task 5 (updateBStats)
- ✅ Fullscreen support → Task 5 (enterFsBubble, exitFsBubble)
- ✅ Tab switching → Task 6 (core.js)
- ✅ Tooltip → Task 5 (mousemove listener)
- ✅ Resize handling → Task 5 (resize listener)

**2. Placeholder scan:** No TBDs, TODOs, or incomplete sections found.

**3. Type consistency:**
- Function names: `renderBubbleChart`, `initBubbleChart`, `buildBPaletteGrid`, `buildBLayoutGrid` — all consistent
- Variable names: `bCurrentPalette`, `bCurrentLayout`, `bubbleData`, `bubblePositions` — all consistent with `b` prefix
- ID references: All IDs match between HTML (Task 1) and JS (Task 5)

**4. Edge cases handled:**
- Empty input → shows error message
- Invalid JSON → shows error message
- Single data point → renders single bubble
- Many data points → scales radii appropriately
- Window resize → redraws with debounce
- Tab switch while in fullscreen → exits fullscreen

Plan is complete and ready for implementation.


- [ ] **Step 1: Add state variables and helper functions**

```javascript
// ── Bubble Chart State ──
let bubbleData = null;
let bCurrentPalette = 0;
let bCurrentLayout = 'force';
let bubblePositions = [];
let bIsFullscreen = false;

// ── Bubble Chart Helpers ──

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}
