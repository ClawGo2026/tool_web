# Bubble Chart (气泡图) — Design Spec

**Date:** 2026-06-16
**Status:** Approved
**Parent project:** Toolset.html 数据可视化工具集
**Input:** Existing Toolset.html with 4 tabs (直方图, 折线图, 饼图, 表格)
**Output:** Add 5th tab "🫧 气泡图" with full functionality

---

## 1. Goal

Add a bubble chart (气泡图) visualization tool as the 5th tab in Toolset.html. The bubble chart accepts JSON object data `{"label": value, ...}`, automatically calculates X/Y positions via selectable layout algorithms, and renders bubbles with radius proportional to value.

---

## 2. Architecture

### 2.1 Tab Structure (updated)

```
[📊 直方图] [📈 折线图] [🥧 饼图] [🫧 气泡图] [📋 表格]
```

- Default active tab remains "histogram" (unchanged)
- New tab "bubblechart" inserted between piechart and table
- Tab bar styling remains consistent (`.tab-bar`, `.tab-btn` classes)

### 2.2 Panel Structure

```html
<div id="bubblechart-panel" class="container" style="display:none">
  <!-- Input Panel -->
  <div class="panel panel-input">
    <!-- Data input, title, palette picker, layout algorithm picker -->
  </div>
  <!-- Chart Panel -->
  <div class="panel panel-chart">
    <!-- Canvas, toolbar, stats bar -->
  </div>
</div>
```

### 2.3 ID Naming Convention

All bubble chart IDs use `b` prefix to avoid collisions:

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

## 3. Data Format

### 3.1 Input Format

JSON object with string keys and numeric values:

```json
{
  "苹果": 35,
  "香蕉": 28,
  "橙子": 42,
  "葡萄": 15,
  "西瓜": 50
}
```

### 3.2 Parsing

```javascript
function parseBubbleData(input) {
  const obj = JSON.parse(input);
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('请输入 JSON 对象，格式如：{"苹果": 35, "香蕉": 28}');
  }
  const entries = Object.entries(obj);
  if (entries.length === 0) throw new Error('对象不能为空');
  return entries.map(([label, value]) => ({
    label,
    value: Number(value)
  }));
}
```

### 3.3 Sample Data

```json
{"苹果": 35, "香蕉": 28, "橙子": 42, "葡萄": 15, "西瓜": 50, "草莓": 22, "樱桃": 18, "芒果": 31, "菠萝": 25, "柠檬": 12}
```

---

## 4. Layout Algorithms

Four algorithms available via card-based selector:

### 4.1 Force-Directed (力导向)

**Algorithm:** Physics simulation with repulsion between all bubbles, attraction to center.

**Implementation:**
- Initialize bubbles in random positions or circle
- Iterate N times (e.g., 100 iterations):
  - Calculate repulsive force between all pairs: `F = k * (r1 + r2) / distance²`
  - Apply attraction to center: `F_center = position * 0.01`
  - Update velocity: `v = (v + force) * damping`
  - Update position: `pos += velocity`
- Constrain to canvas bounds

**Visual style:** Organic, clustered, natural-looking

### 4.2 Grid/Spiral (网格)

**Algorithm:** Sort bubbles by size (descending), place in grid or spiral pattern.

**Implementation:**
- Sort bubbles by value (largest first)
- Calculate grid dimensions: `cols = ceil(sqrt(count))`, `rows = ceil(count / cols)`
- Calculate cell size based on canvas dimensions
- Place each bubble at grid center with offset for visual interest
- Alternative: spiral placement from center outward

**Visual style:** Ordered, predictable, easy to compare sizes

### 4.3 Circular Packing (圆形)

**Algorithm:** Pack bubbles tightly in a circle, largest in center.

**Implementation:**
- Sort bubbles by size (largest first)
- Place largest bubble at center
- For each subsequent bubble:
  - Find position tangent to existing bubbles
  - Use golden angle (137.5°) for placement
  - Adjust radius to prevent overlap
- Scale to fit canvas

**Visual style:** Visually striking, space-efficient, radial hierarchy

### 4.4 Treemap Packing (树图)

**Algorithm:** Pack bubbles into rectangle using squarified treemap approach.

**Implementation:**
- Sort bubbles by size (largest first)
- Use recursive subdivision:
  - Place largest bubble in corner
  - Subdivide remaining space
  - Place next bubbles in subdivisions
- Calculate radius from area: `r = sqrt(area / π)`
- Ensure no overlap with collision detection

**Visual style:** Maximizes space, irregular but efficient

### 4.5 Layout Selector UI

```html
<div class="layout-section">
  <div class="layout-label">布局算法</div>
  <div class="layout-grid" id="bLayoutGrid"></div>
</div>
```

Card structure:
```html
<div class="layout-card" data-layout="force" onclick="selectLayout('force',this)">
  <div class="layout-icon">🔵</div>
  <div class="layout-name">力导向</div>
</div>
```

