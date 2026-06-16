// ── Core Module ──
// Shared state — must be declared here (loaded after all tool modules)
let currentTool = 'histogram';

// ── Tab Switching ──
function switchTab(tab) {
  currentTool = tab;
  document.getElementById('histogram-panel').style.display = tab === 'histogram' ? 'flex' : 'none';
  document.getElementById('linechart-panel').style.display = tab === 'linechart' ? 'flex' : 'none';
  document.getElementById('piechart-panel').style.display = tab === 'piechart' ? 'flex' : 'none';
  document.getElementById('table-panel').style.display = tab === 'table' ? 'flex' : 'none';
  document.getElementById('bubblechart-panel').style.display = tab === 'bubblechart' ? 'flex' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  // Exit fullscreen when switching tools to avoid stale overlay
  if (typeof isFullscreen !== 'undefined' && isFullscreen) {
    if (tab !== 'histogram' && typeof exitFsHistogram === 'function') exitFsHistogram();
    if (tab !== 'table' && typeof exitFsTable === 'function') exitFsTable();
    if (tab !== 'linechart' && typeof exitFsLineChart === 'function') exitFsLineChart();
    if (tab !== 'piechart' && typeof exitFsPieChart === 'function') exitFsPieChart();
    if (tab !== 'bubblechart' && typeof exitFsBubble === 'function') exitFsBubble();
  }
}

// Bind tab buttons
(function() {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });
})();

// ── Shared Fullscreen Toggle (used by toolbar buttons in each panel) ──
function toggleFullscreen() {
  if (!isFullscreen) {
    if (currentTool === 'histogram' && typeof enterFsHistogram === 'function') enterFsHistogram();
    else if (currentTool === 'table' && typeof enterFsTable === 'function') enterFsTable();
    else if (currentTool === 'linechart' && typeof enterFsLineChart === 'function') enterFsLineChart();
    else if (currentTool === 'piechart' && typeof enterFsPieChart === 'function') enterFsPieChart();
    else if (currentTool === 'bubblechart' && typeof enterFsBubble === 'function') enterFsBubble();
  } else {
    if (currentTool === 'histogram' && typeof exitFsHistogram === 'function') exitFsHistogram();
    else if (currentTool === 'table' && typeof exitFsTable === 'function') exitFsTable();
    else if (currentTool === 'linechart' && typeof exitFsLineChart === 'function') exitFsLineChart();
    else if (currentTool === 'piechart' && typeof exitFsPieChart === 'function') exitFsPieChart();
    else if (currentTool === 'bubblechart' && typeof exitFsBubble === 'function') exitFsBubble();
  }
}

// ── Shared ESC Handler ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isFullscreen) {
    if (currentTool === 'histogram' && typeof exitFsHistogram === 'function') exitFsHistogram();
    else if (currentTool === 'table' && typeof exitFsTable === 'function') exitFsTable();
    else if (currentTool === 'linechart' && typeof exitFsLineChart === 'function') exitFsLineChart();
    else if (currentTool === 'piechart' && typeof exitFsPieChart === 'function') exitFsPieChart();
    else if (currentTool === 'bubblechart' && typeof exitFsBubble === 'function') exitFsBubble();
  }
});

// ── Shared Fullscreenchange Listener ──
function onFullscreenChangeShared() {
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (!fsEl && isFullscreen) {
    isFullscreen = false;
    document.getElementById('fullscreenWrapper').classList.remove('active');
    if (currentTool === 'histogram' && typeof chartData !== 'undefined' && chartData && typeof draw === 'function') {
      const canvas = document.getElementById('chartCanvas');
      if (canvas) draw(canvas);
    }
    if (currentTool === 'linechart' && typeof lineChartData !== 'undefined' && lineChartData && typeof drawLine === 'function') {
      const canvas = document.getElementById('lineCanvas');
      if (canvas) drawLine(canvas);
    }
    if (currentTool === 'piechart' && typeof pieChartData !== 'undefined' && pieChartData && typeof drawPie === 'function') {
      const canvas = document.getElementById('pieCanvas');
      if (canvas) drawPie(canvas);
    }
  }
}
document.addEventListener('fullscreenchange', onFullscreenChangeShared);
document.addEventListener('webkitfullscreenchange', onFullscreenChangeShared);
document.addEventListener('mozfullscreenchange', onFullscreenChangeShared);
document.addEventListener('MSFullscreenChange', onFullscreenChangeShared);

// ── Initialize All Tools ──
(function() {
  function boot() {
    if (typeof initHistogram === 'function') initHistogram();
    if (typeof initTable === 'function') initTable();
    if (typeof initLineChart === 'function') initLineChart();
    if (typeof initPieChart === 'function') initPieChart();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
