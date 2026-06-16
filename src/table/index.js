// ── Table Module ──
import { T_PALETTES } from './palettes.js';
import { TABLE_STYLES } from './table-styles.js';
import { currentTool, isFullscreen, setIsFullscreen } from '../state.js';

let tableData = null;
let tCurrentPalette = 0;
let tCurrentStyle = 0;

// ── Init ──
export function initTable() {
  buildTPaletteGrid();
  buildTTableStyleGrid();
}

function buildTPaletteGrid() {
  const grid = document.getElementById('tPaletteGrid');
  grid.innerHTML = '';
  T_PALETTES.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'palette-card' + (i === tCurrentPalette ? ' active' : '');
    card.onclick = () => selectTPalette(i);
    const preview = document.createElement('div');
    preview.className = 'palette-dots';
    [p.headerBg, p.rowBg1, p.rowBg2, p.accent].forEach(c => {
      const d = document.createElement('div');
      d.className = 'palette-dot';
      d.style.background = c;
      preview.appendChild(d);
    });
    const name = document.createElement('div');
    name.className = 'palette-name';
    name.textContent = p.name + (p.type === 'light' ? ' ☀' : ' 🌙');
    card.appendChild(preview);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

function selectTPalette(i) {
  tCurrentPalette = i;
  document.querySelectorAll('#tPaletteGrid .palette-card').forEach((c, j) => c.classList.toggle('active', j === i));
  buildTTableStyleGrid();
  if (tableData) renderTable();
}

function buildTTableStyleGrid() {
  const grid = document.getElementById('tablestyleGrid');
  grid.innerHTML = '';
  const pal = T_PALETTES[tCurrentPalette];
  TABLE_STYLES.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'tablestyle-card' + (i === tCurrentStyle ? ' active' : '');
    card.onclick = () => selectTTableStyle(i);
    const icon = document.createElement('div');
    icon.className = 'tablestyle-icon';
    icon.innerHTML = s.icon(pal);
    const name = document.createElement('div');
    name.className = 'tablestyle-name';
    name.textContent = s.name;
    card.appendChild(icon);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

function selectTTableStyle(i) {
  tCurrentStyle = i;
  document.querySelectorAll('#tablestyleGrid .tablestyle-card').forEach((c, j) => c.classList.toggle('active', j === i));
  if (tableData) renderTable();
}

function getTTitle() {
  return document.getElementById('tTitleInput').value.trim();
}

function onTTitleChange() {
  if (tableData) renderTable();
}

function loadTSample() {
  const samples = [
    {"姓名": "张三", "部门": "技术部", "职位": "高级工程师", "年龄": 28, "薪资": 25000, "城市": "北京"},
    {"姓名": "李四", "部门": "市场部", "职位": "市场总监", "年龄": 35, "薪资": 32000, "城市": "上海"},
    {"姓名": "王五", "部门": "技术部", "职位": "架构师", "年龄": 42, "薪资": 45000, "城市": "深圳"},
    {"姓名": "赵六", "部门": "财务部", "职位": "财务主管", "年龄": 31, "薪资": 28000, "城市": "广州"},
    {"姓名": "孙七", "部门": "人事部", "职位": "HR经理", "年龄": 29, "薪资": 22000, "城市": "杭州"},
    {"姓名": "周八", "部门": "技术部", "职位": "前端开发", "年龄": 26, "薪资": 20000, "城市": "成都"},
    {"姓名": "吴九", "部门": "市场部", "职位": "品牌策划", "年龄": 33, "薪资": 26000, "城市": "武汉"},
    {"姓名": "郑十", "部门": "技术部", "职位": "测试工程师", "年龄": 27, "薪资": 18000, "city": "南京"}
  ];
  document.getElementById('tJsonInput').value = JSON.stringify(samples, null, 2);
  document.getElementById('tTitleInput').value = '员工信息总览';
  renderTable();
}

// ── Parse ──
function parseTData(input) {
  let parsed = JSON.parse(input);
  if (!Array.isArray(parsed)) throw new Error('请输入 JSON 数组');
  if (parsed.length === 0) throw new Error('数组不能为空');
  return parsed.map((item, i) => {
    if (typeof item === 'number' || typeof item === 'string') { return { '#': i + 1, '值': item }; }
    if (Array.isArray(item)) { const obj = {}; item.forEach((v, j) => { obj[`列${j+1}`] = v; }); return obj; }
    if (typeof item === 'object' && item !== null) return item;
    return { '#': i + 1, '值': String(item) };
  });
}

// ── Build Table HTML ──
function buildTableHTML(data, title, pal, styleIdx, isFs) {
  if (!data || data.length === 0) return '<p>无数据</p>';
  const keys = [];
  const keySet = new Set();
  data.forEach(row => { Object.keys(row).forEach(k => { if (!keySet.has(k)) { keySet.add(k); keys.push(k); } }); });
  const style = TABLE_STYLES[styleIdx];
  const table = document.createElement('table');
  table.className = 'gen-table';
  const styleCSS = style.apply(table, pal);
  let html = '';
  if (title) { html += `<div class="table-title" style="color:${pal.headerText};font-size:${isFs ? '1.4rem' : '1.1rem'};">${title}</div>`; }
  html += `<style>${styleCSS}</style>`;
  html += '<table class="gen-table">';
  html += '<thead><tr>';
  keys.forEach(k => { html += `<th>${k}</th>`; });
  html += '</tr></thead>';
  html += '<tbody>';
  data.forEach(row => {
    html += '<tr>';
    keys.forEach(k => { const val = row[k] !== undefined ? row[k] : ''; html += `<td>${val}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

// ── Render ──
export function renderTable() {
  const errEl = document.getElementById('tErrorMsg');
  const empty = document.getElementById('tEmptyState');
  const content = document.getElementById('tableContent');
  const toolbar = document.getElementById('tableToolbar');
  const statsBar = document.getElementById('tStatsBar');
  const disclaimer = document.getElementById('tableDisclaimer');
  const wrapper = document.getElementById('tableWrapper');
  try {
    errEl.textContent = '';
    const input = document.getElementById('tJsonInput').value.trim();
    if (!input) { errEl.textContent = '请输入数据'; return; }
    tableData = parseTData(input);
    const pal = T_PALETTES[tCurrentPalette];
    const title = getTTitle();
    wrapper.style.background = pal.bg;
    wrapper.style.borderRadius = '8px';
    wrapper.style.padding = '16px';
    content.innerHTML = buildTableHTML(tableData, title, pal, tCurrentStyle, false);
    empty.style.display = 'none';
    content.style.display = 'block';
    toolbar.style.display = 'flex';
    disclaimer.style.display = 'block';
    disclaimer.style.color = pal.headerText;
    disclaimer.style.opacity = '0.45';
    updateTStats();
  } catch(e) {
    errEl.textContent = e.message;
    tableData = null;
  }
}

function updateTStats() {
  if (!tableData) return;
  const keys = new Set();
  tableData.forEach(row => Object.keys(row).forEach(k => keys.add(k)));
  const keyArr = [...keys];
  let numCols = 0;
  keyArr.forEach(k => { if (tableData.some(row => typeof row[k] === 'number')) numCols++; });
  document.getElementById('statRows').textContent = tableData.length;
  document.getElementById('statCols').textContent = keyArr.length;
  document.getElementById('statNumCols').textContent = numCols;
  document.getElementById('statFields').textContent = keyArr.length > 4 ? keyArr.slice(0, 4).join(', ') + '…' : keyArr.join(', ');
}

// ── Fullscreen ──
let fsHideTimerT = null;

function showFsHeaderT() {
  const header = document.querySelector('#fullscreenWrapper .fullscreen-header');
  header.classList.remove('auto-hide');
  clearTimeout(fsHideTimerT);
  fsHideTimerT = setTimeout(() => { if (isFullscreen) header.classList.add('auto-hide'); }, 3000);
}

export function enterFsTable() {
  currentTool = 'table';
  const wrapper = document.getElementById('fullscreenWrapper');
  setIsFullscreen(true);
  wrapper.classList.add('active');
  const pal = T_PALETTES[tCurrentPalette];
  const title = getTTitle();
  const content = document.getElementById('fsContent');
  wrapper.style.background = pal.bg;
  content.innerHTML = buildTableHTML(tableData, title, pal, tCurrentStyle, true)
    + `<div class="table-disclaimer" style="text-align:right;font-size:.68rem;color:${pal.headerText};margin-top:10px;opacity:.45;">* 数据来源于网络，仅供参考</div>`;
  // Hide canvas wrap, show content div
  document.getElementById('fsCanvasWrap').style.display = 'none';
  content.style.display = 'block';
  document.getElementById('fsHeaderTitle').innerHTML = '📋 数据表格';
  const el = wrapper;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (req) { try { req.call(el); } catch(e) {} }
  showFsHeaderT();
  wrapper.addEventListener('mousemove', showFsHeaderT);
  wrapper.addEventListener('click', showFsHeaderT);
  wrapper.addEventListener('touchstart', showFsHeaderT);
}

export function exitFsTable() {
  setIsFullscreen(false);
  clearTimeout(fsHideTimerT);
  const wrapper = document.getElementById('fullscreenWrapper');
  wrapper.classList.remove('active');
  wrapper.removeEventListener('mousemove', showFsHeaderT);
  wrapper.removeEventListener('click', showFsHeaderT);
  wrapper.removeEventListener('touchstart', showFsHeaderT);
  const header = document.querySelector('#fullscreenWrapper .fullscreen-header');
  header.classList.remove('auto-hide');
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if (exit) { try { exit.call(document); } catch(e) {} }
}

function toggleFsTable() {
  if (isFullscreen) exitFsTable();
  else enterFsTable();
}

// ── Expose to window for HTML onclick handlers ──
window.renderTable = renderTable;
window.loadTSample = loadTSample;
window.onTTitleChange = onTTitleChange;