---

## 5. Visual Styling

### 5.1 Bubble Rendering

```javascript
function drawBubble(ctx, x, y, radius, color, label, value) {
  // Bubble circle with stroke
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.7); // Semi-transparent
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Label (always visible)
  ctx.fillStyle = isLightColor(color) ? '#000' : '#fff';
  ctx.font = `${Math.max(10, radius * 0.3)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y - radius * 0.15);

  // Value (if bubble large enough)
  if (radius > 20) {
    ctx.font = `${Math.max(9, radius * 0.25)}px sans-serif`;
    ctx.fillText(value, x, y + radius * 0.2);
  }
}
```

### 5.2 Color Palettes (8-10 new palettes)

Palettes optimized for bubble charts (high contrast between overlapping bubbles):

```javascript
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

### 5.3 Radius Calculation

```javascript
function calculateRadius(value, minVal, maxVal, canvasSize) {
  const minRadius = Math.max(15, canvasSize * 0.03);
  const maxRadius = Math.min(80, canvasSize * 0.15);

  if (maxVal === minVal) return (minRadius + maxRadius) / 2;

  const ratio = (value - minVal) / (maxVal - minVal);
  return minRadius + ratio * (maxRadius - minRadius);
}
```

---

## 6. Stats Bar

Displays comprehensive statistics:

```html
<div class="stats" id="bStatsBar" style="display:none;">
  <div class="stat-item"><div class="stat-value" id="bStatCount">-</div><div class="stat-label">数据量</div></div>
  <div class="stat-item"><div class="stat-value" id="bStatMax">-</div><div class="stat-label">最大值</div></div>
  <div class="stat-item"><div class="stat-value" id="bStatMin">-</div><div class="stat-label">最小值</div></div>
  <div class="stat-item"><div class="stat-value" id="bStatAvg">-</div><div class="stat-label">平均值</div></div>
  <div class="stat-item"><div class="stat-value" id="bStatSum">-</div><div class="stat-label">总和</div></div>
  <div class="stat-item"><div class="stat-value" id="bStatLayout">-</div><div class="stat-label">布局</div></div>
</div>
```

---

## 7. File Inventory

| File | Action | Responsibility |
|------|--------|----------------|
| `Toolset.html` | **Modify** | Add 5th tab button + bubblechart-panel HTML |
| `toolset/css/bubblechart.css` | **Create** | Canvas, tooltip, layout selector styles |
| `toolset/data/b-palettes.js` | **Create** | `const BUBBLE_PALETTES = [...]` (8-10 palettes) |
| `toolset/data/layout-algorithms.js` | **Create** | Layout algorithm implementations |
| `toolset/js/bubblechart.js` | **Create** | All bubble chart logic |
| `toolset/js/core.js` | **Modify** | Add 'bubblechart' to tab switching logic |

---

## 8. Implementation Notes

### 8.1 Canvas Rendering

- Use Canvas API (consistent with histogram, linechart, piechart)
- Support devicePixelRatio for crisp rendering
- Redraw on window resize
- Tooltip on hover (label + value)

### 8.2 Fullscreen Support

- Reuse existing `#fullscreenWrapper`
- Update `currentTool` to 'bubblechart' when entering fullscreen
- Render bubble chart in `#fsCanvas` during fullscreen

### 8.3 State Variables

```javascript
// Bubble chart state
let bubbleData = null;
let bCurrentPalette = 0;
let bCurrentLayout = 'force'; // 'force', 'grid', 'circular', 'treemap'
let bubblePositions = []; // [{x, y, radius, ...}] cached positions
```

### 8.4 Resize Handling

- Recalculate bubble positions on window resize
- Maintain relative positions (scale to new canvas size)

---

## 9. Success Criteria

1. Opening Toolset.html shows 5 tabs, "🫧 气泡图" is clickable
2. Clicking bubble chart tab shows input panel + empty canvas
3. Loading sample data renders bubbles with correct layout
4. All 4 layout algorithms work and produce different arrangements
5. All 8-10 color palettes apply correctly
6. Bubbles have strokes, semi-transparency, and visible labels
7. Tooltip shows label + value on hover
8. Stats bar shows correct values (count, max, min, avg, sum, layout name)
9. Fullscreen works correctly
10. Switching tabs preserves bubble chart state
11. No console errors
12. Original 4 tools continue to work unchanged

---

## 10. Execution Order

1. **Task 1:** Modify Toolset.html — add tab + panel HTML
2. **Task 2:** Create `toolset/css/bubblechart.css`
3. **Task 3:** Create `toolset/data/b-palettes.js`
4. **Task 4:** Create `toolset/data/layout-algorithms.js`
5. **Task 5:** Create `toolset/js/bubblechart.js`
6. **Task 6:** Modify `toolset/js/core.js` — add bubblechart to tab switching
7. **Task 7:** Test all features + fullscreen + tab switching
