// ── Pie Chart Module ──
import { P_PALETTES } from './palettes.js';
import { PIE_STYLES } from './pie-styles.js';
import { currentTool, isFullscreen, setIsFullscreen } from '../state.js';
import { hexToRgba, truncate } from '../utils.js';

export let pieChartData = null;
let piePoints = [];
let pCurrentPalette = 0;
let pCurrentStyle = 0;

// ── Init ──
export function initPieChart() {
  buildPPaletteGrid();
  buildPPieStyleGrid();
}

function buildPPaletteGrid() {
  const grid = document.getElementById('pPaletteGrid');
  if (!grid) return;
  grid.innerHTML = '';
  P_PALETTES.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'palette-card' + (i === pCurrentPalette ? ' active' : '');
    card.onclick = () => selectPPalette(i);
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

function selectPPalette(i) {
  pCurrentPalette = i;
  document.querySelectorAll('#pPaletteGrid .palette-card').forEach((c, j) => c.classList.toggle('active', j === i));
  buildPPieStyleGrid();
  if (pieChartData) renderPieChart();
}

function buildPPieStyleGrid() {
  const grid = document.getElementById('pieStyleGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const pal = P_PALETTES[pCurrentPalette];
  PIE_STYLES.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'piestyle-card' + (i === pCurrentStyle ? ' active' : '');
    card.onclick = () => selectPPieStyle(i);
    const icon = document.createElement('div');
    icon.className = 'piestyle-icon';
    icon.innerHTML = s.icon(pal.colors);
    const name = document.createElement('div');
    name.className = 'piestyle-name';
    name.textContent = s.name;
    card.appendChild(icon);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

function selectPPieStyle(i) {
  pCurrentStyle = i;
  document.querySelectorAll('#pieStyleGrid .piestyle-card').forEach((c, j) => c.classList.toggle('active', j === i));
  if (pieChartData) renderPieChart();
}

function getPTitle() {
  return document.getElementById('pTitleInput').value.trim();
}

export function onPTitleChange() {
  if (pieChartData) renderPieChart();
}

export function loadPSample() {
  const samples = [
    { label: '产品A', value: 35 },
    { label: '产品B', value: 28 },
    { label: '产品C', value: 20 },
    { label: '产品D', value: 12 },
    { label: '产品E', value: 5 }
  ];
  document.getElementById('pJsonInput').value = JSON.stringify(samples, null, 2);
  document.getElementById('pTitleInput').value = '市场份额分布';
  renderPieChart();
}

// ── Parse ──
function parsePData(input) {
  let parsed = JSON.parse(input);
  if (!Array.isArray(parsed)) throw new Error('请输入 JSON 数组');
  if (parsed.length === 0) throw new Error('数组不能为空');
  return parsed.map((item, i) => {
    if (typeof item === 'object' && item !== null) {
      const val = item.value ?? item.v ?? item.y ?? item[Object.keys(item).find(k => typeof item[k] === 'number')] ?? 0;
      const lbl = item.label ?? item.name ?? item.x ?? item.key ?? `#${i+1}`;
      return { label: String(lbl), value: Number(val) };
    }
    if (typeof item === 'number') return { label: `#${i+1}`, value: item };
    return { label: String(item), value: Number(item) || 0 };
  }).filter(d => d.value > 0);
}

// ── Render ──
export function renderPieChart() {
  const errEl = document.getElementById('pErrorMsg');
  const canvas = document.getElementById('pieCanvas');
  const empty = document.getElementById('pEmptyState');
  const statsBar = document.getElementById('pStatsBar');
  const toolbar = document.getElementById('pieToolbar');
  try {
    errEl.textContent = '';
    const input = document.getElementById('pJsonInput').value.trim();
    if (!input) { errEl.textContent = '请输入数据'; return; }
    pieChartData = parsePData(input);
    if (pieChartData.length === 0) { errEl.textContent = '没有有效的正数数据'; return; }
    empty.style.display = 'none';
    canvas.style.display = 'block';
    toolbar.style.display = 'flex';
    document.getElementById('pieWrapper').style.background = P_PALETTES[pCurrentPalette].bg;
    document.getElementById('pieWrapper').style.borderRadius = '8px';
    document.getElementById('pieWrapper').style.overflow = 'hidden';
    drawPie(canvas);
    updatePStats();
    statsBar.style.display = 'flex';
    document.getElementById('pieDisclaimer').style.display = 'block';
  } catch(e) {
    errEl.textContent = e.message;
    pieChartData = null;
  }
}

export function drawPie(canvas, overrideW, overrideH) {
  const wrapper = overrideW ? null : document.getElementById('pieWrapper');
  const dpr = window.devicePixelRatio || 1;
  const W = overrideW || wrapper.clientWidth;
  const H = overrideH || Math.max(360, Math.min(520, W * 0.7));
  const pal = P_PALETTES[pCurrentPalette];
  const isHalf = PIE_STYLES[pCurrentStyle].name === '半圆图';
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);
  if (!pieChartData || pieChartData.length === 0) return;

  const title = getPTitle();
  const titleSpace = title ? 32 : 0;
  const padding = { top: 20 + titleSpace, right: 16, bottom: 20, left: 16 };

  if (title) {
    ctx.fillStyle = pal.labelText;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, W / 2, 12);
  }

  const availW = W - padding.left - padding.right;
  const availH = H - padding.top - padding.bottom;
  const radius = Math.min(availW, availH) * 0.38;
  const cx = W / 2;
  const cy = isHalf ? padding.top + (H - padding.top - padding.bottom) * 0.55 : H / 2;

  const total = pieChartData.reduce((s, d) => s + d.value, 0);
  const colors = pal.colors;
  const segments = pieChartData.map((d, i) => ({
    label: d.label,
    value: d.value,
    color: colors[i % colors.length],
    ratio: d.value / total
  }));

  piePoints = [];
  PIE_STYLES[pCurrentStyle].drawPie(ctx, cx, cy, radius, segments);

  // Label lines and text
  let startAngle = isHalf ? Math.PI : -Math.PI / 2;
  const labelR = radius + 20;
  const textR = radius + 32;
  segments.forEach((seg, i) => {
    const sliceAngle = seg.ratio * (isHalf ? Math.PI : Math.PI * 2);
    const midAngle = startAngle + sliceAngle / 2;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;
    const tx = cx + Math.cos(midAngle) * textR;
    const ty = cy + Math.sin(midAngle) * textR;

    piePoints.push({
      cx, cy, radius,
      startAngle, endAngle: startAngle + sliceAngle,
      midAngle, seg
    });

    // Line
    ctx.strokeStyle = hexToRgba(colors[i % colors.length], 0.7);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(midAngle) * (radius - 2),
      cy + Math.sin(midAngle) * (radius - 2)
    );
    ctx.lineTo(lx, ly);
    ctx.stroke();

    // Dot at end of line
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(lx, ly, 2, 0, Math.PI * 2);
    ctx.fill();

    // Text
    const pct = (seg.ratio * 100).toFixed(1);
    const text = `${seg.label} ${pct}%`;
    const isLeft = Math.cos(midAngle) < 0;
    ctx.fillStyle = pal.labelText;
    ctx.font = '11px sans-serif';
    ctx.textAlign = isLeft ? 'right' : 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, tx, ty);

    startAngle += sliceAngle;
  });
}

