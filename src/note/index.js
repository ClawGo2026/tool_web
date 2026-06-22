// ── Note Tool — integrated into web_tool ──
// Adapted from standalone 轻量级笔记.html, dark theme via theme.css vars

const K = 'lite_note_books';
let curBook = null, cfmCb = null, addMode = false, noteActiveActId = null;

const ico = {
  book: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>',
  plus: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  pencil: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  pencilSm: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  copySm: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  checkSm: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>',
  emptyB: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h8M8 11h6"/></svg>',
  emptyN: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>',
  emptyS: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/></svg>',
  export: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
};

// ── Data ──
function gd() { try { return JSON.parse(localStorage.getItem(K)) || [] } catch { return [] } }
function sd(b) { localStorage.setItem(K, JSON.stringify(b)) }
function gb(id) { return gd().find(b => b.id === id) }

// ── Nav ──
function noteGoHome() {
  curBook = null; addMode = false;
  document.getElementById('note-panel').className = 'note-vh';
  document.getElementById('noteTopTitle').textContent = '笔记';
  document.getElementById('btnNoteExHome').style.display = '';
  document.getElementById('btnNoteExNote').style.display = 'none';
  document.getElementById('noteHomeSearch').value = '';
  renderBooks();
}

function noteOpenBook(id) {
  curBook = id; addMode = false; const b = gb(id);
  document.getElementById('note-panel').className = 'note-vn';
  document.getElementById('noteTopTitle').textContent = b ? b.name : '';
  document.getElementById('btnNoteExHome').style.display = 'none';
  document.getElementById('btnNoteExNote').style.display = '';
  document.getElementById('noteSearchInput').value = '';
  renderNotes();
}

// ── Add Book ──
function showAddInput() {
  addMode = true; renderBooks();
  setTimeout(() => { const inp = document.getElementById('addBookInput'); if (inp) inp.focus(); }, 50);
}
function confirmAddBook() {
  const inp = document.getElementById('addBookInput'); if (!inp) return;
  const nm = inp.value.trim();
  if (nm) {
    const bs = gd();
    bs.unshift({ id: Date.now(), name: nm, records: [], createdAt: new Date().toLocaleString('zh-CN') });
    sd(bs); noteToast('已创建');
  }
  addMode = false; renderBooks();
}

// ── Delete / Rename ──
function delBook(id, ev) {
  ev.stopPropagation(); const b = gb(id);
  cfmShow(`删除「${b ? b.name : ''}」及其所有记录？`, () => {
    sd(gd().filter(x => x.id !== id)); renderBooks(); noteToast('已删除');
  });
}
function renameBook(id, ev) {
  ev.stopPropagation(); const b = gb(id); if (!b) return;
  const bodyEl = document.getElementById('nBkb-' + id); if (!bodyEl) return;
  bodyEl.innerHTML = `<input class="note-bk-rename-input" id="nBkr-${id}" value="${esc(b.name)}" maxlength="50" onkeydown="if(event.key==='Enter')confirmRename(${id})" onblur="confirmRename(${id})">`;
  const inp = document.getElementById('nBkr-' + id); inp.focus(); inp.select();
}
function confirmRename(id) {
  const inp = document.getElementById('nBkr-' + id); if (!inp) return;
  const nm = inp.value.trim();
  if (nm) { const bs = gd(), b = bs.find(x => x.id === id); if (b && b.name !== nm) { b.name = nm; sd(bs); if (curBook === id) document.getElementById('noteTopTitle').textContent = nm } }
  renderBooks();
}

// ── Render Books ──
function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function hlText(t, kw) { if (!kw) return esc(t); const s = esc(t), p = escRe(esc(kw)); return s.replace(new RegExp(`(${p})`, 'gi'), '<mark>$1</mark>') }

