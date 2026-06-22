import { currentTool, isFullscreen, setIsFullscreen } from './state.js';

// Helper: get the enter function for a tool (dynamic import)
async function enterForTool(tool) {
  switch (tool) {
    case 'histogram': return (await import('./histogram/index.js')).enterFsHistogram();
    case 'linechart': return (await import('./linechart/index.js')).enterFsLineChart();
    case 'piechart': return (await import('./piechart/index.js')).enterFsPieChart();
    case 'bubblechart': return (await import('./bubblechart/index.js')).enterFsBubble();
    case 'table': return (await import('./table/index.js')).enterFsTable();
    case 'note': return; // Note tool has no fullscreen
  }
}

// Helper: get the exit function for a tool (dynamic import)
async function exitForTool(tool) {
  switch (tool) {
    case 'histogram': return (await import('./histogram/index.js')).exitFsHistogram();
    case 'linechart': return (await import('./linechart/index.js')).exitFsLineChart();
    case 'piechart': return (await import('./piechart/index.js')).exitFsPieChart();
    case 'bubblechart': return (await import('./bubblechart/index.js')).exitFsBubble();
    case 'table': return (await import('./table/index.js')).exitFsTable();
    case 'note': return; // Note tool has no fullscreen
  }
}

export function toggleFullscreen() {
  if (!isFullscreen) {
    enterForTool(currentTool);
  } else {
    exitForTool(currentTool);
  }
}

// Shared ESC handler
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isFullscreen) {
    exitForTool(currentTool);
  }
});

// Shared fullscreenchange listener — redraw on exit
function onFullscreenChangeShared() {
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (!fsEl && isFullscreen) {
    setIsFullscreen(false);
    document.getElementById('fullscreenWrapper').classList.remove('active');
    // Redraw current chart (match original core.js behavior)
    if (currentTool === 'histogram') {
      import('./histogram/index.js').then(m => {
        if (m.chartData && typeof m.draw === 'function') {
          const canvas = document.getElementById('chartCanvas');
          if (canvas) m.draw(canvas);
        }
      });
    }
    if (currentTool === 'linechart') {
      import('./linechart/index.js').then(m => {
        if (m.lineChartData && typeof m.drawLineChart === 'function') {
          const canvas = document.getElementById('lChartCanvas');
          if (canvas) m.drawLineChart(canvas);
        }
      });
    }
    if (currentTool === 'piechart') {
      import('./piechart/index.js').then(m => {
        if (m.pieChartData && typeof m.drawPie === 'function') {
          const canvas = document.getElementById('pieCanvas');
          if (canvas) m.drawPie(canvas);
        }
      });
    }
  }
}
document.addEventListener('fullscreenchange', onFullscreenChangeShared);
document.addEventListener('webkitfullscreenchange', onFullscreenChangeShared);
document.addEventListener('mozfullscreenchange', onFullscreenChangeShared);
document.addEventListener('MSFullscreenChange', onFullscreenChangeShared);

window.toggleFullscreen = toggleFullscreen;
