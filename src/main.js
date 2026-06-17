import './style.js';
import './tab.js';
import './fullscreen.js';
import { initHistogram } from './histogram/index.js';
import { initLineChart } from './linechart/index.js';
import { initPieChart } from './piechart/index.js';
import { initBubbleChart } from './bubblechart/index.js';
import { initTable } from './table/index.js';

// ── Global copy & dropdown helpers ──
window.copyInput = function(textareaId) {
  const ta = document.getElementById(textareaId);
  if (!ta) return;
  navigator.clipboard.writeText(ta.value).then(() => {
    const btn = ta.parentElement.querySelector('.copy-btn');
    if (btn) {
      btn.classList.add('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
      }, 1500);
    }
  });
};

window.toggleSampleMenu = function(btn) {
  const dropdown = btn.nextElementSibling;
  const isOpen = dropdown.classList.contains('open');
  // Close all dropdowns first
  document.querySelectorAll('.sample-dropdown.open').forEach(d => d.classList.remove('open'));
  if (!isOpen) dropdown.classList.add('open');
};

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sample-wrap')) {
    document.querySelectorAll('.sample-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

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
