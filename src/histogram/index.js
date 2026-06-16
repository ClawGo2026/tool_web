// ── Histogram Module ──
import { H_PALETTES } from './palettes.js';
import { BAR_STYLES } from './bar-styles.js';
import { currentTool, isFullscreen, setIsFullscreen, setCurrentTool } from '../state.js';
import { hexToRgba, isLightColor, truncate, roundRect, adjustColor } from '../utils.js';

let direction = 'vertical';
export let chartData = null;
let barRects = [];
let hCurrentPalette = 0;
let currentBarStyle = 0;

// ── Init ──
export function initHistogram() {
  buildPaletteGrid();
  buildBarStyleGrid();
}

function buildPaletteGrid() {
  const grid = document.getElementById('paletteGrid');
  grid.innerHTML = '';
  H_PALETTES.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'palette-card' + (i === hCurrentPalette ? ' active' : '');
    card.onclick = () => selectHPalette(i);
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

function selectHPalette(i) {
  hCurrentPalette = i;
  document.querySelectorAll('#paletteGrid .palette-card').forEach((c, j) => c.classList.toggle('active', j === i));
  buildBarStyleGrid();
  if (chartData) renderChart();
}

function buildBarStyleGrid() {
  const grid = document.getElementById('barstyleGrid');
  grid.innerHTML = '';
  const pal = H_PALETTES[hCurrentPalette];
  const c = pal.colors[0];
  BAR_STYLES.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'barstyle-card' + (i === currentBarStyle ? ' active' : '');
    card.onclick = () => selectBarStyle(i);
    const icon = document.createElement('div');
    icon.className = 'barstyle-icon';
    icon.innerHTML = s.icon(c);
    const name = document.createElement('div');
    name.className = 'barstyle-name';
    name.textContent = s.name;
    card.appendChild(icon);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

function selectBarStyle(i) {
  currentBarStyle = i;
  document.querySelectorAll('#barstyleGrid .barstyle-card').forEach((c, j) => c.classList.toggle('active', j === i));
  if (chartData) renderChart();
}

// ── Controls ──
function setDirection(dir, btn) {
  direction = dir;
  document.querySelectorAll('.dir-toggle .btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (chartData) renderChart();
}

function getUnit() {
  return document.getElementById('unitInput').value.trim();
}

function onUnitChange() {
  updateUnitBadge();
  if (chartData) draw(document.getElementById('chartCanvas'));
}

function getTitle() {
  return document.getElementById('titleInput').value.trim();
}

function onTitleChange() {
  updateUnitBadge();
  if (chartData) draw(document.getElementById('chartCanvas'));
}

function updateUnitBadge() {
  const unit = getUnit();
  const badge = document.getElementById('unitBadge');
  const fsBadge = document.getElementById('fsUnitBadge');
  const fsUnit = document.getElementById('fsUnit');
  const pal = H_PALETTES[hCurrentPalette];
  const isLight = isLightColor(pal.bg);
  const title = getTitle();
  const badgeTop = title ? 34 : 8;
  badge.style.top = badgeTop + 'px';
  fsBadge.style.top = badgeTop + 'px';
  if (unit) {
    const text = '单位：' + unit;
    badge.textContent = text;
    badge.style.display = 'block';
    badge.style.background = isLight ? 'rgba(255,255,255,.85)' : 'rgba(26,29,39,.85)';
    badge.style.border = isLight ? '1px solid rgba(0,0,0,.1)' : '1px solid rgba(255,255,255,.1)';
    badge.style.color = pal.tickText;
    fsBadge.textContent = text;
    fsBadge.style.display = 'block';
    fsBadge.style.background = badge.style.background;
    fsBadge.style.border = badge.style.border;
    fsBadge.style.color = badge.style.color;
    fsUnit.textContent = '（单位：' + unit + '）';
  } else {
    badge.style.display = 'none';
    fsBadge.style.display = 'none';
    fsUnit.textContent = '';
  }
}

function loadSample() {
  const samples = [
    { label: '一月', value: 120 }, { label: '二月', value: 98 },
    { label: '三月', value: 156 }, { label: '四月', value: 88 },
    { label: '五月', value: 145 }, { label: '六月', value: 178 },
    { label: '七月', value: 201 }, { label: '八月', value: 167 },
    { label: '九月', value: 134 }, { label: '十月', value: 189 },
    { label: '十一月', value: 112 }, { label: '十二月', value: 143 }
  ];
  document.getElementById('jsonInput').value = JSON.stringify(samples, null, 2);
  document.getElementById('unitInput').value = '万元';
  document.getElementById('titleInput').value = '月度销售数据';
  renderChart();
}

// ── Parse ──
function parseData(input) {
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
export function renderChart() {
  const errEl = document.getElementById('errorMsg');
  const canvas = document.getElementById('chartCanvas');
  const empty = document.getElementById('emptyState');
  const statsBar = document.getElementById('statsBar');
  const toolbar = document.getElementById('chartToolbar');
  try {
    errEl.textContent = '';
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) { errEl.textContent = '请输入数据'; return; }
    chartData = parseData(input);
    empty.style.display = 'none';
    canvas.style.display = 'block';
    toolbar.style.display = 'flex';
    document.getElementById('chartWrapper').style.background = H_PALETTES[hCurrentPalette].bg;
    document.getElementById('chartWrapper').style.borderRadius = '8px';
    document.getElementById('chartWrapper').style.overflow = 'hidden';
    draw(canvas);
    updateStats();
    updateUnitBadge();
    statsBar.style.display = 'flex';
    document.getElementById('chartDisclaimer').style.display = 'block';
  } catch(e) {
    errEl.textContent = e.message;
    chartData = null;
  }
}

export function draw(canvas, overrideW, overrideH) {
  const wrapper = overrideW ? null : document.getElementById('chartWrapper');
  const dpr = window.devicePixelRatio || 1;
  const W = overrideW || wrapper.clientWidth;
  const H = overrideH || Math.max(360, Math.min(500, W * 0.6));
  const pal = H_PALETTES[hCurrentPalette];
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);
  if (!chartData || chartData.length === 0) return;
  const values = chartData.map(d => d.value);
  const maxVal = Math.max(...values) * 1.1;
  const title = getTitle();
  const unit = getUnit();
  const extraGlow = currentBarStyle === 6 ? 10 : 0;
  const titleSpace = title ? 32 : 0;
  const unitSpace = (title && unit) ? 22 : 0;
  const padding = { top: 30 + extraGlow + titleSpace + unitSpace, right: 30 + extraGlow, bottom: 60 + extraGlow, left: 60 };
  if (title) {
    ctx.fillStyle = pal.barText;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, W / 2, 12);
  }
  if (direction === 'vertical') {
    drawVertical(ctx, W, H, padding, maxVal, pal);
  } else {
    ctx.font = '11px sans-serif';
    let maxLabelW = 0;
    chartData.forEach(d => { const w = ctx.measureText(d.label).width; if (w > maxLabelW) maxLabelW = w; });
    padding.left = Math.min(W * 0.4, Math.max(60, maxLabelW + 20));
    drawHorizontal(ctx, W, H, padding, maxVal, pal);
  }
}

function drawVertical(ctx, W, H, pad, maxVal, pal) {
  const n = chartData.length;
  const colors = pal.colors;
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const gap = Math.max(4, Math.min(12, chartW / n * 0.2));
  const barW = (chartW - gap * (n + 1)) / n;
  barRects = [];
  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + chartH - (chartH / 5) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = pal.tickText; ctx.font = '11px sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(maxVal / 5 * i), pad.left - 8, y);
  }
  chartData.forEach((d, i) => {
    const x = pad.left + gap + i * (barW + gap);
    const barH = (d.value / maxVal) * chartH;
    const y = pad.top + chartH - barH;
    const color = colors[i % colors.length];
    BAR_STYLES[currentBarStyle].drawBar(ctx, x, y, barW, barH, color, 'vertical');
    ctx.fillStyle = pal.barText; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(d.value, x + barW/2, y - 5);
    ctx.save();
    ctx.translate(x + barW/2, pad.top + chartH + 10);
    const rotated = barW < 50;
    if (rotated) { ctx.rotate(-Math.PI / 4); ctx.textAlign = 'right'; }
    ctx.fillStyle = pal.labelText; ctx.font = '11px sans-serif'; ctx.textBaseline = 'top';
    const maxChars = rotated ? 12 : Math.floor(barW / 11);
    ctx.fillText(truncate(d.label, Math.max(4, maxChars)), 0, 0);
    ctx.restore();
    barRects.push({ x, y, w: barW, h: barH, d });
  });
}