function renderBooks() {
  const bs = gd(), el = document.getElementById('noteBookList');
  const kw = document.getElementById('noteHomeSearch').value.trim();
  let filtered = bs;
  if (kw) { const lk = kw.toLowerCase(); filtered = bs.filter(b => b.name.toLowerCase().includes(lk)) }

  let html = '';
  if (addMode) {
    html += `<div class="note-bk-add-input">
      <span class="inp-ico">${ico.pencil}</span>
      <input type="text" id="addBookInput" placeholder="输入篇名..." maxlength="50" onkeydown="if(event.key==='Enter')confirmAddBook()">
      <button class="inp-save" onclick="confirmAddBook()" title="保存">${ico.check}</button>
    </div>`;
  } else {
    html += `<div class="note-bk-add-card" onclick="showAddInput()">
      ${ico.plus}
      <span>新建笔记</span>
    </div>`;
  }

  if (!filtered.length && kw) {
    html += `<div class="note-empty">${ico.emptyS}<p>没有匹配的笔记篇</p></div>`;
  } else {
    html += filtered.map(b => {
      const c = (b.records || []).length;
      return `<div class="note-bk-item" id="nBki-${b.id}" onclick="if(!event.target.closest('.note-bk-acts')&&!event.target.closest('.note-bk-rename-input'))noteOpenBook(${b.id})">
        <div class="note-bk-ico">${ico.book}</div>
        <div class="note-bk-body" id="nBkb-${b.id}"><div class="note-bk-name" id="nBkn-${b.id}">${hlText(b.name, kw)}</div><div class="note-bk-meta">${c} 条</div></div>
        <div class="note-bk-acts">
          <button class="note-bk-abtn" onclick="renameBook(${b.id},event)" title="重命名">${ico.pencilSm}</button>
          <button class="note-bk-abtn" onclick="exportSingleBook(event,${b.id},'json')" title="导出">${ico.export}</button>
          <button class="note-bk-abtn del" onclick="delBook(${b.id},event)" title="删除">${ico.trash}</button>
        </div>
      </div>`;
    }).join('');
  }
  el.innerHTML = html;
}

// ── Notes ──
function addNote() {
  if (!curBook) return; const inp = document.getElementById('noteInput'), t = inp.value.trim();
  if (!t) return; const bs = gd(), b = bs.find(x => x.id === curBook); if (!b) return;
  if (!b.records) b.records = [];
  b.records.unshift({ id: Date.now(), text: t, time: new Date().toLocaleString('zh-CN') });
  sd(bs); inp.value = ''; renderNotes(); noteToast('已添加');
}

function toggleActs(id, ev) {
  if (ev.target.closest('.note-n-acts') || ev.target.closest('.note-n-edit-area') || ev.target.closest('.note-n-edit-foot')) return;
  const item = document.getElementById('nNi-' + id), pre = document.getElementById('nNp-' + id); if (!item) return;
  if (noteActiveActId && noteActiveActId !== id) { const prev = document.getElementById('nNi-' + noteActiveActId); if (prev) prev.classList.remove('show-acts'); const pp = document.getElementById('nNp-' + noteActiveActId); if (pp) pp.classList.remove('expanded') }
  item.classList.toggle('show-acts');
  noteActiveActId = item.classList.contains('show-acts') ? id : null;
  if (pre && pre.scrollHeight > pre.clientHeight + 2) { pre.classList.toggle('expanded') }
}

function delNote(id, ev) {
  ev.stopPropagation(); if (!curBook) return;
  cfmShow('删除这条记录？', () => {
    const bs = gd(), b = bs.find(x => x.id === curBook); if (!b) return;
    b.records = (b.records || []).filter(r => r.id !== id); sd(bs); renderNotes(); noteToast('已删除');
  });
}

function renderNotes() {
  if (!curBook) return; const b = gb(curBook); if (!b) return;
  const kw = document.getElementById('noteSearchInput').value.trim();
  let rs = [...(b.records || [])].sort((a, b) => a.id - b.id);
  if (kw) { const lk = kw.toLowerCase(); rs = rs.filter(r => r.text.toLowerCase().includes(lk)) }
  const el = document.getElementById('noteNoteList');
  if (!rs.length) {
    el.innerHTML = `<div class="note-empty">${kw ? ico.emptyS : ico.emptyN}<p>${kw ? '没有匹配的记录' : '还没有记录'}</p></div>`; return;
  }
  el.innerHTML = rs.map(r => `<div class="note-n-item" id="nNi-${r.id}" data-id="${r.id}" onclick="toggleActs(${r.id},event)">
    <div class="note-n-pre" id="nNp-${r.id}">${hlText(r.text, kw)}</div>
    <div class="note-n-acts">
      <button class="note-n-abtn" onclick="editNote(${r.id},event)" title="编辑">${ico.pencilSm}</button>
      <button class="note-n-abtn" id="nNc-${r.id}" onclick="copyNoteInline(${r.id},event)" title="复制">${ico.copySm}</button>
      <button class="note-n-abtn del" onclick="delNote(${r.id},event)" title="删除">${ico.trash}</button>
    </div>
  </div>`).join('');
}

