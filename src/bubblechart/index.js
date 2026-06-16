import { BUBBLE_PALETTES } from './palettes.js';
import { LAYOUT_ALGORITHMS, calculateLayout } from './layout-algorithms.js';
import { currentTool, isFullscreen, setIsFullscreen, setCurrentTool } from '../state.js';
import { hexToRgba, isLightColor, truncate } from '../utils.js';

// ── Bubble Chart State ──
let bubbleData = null;
let bCurrentPalette = 0;
let bCurrentLayout = 'force';
let bubblePositions = [];
let bIsFullscreen = false;

// ── Init ──

export function initBubbleChart() {
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
    card.dataset.layout = a.id;
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

export function renderBubbleChart() {
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

export function enterFsBubble() {
  const wrapper = document.getElementById('fullscreenWrapper');
  bIsFullscreen = true;
  setIsFullscreen(true);
  setCurrentTool('bubblechart');
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

export function exitFsBubble() {
  bIsFullscreen = false;
  setIsFullscreen(false);
  const wrapper = document.getElementById('fullscreenWrapper');
  wrapper.classList.remove('active');
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if (fsEl && exit) { try { exit.call(document); } catch(e) {} }
  // Redraw normal canvas
  if (bubbleData) renderBubbleChart();
}

// ── Expose to window for HTML onclick ──

window.renderBubbleChart = renderBubbleChart;
window.loadBSample = loadBSample;
window.onBTitleChange = onBTitleChange;