function drawHorizontal(ctx, W, H, pad, maxVal, pal) {
  const n = chartData.length;
  const colors = pal.colors;
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const gap = Math.max(4, Math.min(12, chartH / n * 0.2));
  const barH = (chartH - gap * (n + 1)) / n;
  barRects = [];
  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const x = pad.left + (chartW / 5) * i;
    ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, H - pad.bottom); ctx.stroke();
    ctx.fillStyle = pal.tickText; ctx.font = '11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(Math.round(maxVal / 5 * i), x, H - pad.bottom + 8);
  }
  chartData.forEach((d, i) => {
    const y = pad.top + gap + i * (barH + gap);
    const barW = (d.value / maxVal) * chartW;
    const color = colors[i % colors.length];
    BAR_STYLES[currentBarStyle].drawBar(ctx, pad.left, y, barW, barH, color, 'horizontal');
    ctx.fillStyle = pal.barText; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(d.value, pad.left + barW + 6, y + barH/2);
    ctx.fillStyle = pal.labelText; ctx.font = '11px sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const availW = pad.left - 12;
    let lbl = d.label;
    if (ctx.measureText(lbl).width > availW) {
      while (lbl.length > 1 && ctx.measureText(lbl + '…').width > availW) { lbl = lbl.slice(0, -1); }
      lbl += '…';
    }
    ctx.fillText(lbl, pad.left - 8, y + barH/2);
    barRects.push({ x: pad.left, y, w: barW, h: barH, d });
  });
}

