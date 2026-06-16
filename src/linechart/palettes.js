// Line chart color palettes — 14 palettes
export const L_PALETTES = [
  {
    name: '梦幻紫', lineText: '#e4e6f0',
    bg: '#1a1028', grid: 'rgba(162,155,254,.1)', tickText: '#a29bfe', labelText: '#8b82be',
    colors: ['#6c5ce7','#a29bfe','#74b9ff','#00cec9','#55efc4','#fdcb6e','#e17055','#ff6b6b','#fd79a8','#e84393','#0984e3','#00b894','#ffeaa7','#fab1a0','#636e72']
  },
  {
    name: '日落橙', lineText: '#e4e6f0',
    bg: '#1f1410', grid: 'rgba(253,203,110,.1)', tickText: '#fdcb6e', labelText: '#c9a255',
    colors: ['#e17055','#fdcb6e','#e84393','#d63031','#f39c12','#e74c3c','#ff7675','#fab1a0','#fd79a8','#dfe6e9','#b2bec3','#636e72','#2d3436','#00cec9','#55efc4']
  },
  {
    name: '海洋蓝', lineText: '#e4e6f0',
    bg: '#0a1628', grid: 'rgba(116,185,255,.1)', tickText: '#74b9ff', labelText: '#5a8fc2',
    colors: ['#0984e3','#74b9ff','#00cec9','#55efc4','#00b894','#6c5ce7','#a29bfe','#fdcb6e','#e17055','#ff6b6b','#fd79a8','#e84393','#636e72','#b2bec3','#dfe6e9']
  },
  {
    name: '森林绿', lineText: '#e4e6f0',
    bg: '#0c1a14', grid: 'rgba(85,239,196,.1)', tickText: '#55efc4', labelText: '#3eaa8a',
    colors: ['#00b894','#55efc4','#00cec9','#74b9ff','#0984e3','#6c5ce7','#a29bfe','#fdcb6e','#e17055','#ff6b6b','#fd79a8','#e84393','#636e72','#b2bec3','#dfe6e9']
  },
  {
    name: '糖果色', lineText: '#e4e6f0',
    bg: '#1e1220', grid: 'rgba(253,121,168,.1)', tickText: '#fd79a8', labelText: '#c25e82',
    colors: ['#fd79a8','#a29bfe','#74b9ff','#55efc4','#fdcb6e','#e17055','#ff6b6b','#e84393','#6c5ce7','#00cec9','#00b894','#0984e3','#fab1a0','#dfe6e9','#636e72']
  },
  {
    name: '霓虹灯', lineText: '#e4e6f0',
    bg: '#120a1e', grid: 'rgba(255,107,107,.12)', tickText: '#ff6b6b', labelText: '#c25555',
    colors: ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0','#ff9f43','#ee5a24','#0abde3','#10ac84','#feca57','#c44569','#574b90']
  },
  {
    name: '莫兰迪', lineText: '#e4e6f0',
    bg: '#1a1918', grid: 'rgba(184,169,201,.1)', tickText: '#b8a9c9', labelText: '#8a7e96',
    colors: ['#b8a9c9','#d4b5a0','#a3b18a','#9db4c0','#c9ada7','#9a8c98','#c2b286','#b5838d','#6d6875','#e5989b','#ffb4a2','#b7b7a4','#a8a8a8','#cad2c5','#84a98c']
  },
  {
    name: '暗夜金', lineText: '#e4e6f0',
    bg: '#141008', grid: 'rgba(249,202,36,.1)', tickText: '#f9ca24', labelText: '#b89a2a',
    colors: ['#f9ca24','#f0932b','#eb4d4b','#6ab04c','#22a6b3','#be2edd','#4834d4','#130f40','#535c68','#f5cd79','#f19066','#e66767','#303952','#596275','#786fa6']
  },
  {
    name: '纯白简约', lineText: '#2d3436',
    bg: '#ffffff', grid: 'rgba(0,0,0,.07)', tickText: '#636e72', labelText: '#636e72',
    colors: ['#6c5ce7','#0984e3','#00b894','#e17055','#fdcb6e','#e84393','#00cec9','#ff6b6b','#a29bfe','#55efc4','#74b9ff','#fd79a8','#fab1a0','#b2bec3','#636e72']
  },
  {
    name: '浅灰优雅', lineText: '#2d3436',
    bg: '#f5f6fa', grid: 'rgba(0,0,0,.06)', tickText: '#636e72', labelText: '#636e72',
    colors: ['#6c5ce7','#0984e3','#00b894','#e17055','#fdcb6e','#e84393','#00cec9','#ff6b6b','#a29bfe','#55efc4','#74b9ff','#fd79a8','#fab1a0','#b2bec3','#dfe6e9']
  },
  {
    name: '暖阳米白', lineText: '#3d3328',
    bg: '#fdf8f0', grid: 'rgba(180,140,80,.1)', tickText: '#8a7a5a', labelText: '#8a7a5a',
    colors: ['#e17055','#f39c12','#e84393','#d63031','#fdcb6e','#e74c3c','#ff7675','#fab1a0','#fd79a8','#00b894','#00cec9','#55efc4','#6c5ce7','#a29bfe','#636e72']
  },
  {
    name: '薄荷清凉', lineText: '#1a3a2a',
    bg: '#f0faf6', grid: 'rgba(0,184,148,.1)', tickText: '#00b894', labelText: '#3d8a6a',
    colors: ['#00b894','#55efc4','#00cec9','#0984e3','#74b9ff','#6c5ce7','#a29bfe','#fdcb6e','#e17055','#ff6b6b','#fd79a8','#e84393','#fab1a0','#b2bec3','#636e72']
  },
  {
    name: '天空浅蓝', lineText: '#1a2a3d',
    bg: '#f0f6fd', grid: 'rgba(9,132,227,.08)', tickText: '#0984e3', labelText: '#4a7aa5',
    colors: ['#0984e3','#74b9ff','#00cec9','#55efc4','#00b894','#6c5ce7','#a29bfe','#fdcb6e','#e17055','#ff6b6b','#fd79a8','#e84393','#fab1a0','#b2bec3','#636e72']
  },
  {
    name: '樱花粉白', lineText: '#3d2830',
    bg: '#fef5f8', grid: 'rgba(232,67,147,.08)', tickText: '#e84393', labelText: '#b05a80',
    colors: ['#e84393','#fd79a8','#a29bfe','#74b9ff','#55efc4','#fdcb6e','#e17055','#ff6b6b','#6c5ce7','#00cec9','#00b894','#0984e3','#fab1a0','#b2bec3','#636e72']
  }
];