// ── Copy ──
function copyNoteInline(id, ev) {
  ev.stopPropagation(); if (!curBook) return;
  const b = gb(curBook), n = (b.records || []).find(r => r.id === id); if (!n) return;
  navigator.clipboard.writeText(n.text).then(() => {
    const btn = document.getElementById('nNc-' + id);
    if (btn) { btn.classList.add('copied'); btn.innerHTML = ico.checkSm; setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = ico.copySm }, 1200) }
    noteToast('已复制');
  });
}

// ── Edit ──
function editNote(id, ev) {
  ev.stopPropagation(); if (!curBook) return;
  const b = gb(curBook), n = (b.records || []).find(r => r.id === id); if (!n) return;
  const item = document.getElementById('nNi-' + id); if (!item) return;
  item.innerHTML = `<textarea class="note-n-edit-area" id="nNe-${id}">${esc(n.text)}</textarea>
  <div class="note-n-edit-foot">
    <button class="note-btn note-btn-g" onclick="cancelEdit(${id})" style="font-size:12px;padding:5px 10px">取消</button>
    <button class="note-btn note-btn-p" onclick="saveEdit(${id})" style="font-size:12px;padding:5px 10px">保存</button>
  </div>`;
  const ta = document.getElementById('nNe-' + id); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
}
function cancelEdit(id) { renderNotes() }
function saveEdit(id) {
  if (!curBook) return; const ta = document.getElementById('nNe-' + id); if (!ta) return;
  const newText = ta.value.trim(); if (!newText) { noteToast('内容不能为空'); return }
  const bs = gd(), b = bs.find(x => x.id === curBook); if (!b) return;
  const n = (b.records || []).find(r => r.id === id); if (!n) return;
  n.text = newText; sd(bs); renderNotes(); noteToast('已保存');
}

// ── Confirm ──
function cfmShow(msg, cb) { document.getElementById('noteCfmMsg').textContent = msg; cfmCb = cb; document.getElementById('noteCfm').classList.add('on') }
function cfmCancel() { document.getElementById('noteCfm').classList.remove('on'); cfmCb = null }
function cfmOk() { document.getElementById('noteCfm').classList.remove('on'); if (cfmCb) { cfmCb(); cfmCb = null } }

// ── Export / Import ──
function showExMenu() {
  const isHome = curBook === null;
  document.getElementById('noteExTitle').textContent = isHome ? '导出 / 导入' : '导出';
  document.getElementById('noteExDivider').style.display = isHome ? '' : 'none';
  document.getElementById('noteExImportOpt').style.display = isHome ? '' : 'none';
  document.getElementById('noteExMenu').classList.add('on');
}
function hideExMenu() { document.getElementById('noteExMenu').classList.remove('on') }

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(a.href);
}

function exportSingleBook(ev, bookId, fmt) {
  ev.stopPropagation(); const book = gb(bookId); if (!book) return;
  if (fmt === 'json') { const sorted = { ...book, records: [...(book.records || [])].sort((a, b) => a.id - b.id) }; downloadFile(`${book.name}.json`, JSON.stringify([sorted], null, 2), 'application/json') }
  else { downloadFile(`${book.name}.md`, bookToMd([book]), 'text/markdown') }
  noteToast('已导出');
}

