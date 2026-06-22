import { setCurrentTool, isFullscreen, setIsFullscreen } from './state.js';

// Import exit functions from all chart modules
import { exitFsHistogram } from './histogram/index.js';
import { exitFsTable } from './table/index.js';
import { exitFsLineChart } from './linechart/index.js';
import { exitFsPieChart } from './piechart/index.js';
import { exitFsBubble } from './bubblechart/index.js';
import { resetNote } from './note/index.js';

const toolTitles = {
  histogram: '📊 直方图',
  linechart: '📈 折线图',
  piechart: '🥧 饼图',
  bubblechart: '🫧 气泡图',
  table: '📋 表格',
  note: '📝 轻量级笔记'
};

const toolPanels = ['histogram-panel', 'linechart-panel', 'piechart-panel', 'bubblechart-panel', 'table-panel', 'note-panel'];

export function switchTab(tab) {
  setCurrentTool(tab === 'home' ? 'home' : tab);

  const homePage = document.getElementById('home-page');
  const toolHeader = document.getElementById('tool-header');
  const toolTitle = document.getElementById('tool-title');

  if (tab === 'home') {
    // Show home page, hide everything else
    homePage.style.display = 'block';
    toolHeader.style.display = 'none';
    toolPanels.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // Reset note state
    resetNote();
  } else {
    // Hide home page, show tool header + selected panel
    homePage.style.display = 'none';
    toolHeader.style.display = 'block';
    toolTitle.textContent = toolTitles[tab] || '工具';

    toolPanels.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const panelMap = {
      histogram: 'histogram-panel',
      linechart: 'linechart-panel',
      piechart: 'piechart-panel',
      bubblechart: 'bubblechart-panel',
      table: 'table-panel',
      note: 'note-panel'
    };

    const panel = document.getElementById(panelMap[tab]);
    if (panel) {
      if (tab === 'note') {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'flex';
      }
    }

    // Exit fullscreen when switching tools
    if (isFullscreen) {
      if (tab !== 'histogram') exitFsHistogram();
      if (tab !== 'table') exitFsTable();
      if (tab !== 'linechart') exitFsLineChart();
      if (tab !== 'piechart') exitFsPieChart();
      if (tab !== 'bubblechart') exitFsBubble();
    }
  }

  // Update tab button active states (for legacy tab-btn if any)
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

window.switchTab = switchTab;