// ── Stats ──
function updatePStats() {
  if (!pieChartData) return;
  const vals = pieChartData.map(d => d.value);
  const total = vals.reduce((a, b) => a + b, 0);
  const maxItem = pieChartData.reduce((a, b) => a.value >= b.value ? a : b);
  document.getElementById('pStatCount').textContent = vals.length;
  document.getElementById('pStatTotal').textContent = total;
  document.getElementById('pStatPct').textContent = maxItem.value > 0 ? (maxItem.value / total * 100).toFixed(1) + '%' : '-';
}

// ── Fullscreen ──
let fsHideTimerP = null;

function showFsHeaderP() {
  const header = document.querySelector('#fullscreenWrapper .fullscreen-header');
  header.classList.remove('auto-hide');
  clearTimeout(fsHideTimerP);
  fsHideTimerP = setTimeout(() => { if (isFullscreen) header.classList.add('auto-hide'); }, 3000);
}

export function enterFsPieChart() {
  currentTool = 'piechart';
  setIsFullscreen(true);
  const wrapper = document.getElementById('fullscreenWrapper');
  wrapper.classList.add('active');
  const title = getPTitle();
  document.getElementById('fsTitle').textContent = title ? '— ' + title : '';
  document.getElementById('fsHeaderTitle').innerHTML = '🥧 饼图 <span class="fs-title" id="fsTitle"></span>';
  const pal = P_PALETTES[pCurrentPalette];
  wrapper.style.background = pal.bg;
  document.getElementById('fsCanvasWrap').style.display = 'block';
  document.getElementById('fsContent').style.display = 'none';
  const el = wrapper;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (req) { try { req.call(el); } catch(e) {} }
  requestAnimationFrame(() => {
    const canvas = document.getElementById('fsCanvas');
    const wrap = document.getElementById('fsCanvasWrap');
    drawPie(canvas, wrap.clientWidth, wrap.clientHeight);
  });
  showFsHeaderP();
  wrapper.addEventListener('mousemove', showFsHeaderP);
  wrapper.addEventListener('click', showFsHeaderP);
  wrapper.addEventListener('touchstart', showFsHeaderP);
}