function doExport(fmt) {
  hideExMenu();
  if (curBook === null) {
    const bs = gd(); if (!bs.length) { noteToast('没有可导出的笔记'); return }
    const ts = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    if (fmt === 'json') { const sorted = bs.map(b => ({ ...b, records: [...(b.records || [])].sort((a, b) => a.id - b.id) })); downloadFile(`笔记备份_${ts}.json`, JSON.stringify(sorted, null, 2), 'application/json') }
    else { downloadFile(`笔记备份_${ts}.md`, bookToMd(bs), 'text/markdown') }
  } else {
    const book = gb(curBook); if (!book) return;
    if (fmt === 'json') { const sorted = { ...book, records: [...(book.records || [])].sort((a, b) => a.id - b.id) }; downloadFile(`${book.name}.json`, JSON.stringify([sorted], null, 2), 'application/json') }
    else { downloadFile(`${book.name}.md`, bookToMd([book]), 'text/markdown') }
  }
  noteToast('已导出');
}

function bookToMd(books) {
  return books.map(b => {
    const rs = [...(b.records || [])].sort((a, b) => a.id - b.id);
    const body = rs.map(r => `### ${r.time}\n\n${r.text}`).join('\n\n---\n\n');
    return `# ${b.name}\n\n${body || '*暂无记录*'}`;
  }).join('\n\n---\n\n');
}

function triggerImport() { hideExMenu(); document.getElementById('noteImportFile').click() }

function randCode(n) { const c = 'abcdefghijklmnopqrstuvwxyz'; let s = ''; for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)]; return s }

function handleImport(ev) {
  const file = ev.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) { noteToast('格式不正确'); return }
      const valid = imported.every(b => b.name && Array.isArray(b.records));
      if (!valid) { noteToast('格式不正确'); return }
      const existing = gd(); const existingNames = new Set(existing.map(b => b.name));
      let added = 0, renamed = 0;
      imported.forEach(b => {
        let name = b.name;
        if (existingNames.has(name)) { name = `${name}_${randCode(6)}`; renamed++ }
        existingNames.add(name);
        existing.push({ id: Date.now() + Math.floor(Math.random() * 10000) + added, name, records: b.records.map((r, i) => ({ id: Date.now() + added * 1000 + i, text: r.text, time: r.time })), createdAt: b.createdAt || new Date().toLocaleString('zh-CN') });
        added++;
      });
      sd(existing); renderBooks();
      if (renamed > 0) noteToast(`已导入 ${added} 篇，${renamed} 篇重名已加后缀`);
      else noteToast(`已导入 ${added} 篇`);
    } catch (err) { noteToast('导入失败：文件格式错误') }
  };
  reader.readAsText(file); ev.target.value = '';
}

// ── Toast ──
function noteToast(m) { const t = document.getElementById('noteToast'); t.innerHTML = ico.check + ' ' + m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2000) }

// ── Init ──
export function initNote() {
  renderBooks();

  // Enter key to add note
  document.getElementById('noteInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); addNote() }
  });

  // Click outside to close actions
  document.addEventListener('click', e => {
    if (noteActiveActId && !e.target.closest('.note-n-item')) {
      const prev = document.getElementById('nNi-' + noteActiveActId);
      if (prev) prev.classList.remove('show-acts');
      const pp = document.getElementById('nNp-' + noteActiveActId);
      if (pp) pp.classList.remove('expanded');
      noteActiveActId = null;
    }
  });

  // Expose functions to global scope for onclick handlers
  Object.assign(window, {
    noteGoHome, noteOpenBook, showAddInput, confirmAddBook,
    delBook, renameBook, confirmRename, addNote, toggleActs, delNote,
    copyNoteInline, editNote, cancelEdit, saveEdit,
    cfmCancel, cfmOk,
    showExMenu, hideExMenu, exportSingleBook, doExport, triggerImport, handleImport
  });
}

// Reset note state when switching away
export function resetNote() {
  curBook = null; addMode = false;
  const panel = document.getElementById('note-panel');
  if (panel) panel.className = 'note-vh';
  const title = document.getElementById('noteTopTitle');
  if (title) title.textContent = '笔记';
  const btnHome = document.getElementById('btnNoteExHome');
  if (btnHome) btnHome.style.display = '';
  const btnNote = document.getElementById('btnNoteExNote');
  if (btnNote) btnNote.style.display = 'none';
}
