import { currentTool, setCurrentTool, isFullscreen } from './state.js';

// Import exit functions from all chart modules
import { exitFsHistogram } from './histogram/index.js';
import { exitFsTable } from './table/index.js';
import { exitFsLineChart } from './linechart/index.js';
import { exitFsPieChart } from './piechart/index.js';
import { exitFsBubble } from './bubblechart/index.js';

export function switchTab(tab) {
  setCurrentTool(tab);
  document.getElementById('histogram-panel').style.display = tab === 'histogram' ? 'flex' : 'none';
  document.getElementById('linechart-panel').style.display = tab === 'linechart' ? 'flex' : 'none';
  document.getElementById('piechart-panel').style.display = tab === 'piechart' ? 'flex' : 'none';
  document.getElementById('table-panel').style.display = tab === 'table' ? 'flex' : 'none';
  document.getElementById('bubblechart-panel').style.display = tab === 'bubblechart' ? 'flex' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  // Exit fullscreen when switching tools
  if (isFullscreen) {
    if (tab !== 'histogram') exitFsHistogram();
    if (tab !== 'table') exitFsTable();
    if (tab !== 'linechart') exitFsLineChart();
    if (tab !== 'piechart') exitFsPieChart();
    if (tab !== 'bubblechart') exitFsBubble();
  }
}

// Bind tab buttons
document.querySelectorAll('.tab-btn').forEach(b => {
  b.addEventListener('click', () => switchTab(b.dataset.tab));
});

window.switchTab = switchTab;