export function exitFsPieChart() {
  setIsFullscreen(false);
  clearTimeout(fsHideTimerP);
  const wrapper = document.getElementById('fullscreenWrapper');
  wrapper.classList.remove('active');
  wrapper.removeEventListener('mousemove', showFsHeaderP);
  wrapper.removeEventListener('click', showFsHeaderP);
  wrapper.removeEventListener('touchstart', showFsHeaderP);
  const header = document.querySelector('#fullscreenWrapper .fullscreen-header');
  header.classList.remove('auto-hide');
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if (exit) { try { exit.call(document); } catch(e) {} }
  if (pieChartData) drawPie(document.getElementById('pieCanvas'));
}

// ── Tooltip ──
(function() {
  const canvas = document.getElementById('pieCanvas');
  const tooltip = document.getElementById('pieTooltip');
  if (!canvas || !tooltip) return;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / dpr / rect.height);
    let hit = null;
    for (const p of piePoints) {
      const dx = mx - p.cx;
      const dy = my - p.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= p.radius && dist >= p.radius * 0.3) {
        let angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;
        let end = p.endAngle;
        if (end > Math.PI * 1.5) end -= Math.PI * 2;
        if (angle >= p.startAngle && angle <= end) {
          hit = p;
          break;
        }
      }
    }
    if (hit) {
      tooltip.classList.add('show');
      document.getElementById('pieTtLabel').textContent = hit.seg.label;
      document.getElementById('pieTtValue').textContent = hit.seg.value + ' (' + (hit.seg.ratio * 100).toFixed(1) + '%)';
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
  const resizePie = () => {
    if (pieChartData) drawPie(document.getElementById('pieCanvas'));
    if (isFullscreen && currentTool === 'piechart') {
      const wrap = document.getElementById('fsCanvasWrap');
      drawPie(document.getElementById('fsCanvas'), wrap.clientWidth, wrap.clientHeight);
    }
  };
  resizePie();
});

// ── Window exports for HTML onclick ──
window.renderPieChart = renderPieChart;
window.loadPSample = loadPSample;
window.onPTitleChange = onPTitleChange;