// ── Fullscreen ──
let fsHideTimerH = null;

function showFsHeaderH() {
  const header = document.querySelector('#fullscreenWrapper .fullscreen-header');
  header.classList.remove('auto-hide');
  clearTimeout(fsHideTimerH);
  fsHideTimerH = setTimeout(() => { if (isFullscreen) header.classList.add('auto-hide'); }, 3000);
}

export function enterFsHistogram() {
  setCurrentTool('histogram');
  const wrapper = document.getElementById('fullscreenWrapper');
  setIsFullscreen(true);
  wrapper.classList.add('active');
  updateUnitBadge();
  const title = getTitle();
  document.getElementById('fsHeaderTitle').innerHTML = '📊 直方图 <span class="fs-unit" id="fsUnit"></span> <span class="fs-title" id="fsTitle"></span>';
  document.getElementById('fsTitle').textContent = title ? '— ' + title : '';
  const pal = H_PALETTES[hCurrentPalette];
  wrapper.style.background = pal.bg;
  const fsDisc = document.getElementById('fsDisclaimer');
  fsDisc.style.color = pal.barText;
  fsDisc.style.opacity = '0.45';
  // Show canvas wrap, hide content div
  document.getElementById('fsCanvasWrap').style.display = 'block';
  document.getElementById('fsContent').style.display = 'none';
  const el = wrapper;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (req) { try { req.call(el); } catch(e) {} }
  requestAnimationFrame(() => {
    const canvas = document.getElementById('fsCanvas');
    const wrap = document.getElementById('fsCanvasWrap');
    draw(canvas, wrap.clientWidth, wrap.clientHeight);
  });
  showFsHeaderH();
  wrapper.addEventListener('mousemove', showFsHeaderH);
  wrapper.addEventListener('click', showFsHeaderH);
  wrapper.addEventListener('touchstart', showFsHeaderH);
}

export function exitFsHistogram() {
  setIsFullscreen(false);
  clearTimeout(fsHideTimerH);
  const wrapper = document.getElementById('fullscreenWrapper');
  wrapper.classList.remove('active');
  wrapper.removeEventListener('mousemove', showFsHeaderH);
  wrapper.removeEventListener('click', showFsHeaderH);
  wrapper.removeEventListener('touchstart', showFsHeaderH);
  const header = document.querySelector('#fullscreenWrapper .fullscreen-header');
  header.classList.remove('auto-hide');
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if (fsEl && exit) { try { exit.call(document); } catch(e) {} }
  if (chartData) draw(document.getElementById('chartCanvas'));
}

function toggleFsHistogram() {
  if (isFullscreen) exitFsHistogram();
  else enterFsHistogram();
}

function updateStats() {
  if (!chartData) return;
  const vals = chartData.map(d => d.value);
  document.getElementById('statCount').textContent = vals.length;
  document.getElementById('statMax').textContent = Math.max(...vals);
  document.getElementById('statMin').textContent = Math.min(...vals);
  document.getElementById('statAvg').textContent = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
  document.getElementById('statSum').textContent = vals.reduce((a,b)=>a+b,0);
}

// ── Tooltip ──
(function() {
  const chartCanvas = document.getElementById('chartCanvas');
  const tooltip = document.getElementById('tooltip');
  chartCanvas.addEventListener('mousemove', e => {
    const rect = chartCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left) * (chartCanvas.width / dpr / rect.width);
    const my = (e.clientY - rect.top) * (chartCanvas.height / dpr / rect.height);
    let hit = null;
    for (const r of barRects) { if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) { hit = r; break; } }
    if (hit) {
      tooltip.classList.add('show');
      document.getElementById('ttLabel').textContent = hit.d.label;
      document.getElementById('ttValue').textContent = hit.d.value;
      tooltip.style.left = (e.clientX - rect.left) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
      tooltip.style.transform = 'translate(-50%, -100%)';
    } else { tooltip.classList.remove('show'); }
  });
  chartCanvas.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
})();

// ── Resize ──
window.addEventListener('resize', () => {
  if (chartData) draw(document.getElementById('chartCanvas'));
  if (isFullscreen) { const wrap = document.getElementById('fsCanvasWrap'); draw(document.getElementById('fsCanvas'), wrap.clientWidth, wrap.clientHeight); }
});

// ── Expose to window for HTML onclick handlers ──
window.renderChart = renderChart;
window.loadSample = loadSample;
window.setDirection = setDirection;
window.onTitleChange = onTitleChange;
window.onUnitChange = onUnitChange;
