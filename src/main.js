import './style.js';
import './tab.js';
import './fullscreen.js';
import { initHistogram } from './histogram/index.js';
import { initLineChart } from './linechart/index.js';
import { initPieChart } from './piechart/index.js';
import { initBubbleChart } from './bubblechart/index.js';
import { initTable } from './table/index.js';

function boot() {
  initHistogram();
  initTable();
  initLineChart();
  initPieChart();
  initBubbleChart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
