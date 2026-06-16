// Table styles — 8 styles
const TABLE_STYLES = [
  {
    name: '经典线框',
    icon: (pal) => {
      const b = pal.border; const h = pal.headerBg;
      return `<div style="background:${pal.bg};padding:2px 3px;">
        <div style="background:${h};height:4px;border-bottom:1px solid ${b};margin-bottom:2px;"></div>
        <div style="height:3px;border-bottom:1px solid ${b};margin-bottom:2px;"></div>
        <div style="height:3px;border-bottom:1px solid ${b};"></div>
      </div>`;
    },
    apply: (table, pal) => {
      table.style.borderCollapse = 'collapse';
      const css = `
        .gen-table th { background:${pal.headerBg}; color:${pal.headerText}; border-bottom:2px solid ${pal.border}; font-weight:700; }
        .gen-table td { color:${pal.rowText}; border-bottom:1px solid ${pal.border}; }
        .gen-table tr:nth-child(even) td { background:${pal.rowBg2}; }
        .gen-table tr:nth-child(odd) td { background:${pal.rowBg1}; }
        .gen-table tr:hover td { background:${pal.hoverBg}; }
      `;
      return css;
    }
  },
  {
    name: '斑马条纹',
    icon: (pal) => {
      return `<div style="background:${pal.bg};padding:2px 3px;">
        <div style="background:${pal.headerBg};height:4px;margin-bottom:2px;"></div>
        <div style="background:${pal.rowBg2};height:3px;margin-bottom:2px;"></div>
        <div style="background:${pal.rowBg1};height:3px;margin-bottom:2px;"></div>
        <div style="background:${pal.rowBg2};height:3px;"></div>
      </div>`;
    },
    apply: (table, pal) => {
      table.style.borderCollapse = 'collapse';
      const css = `
        .gen-table th { background:${pal.headerBg}; color:${pal.headerText}; font-weight:700; }
        .gen-table td { color:${pal.rowText}; }
        .gen-table tr:nth-child(even) td { background:${pal.rowBg2}; }
        .gen-table tr:nth-child(odd) td { background:${pal.rowBg1}; }
        .gen-table tr:hover td { background:${pal.hoverBg}; }
        .gen-table th,.gen-table td { border:none; }
      `;
      return css;
    }
  },
  {
    name: '现代卡片',
    icon: (pal) => {
      return `<div style="background:${pal.bg};padding:2px 3px;">
        <div style="background:${pal.headerBg};height:4px;border-radius:2px 2px 0 0;margin-bottom:2px;"></div>
        <div style="background:${pal.rowBg1};height:3px;border-radius:0 0 2px 2px;margin-bottom:2px;border:1px solid ${pal.border};border-top:none;"></div>
        <div style="background:${pal.rowBg1};height:3px;border-radius:2px;border:1px solid ${pal.border};"></div>
      </div>`;
    },
    apply: (table, pal) => {
      table.style.borderCollapse = 'separate';
      table.style.borderSpacing = '0 4px';
      const css = `
        .gen-table th { background:${pal.headerBg}; color:${pal.headerText}; font-weight:700; border-radius:0; }
        .gen-table th:first-child { border-radius:6px 0 0 6px; }
        .gen-table th:last-child { border-radius:0 6px 6px 0; }
        .gen-table td { background:${pal.rowBg1}; color:${pal.rowText}; }
        .gen-table td:first-child { border-radius:6px 0 0 6px; }
        .gen-table td:last-child { border-radius:0 6px 6px 0; }
        .gen-table tr:hover td { background:${pal.hoverBg}; }
        .gen-table th,.gen-table td { border:none; }
      `;
      return css;
    }
  },
  {
    name: '简约无线',
    icon: (pal) => {
      return `<div style="background:${pal.bg};padding:2px 3px;">
        <div style="background:${pal.headerBg};height:4px;border-bottom:2px solid ${pal.accent};margin-bottom:3px;"></div>
        <div style="height:3px;margin-bottom:3px;"></div>
        <div style="height:3px;margin-bottom:3px;"></div>
        <div style="height:3px;"></div>
      </div>`;
    },
    apply: (table, pal) => {
      table.style.borderCollapse = 'collapse';
      const css = `
        .gen-table th { background:${pal.headerBg}; color:${pal.headerText}; font-weight:700; border-bottom:2px solid ${pal.accent}; }
        .gen-table td { color:${pal.rowText}; border:none; }
        .gen-table tr:nth-child(even) td { background:${pal.rowBg2}; }
        .gen-table tr:nth-child(odd) td { background:${pal.rowBg1}; }
        .gen-table tr:hover td { background:${pal.hoverBg}; }
      `;
      return css;
    }
  },
  {
    name: '圆角柔和',
    icon: (pal) => {
      return `<div style="background:${pal.bg};padding:2px 3px;">
        <div style="background:${pal.headerBg};height:4px;border-radius:3px 3px 0 0;margin-bottom:1px;"></div>
        <div style="background:${pal.rowBg1};height:3px;border:1px solid ${pal.border};border-top:none;border-radius:0 0 3px 3px;margin-bottom:2px;"></div>
        <div style="background:${pal.rowBg1};height:3px;border:1px solid ${pal.border};border-radius:3px;"></div>
      </div>`;
    },
    apply: (table, pal) => {
      table.style.borderCollapse = 'separate';
      table.style.borderSpacing = '0 3px';
      table.style.borderRadius = '8px';
      table.style.overflow = 'hidden';
      const css = `
        .gen-table th { background:${pal.headerBg}; color:${pal.headerText}; font-weight:700; }
        .gen-table td { background:${pal.rowBg1}; color:${pal.rowText}; }
        .gen-table tr:hover td { background:${pal.hoverBg}; }
        .gen-table th,.gen-table td { border:none; }
      `;
      return css;
    }
  },
  {
    name: '左侧强调',
    icon: (pal) => {
      return `<div style="background:${pal.bg};padding:2px 3px;">
        <div style="display:flex;height:4px;margin-bottom:2px;"><div style="width:3px;background:${pal.accent};border-radius:2px 0 0 2px;"></div><div style="flex:1;background:${pal.headerBg};"></div></div>
        <div style="display:flex;height:3px;margin-bottom:2px;"><div style="width:3px;background:${pal.accent};border-radius:2px 0 0 2px;"></div><div style="flex:1;background:${pal.rowBg2};"></div></div>
        <div style="display:flex;height:3px;"><div style="width:3px;background:${pal.accent};border-radius:2px 0 0 2px;"></div><div style="flex:1;background:${pal.rowBg1};"></div></div>
      </div>`;
    },
    apply: (table, pal) => {
      table.style.borderCollapse = 'collapse';
      const css = `
        .gen-table th { background:${pal.headerBg}; color:${pal.headerText}; font-weight:700; border-left:3px solid ${pal.accent}; }
        .gen-table td { color:${pal.rowText}; border-left:3px solid ${pal.accent}40; }
        .gen-table tr:nth-child(even) td { background:${pal.rowBg2}; }
        .gen-table tr:nth-child(odd) td { background:${pal.rowBg1}; }
        .gen-table tr:hover td { background:${pal.hoverBg}; border-left-color:${pal.accent}; }
        .gen-table th,.gen-table td { border-top:none;border-bottom:none;border-right:none; }
      `;
      return css;
    }
  },
  {
    name: '底部线框',
    icon: (pal) => {
      const b = pal.border;
      return `<div style="background:${pal.bg};padding:2px 3px;">
        <div style="background:${pal.headerBg};height:4px;border-bottom:2px solid ${pal.accent};margin-bottom:3px;"></div>
        <div style="height:3px;border-bottom:1px solid ${b};margin-bottom:3px;"></div>
        <div style="height:3px;border-bottom:1px solid ${b};margin-bottom:3px;"></div>
        <div style="height:3px;border-bottom:1px solid ${b};"></div>
      </div>`;
    },
    apply: (table, pal) => {
      table.style.borderCollapse = 'collapse';
      const css = `
        .gen-table th { background:${pal.headerBg}; color:${pal.headerText}; font-weight:700; border-bottom:2px solid ${pal.accent}; }
        .gen-table td { color:${pal.rowText}; border-bottom:1px solid ${pal.border}; }
        .gen-table tr:nth-child(even) td { background:${pal.rowBg2}; }
        .gen-table tr:nth-child(odd) td { background:${pal.rowBg1}; }
        .gen-table tr:hover td { background:${pal.hoverBg}; }
        .gen-table th,.gen-table td { border-left:none;border-right:none;border-top:none; }
      `;
      return css;
    }
  },
  {
    name: '全边框',
    icon: (pal) => {
      const b = pal.border;
      return `<div style="background:${pal.bg};padding:2px;border:1px solid ${b};border-radius:2px;">
        <div style="background:${pal.headerBg};height:4px;border-bottom:1px solid ${b};margin-bottom:2px;"></div>
        <div style="display:flex;gap:1px;margin-bottom:1px;"><div style="flex:1;height:3px;border:1px solid ${b};"></div><div style="flex:1;height:3px;border:1px solid ${b};"></div></div>
        <div style="display:flex;gap:1px;"><div style="flex:1;height:3px;border:1px solid ${b};"></div><div style="flex:1;height:3px;border:1px solid ${b};"></div></div>
      </div>`;
    },
    apply: (table, pal) => {
      table.style.borderCollapse = 'collapse';
      const css = `
        .gen-table { border:1px solid ${pal.border}; }
        .gen-table th { background:${pal.headerBg}; color:${pal.headerText}; font-weight:700; border:1px solid ${pal.border}; }
        .gen-table td { color:${pal.rowText}; border:1px solid ${pal.border}; }
        .gen-table tr:nth-child(even) td { background:${pal.rowBg2}; }
        .gen-table tr:nth-child(odd) td { background:${pal.rowBg1}; }
        .gen-table tr:hover td { background:${pal.hoverBg}; }
      `;
      return css;
    }
  }
];
