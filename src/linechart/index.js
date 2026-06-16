// ── Line Chart Module ──
import { L_PALETTES } from './palettes.js';
import { LINE_STYLES } from './line-styles.js';
import { currentTool, isFullscreen, setIsFullscreen, setCurrentTool } from '../state.js';
import { hexToRgba, truncate } from '../utils.js';

export let lineChartData = null;
let lCurrentPalette = 0;
let lCurrentLineStyle = 0;
let lDotRects = [];

// ── Init ──
export function initLineChart() {
  buildLPaletteGrid();
  buildLLineStyleGrid();
}

function buildLPaletteGrid() {
  const grid = document.getElementById('lPaletteGrid');
  if (!grid) return;
  grid.innerHTML = '';
  L_PALETTES.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'palette-card' + (i === lCurrentPalette ? ' active' : '');
    card.onclick = () => selectLPalette(i);
    const dots = document.createElement('div');
    dots.className = 'palette-dots';
    const bgDot = document.createElement('div');
    bgDot.className = 'palette-dot';
    bgDot.style.background = p.bg;
    bgDot.style.outline = '1px solid rgba(128,128,128,.3)';
    bgDot.style.outlineOffset = '-1px';
    dots.appendChild(bgDot);
    for (let j = 0; j < 4; j++) {
      const dot = document.createElement('div');
      dot.className = 'palette-dot';
      dot.style.background = p.colors[j];
      dots.appendChild(dot);
    }
    const name = document.createElement('div');
    name.className = 'palette-name';
    name.textContent = p.name;
    card.appendChild(dots);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

function selectLPalette(i) {
  lCurrentPalette = i;
  document.querySelectorAll('#lPaletteGrid .palette-card').forEach((c, j) => c.classList.toggle('active', j === i));
  buildLLineStyleGrid();
  if (lineChartData) renderLineChart();
}

function buildLLineStyleGrid() {
  const grid = document.getElementById('lLinestyleGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const pal = L_PALETTES[lCurrentPalette];
  const c = pal.colors[0];
  LINE_STYLES.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'linestyle-card' + (i === lCurrentLineStyle ? ' active' : '');
    card.onclick = () => selectLLineStyle(i);
    const icon = document.createElement('div');
    icon.className = 'linestyle-icon';
    icon.innerHTML = s.icon(c);
    const name = document.createElement('div');
    name.className = 'linestyle-name';
    name.textContent = s.name;
    card.appendChild(icon);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

function selectLLineStyle(i) {
  lCurrentLineStyle = i;
  document.querySelectorAll('#lLinestyleGrid .linestyle-card').forEach((c, j) => c.classList.toggle('active', j === i));
  if (lineChartData) renderLineChart();
}

// ── Controls ──
function getLUnit() {
  return document.getElementById('lUnitInput').value.trim();
}

function onLUnitChange() {
  updateLUnitBadge();
  if (lineChartData) drawLineChart(document.getElementById('lChartCanvas'));
}

function getLTitle() {
  return document.getElementById('lTitleInput').value.trim();
}

function onLTitleChange() {
  updateLUnitBadge();
  if (lineChartData) drawLineChart(document.getElementById('lChartCanvas'));
}

function updateLUnitBadge() {
  const unit = getLUnit();
  const badge = document.getElementById('lUnitBadge');
  const fsBadge = document.getElementById('fsUnitBadge');
  const fsUnit = document.getElementById('fsUnit');
  const pal = L_PALETTES[lCurrentPalette];
  const title = getLTitle();
  const badgeTop = title ? 34 : 8;
  if (badge) {
    badge.style.top = badgeTop + 'px';
    if (unit) {
      badge.textContent = '单位：' + unit;
      badge.style.display = 'block';
      badge.style.background = 'rgba(26,29,39,.85)';
      badge.style.border = '1px solid rgba(255,255,255,.1)';
      badge.style.color = pal.tickText;
    } else {
      badge.style.display = 'none';
    }
  }
  if (fsBadge) fsBadge.style.top = badgeTop + 'px';
  if (fsUnit) fsUnit.textContent = unit ? '（单位：' + unit + '）' : '';
}

function loadLSample() {
  const samples = [
    { label: '1月', value: 120 }, { label: '2月', value: 98 },
    { label: '3月', value: 156 }, { label: '4月', value: 88 },
    { label: '5月', value: 145 }, { label: '6月', value: 178 },
    { label: '7月', value: 201 }, { label: '8月', value: 167 },
    { label: '9月', value: 134 }, { label: '10月', value: 189 },
    { label: '11月', value: 112 }, { label: '12月', value: 143 }
  ];
  document.getElementById('lJsonInput').value = JSON.stringify(samples, null, 2);
  document.getElementById('lUnitInput').value = '万元';
  document.getElementById('lTitleInput').value = '月度趋势';
  renderLineChart();
}

// ── Parse ──
function parseLData(input) {
  let parsed = JSON.parse(input);
  if (!Array.isArray(parsed)) throw new Error('请输入 JSON 数组');
  if (parsed.length === 0) throw new Error('数组不能为空');
  return parsed.map((item, i) => {
    if (typeof item === 'number') return { label: `#${i+1}`, value: item };
    if (typeof item === 'object' && item !== null) {
      const val = item.value ?? item.v ?? item.y ?? item[Object.keys(item).find(k => typeof item[k] === 'number')] ?? 0;
      const lbl = item.label ?? item.name ?? item.x ?? item.key ?? `#${i+1}`;
      return { label: String(lbl), value: Number(val) };
    }
    return { label: String(item), value: Number(item) || 0 };
  });
}

// ── Render ──
export function renderLineChart() {
  const errEl = document.getElementById('lErrorMsg');
  const canvas = document.getElementById('lChartCanvas');
  const empty = document.getElementById('lEmptyState');
  const statsBar = document.getElementById('lStatsBar');
  const toolbar = document.getElementById('lChartToolbar');
  try {
    errEl.textContent = '';
    const input = document.getElementById('lJsonInput').value.trim();
    if (!input) { errEl.textContent = '请输入数据'; return; }
    lineChartData = parseLData(input);
    empty.style.display = 'none';
    canvas.style.display = 'block';
    if (toolbar) toolbar.style.display = 'flex';
    document.getElementById('lChartWrapper').style.background = L_PALETTES[lCurrentPalette].bg;
    document.getElementById('lChartWrapper').style.borderRadius = '8px';
    document.getElementById('lChartWrapper').style.overflow = 'hidden';
    drawLineChart(canvas);
    updateLStats();
    updateLUnitBadge();
    if (statsBar) statsBar.style.display = 'flex';
    const disc = document.getElementById('lChartDisclaimer');
    if (disc) disc.style.display = 'block';
  } catch(e) {
    errEl.textContent = e.message;
    lineChartData = null;
  }
}

export function drawLineChart(canvas, overrideW, overrideH) {
  const wrapper = overrideW ? null : document.getElementById('lChartWrapper');
  const dpr = window.devicePixelRatio || 1;
  const W = overrideW || wrapper.clientWidth;
  const H = overrideH || Math.max(360, Math.min(500, W * 0.6));
  const pal = L_PALETTES[lCurrentPalette];
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);
  if (!lineChartData || lineChartData.length === 0) return;

  const values = lineChartData.map(d => d.value);
  const maxVal = Math.max(...values) * 1.1;
  const minVal = Math.min(0, Math.min(...values));
  const range = maxVal - minVal;
  const title = getLTitle();
  const padding = { top: 30 + (title ? 32 : 0), right: 30, bottom: 50, left: 60 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  if (title) {
    ctx.fillStyle = pal.lineText;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, W / 2, 12);
  }

  // Grid
  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + chartH - (chartH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();
    ctx.fillStyle = pal.tickText;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const val = minVal + (range / 5) * i;
    ctx.fillText(Math.round(val * 10) / 10, padding.left - 8, y);
  }

  // X labels
  const n = lineChartData.length;
  const gap = chartW / (n + 1);
  lDotRects = [];
  const points = [];
  lineChartData.forEach((d, i) => {
    const x = padding.left + gap * (i + 1);
    const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
    points.push({ x, y, d });

    // Label
    ctx.fillStyle = pal.labelText;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const maxChars = Math.floor(gap / 11);
    ctx.fillText(truncate(d.label, Math.max(4, maxChars)), x, padding.top + chartH + 10);

    // X grid tick
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, padding.top + chartH);
    ctx.lineTo(x, padding.top + chartH + 5);
    ctx.stroke();
  });

  // Draw line
  const color = pal.colors[0];
  const lineStyle = LINE_STYLES[lCurrentLineStyle];
  const isArea = lCurrentLineStyle === 3 || lCurrentLineStyle === 4;
  if (isArea) {
    lineStyle.drawLine(ctx, points, color, pal.bg, chartH, padding.top);
  } else {
    lineStyle.drawLine(ctx, points, color, pal.bg);
  }

  // Value labels on dots
  points.forEach(p => {
    ctx.fillStyle = pal.lineText;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(p.d.value, p.x, p.y - 8);
    lDotRects.push({ x: p.x, y: p.y, r: 8, d: p.d });
  });
}

// ── Fullscreen ──
let fsHideTimerL = null;

function showFsHeaderL() {
  const header = document.querySelector('#fullscreenWrapper .fullscreen-header');
  header.classList.remove('auto-hide');
  clearTimeout(fsHideTimerL);
  fsHideTimerL = setTimeout(() => { if (isFullscreen) header.classList.add('auto-hide'); }, 3000);
}

export function enterFsLineChart() {
  setCurrentTool('linechart');
  const wrapper = document.getElementById('fullscreenWrapper');
  setIsFullscreen(true);
  wrapper.classList.add('active');
  updateLUnitBadge();
  const title = getLTitle();
  document.getElementById('fsTitle').textContent = title ? '— ' + title : '';
  document.getElementById('fsHeaderTitle').innerHTML = '📈 折线图 <span class="fs-unit" id="fsUnit"></span> <span class="fs-title" id="fsTitle"></span>';
  const pal = L_PALETTES[lCurrentPalette];
  wrapper.style.background = pal.bg;
  const fsDisc = document.getElementById('fsDisclaimer');
  fsDisc.style.color = pal.lineText;
  fsDisc.style.opacity = '0.45';
  document.getElementById('fsCanvasWrap').style.display = 'block';
  document.getElementById('fsContent').style.display = 'none';
  const el = wrapper;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (req) { try { req.call(el); } catch(e) {} }
  requestAnimationFrame(() => {
    const canvas = document.getElementById('fsCanvas');
    const wrap = document.getElementById('fsCanvasWrap');
    drawLineChart(canvas, wrap.clientWidth, wrap.clientHeight);
  });
  showFsHeaderL();
  wrapper.addEventListener('mousemove', showFsHeaderL);
  wrapper.addEventListener('click', showFsHeaderL);
  wrapper.addEventListener('touchstart', showFsHeaderL);
}

export function exitFsLineChart() {
  setIsFullscreen(false);
  clearTimeout(fsHideTimerL);
  const wrapper = document.getElementById('fullscreenWrapper');
  wrapper.classList.remove('active');
  wrapper.removeEventListener('mousemove', showFsHeaderL);
  wrapper.removeEventListener('click', showFsHeaderL);
  wrapper.removeEventListener('touchstart', showFsHeaderL);
  const header = document.querySelector('#fullscreenWrapper .fullscreen-header');
  header.classList.remove('auto-hide');
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if (exit) { try { exit.call(document); } catch(e) {} }
  if (lineChartData) drawLineChart(document.getElementById('lChartCanvas'));
}

// ── Stats ──
function updateLStats() {
  if (!lineChartData) return;
  const vals = lineChartData.map(d => d.value);
  document.getElementById('lStatCount').textContent = vals.length;
  document.getElementById('lStatMax').textContent = Math.max(...vals);
  document.getElementById('lStatMin').textContent = Math.min(...vals);
  document.getElementById('lStatAvg').textContent = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  document.getElementById('lStatSum').textContent = vals.reduce((a, b) => a + b, 0);
}

// ── Tooltip ──
(function() {
  const canvas = document.getElementById('lChartCanvas');
  if (!canvas) return;
  const tooltip = document.getElementById('lTooltip');
  if (!tooltip) return;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / dpr / rect.height);
    let hit = null;
    for (const r of lDotRects) {
      const dx = mx - r.x, dy = my - r.y;
      if (dx * dx + dy * dy <= r.r * r.r) { hit = r; break; }
    }
    if (hit) {
      tooltip.classList.add('show');
      document.getElementById('lTtLabel').textContent = hit.d.label;
      document.getElementById('lTtValue').textContent = hit.d.value;
      tooltip.style.left = (e.clientX - rect.left) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
      tooltip.style.transform = 'translate(-50%, -100%)';
    } else {
      tooltip.classList.remove('show');
    }
  });
  canvas.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
})();

// ── Resize ──
window.addEventListener('resize', () => {
  if (lineChartData) drawLineChart(document.getElementById('lChartCanvas'));
});

// ── Expose to window for HTML onclick ──
window.renderLineChart = renderLineChart;
window.loadLSample = loadLSample;
window.onLTitleChange = onLTitleChange;
window.onLUnitChange = onLUnitChange;
