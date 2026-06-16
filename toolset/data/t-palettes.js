// Table color palettes — 13 palettes (7 dark + 6 light)
const T_PALETTES = [
  {
    name: '梦幻紫', type:'dark',
    bg:'#1a1028', surface:'#241a3a', headerBg:'#2d1f4e', headerText:'#c8b8f0',
    rowBg1:'#1e1430', rowBg2:'#241a3a', rowText:'#d0c4ee', border:'#3a2860',
    hoverBg:'#322455', accent:'#a29bfe'
  },
  {
    name: '深邃蓝', type:'dark',
    bg:'#0a1628', surface:'#101e34', headerBg:'#142844', headerText:'#90b8e0',
    rowBg1:'#0e1a2e', rowBg2:'#121f36', rowText:'#b0cce8', border:'#1e3454',
    hoverBg:'#1a2e4a', accent:'#74b9ff'
  },
  {
    name: '暗夜绿', type:'dark',
    bg:'#0c1a14', surface:'#122418', headerBg:'#163020', headerText:'#80c8a0',
    rowBg1:'#0e1e16', rowBg2:'#122418', rowText:'#a0d8b8', border:'#1e4030',
    hoverBg:'#183028', accent:'#55efc4'
  },
  {
    name: '暗夜金', type:'dark',
    bg:'#141008', surface:'#1e1a10', headerBg:'#2a2210', headerText:'#e0c860',
    rowBg1:'#181408', rowBg2:'#1e1a10', rowText:'#d8c878', border:'#3a3018',
    hoverBg:'#282018', accent:'#f9ca24'
  },
  {
    name: '酒红', type:'dark',
    bg:'#1a0a0a', surface:'#241010', headerBg:'#3a1414', headerText:'#e09090',
    rowBg1:'#200e0e', rowBg2:'#281212', rowText:'#d8a8a8', border:'#4a2020',
    hoverBg:'#341818', accent:'#ff6b6b'
  },
  {
    name: '莫兰迪', type:'dark',
    bg:'#1a1918', surface:'#222120', headerBg:'#2e2d2a', headerText:'#c0b8b0',
    rowBg1:'#1e1d1c', rowBg2:'#242322', rowText:'#b8b0a8', border:'#3a3836',
    hoverBg:'#2e2c2a', accent:'#b8a9c9'
  },
  {
    name: '碳黑', type:'dark',
    bg:'#111111', surface:'#1a1a1a', headerBg:'#222222', headerText:'#cccccc',
    rowBg1:'#161616', rowBg2:'#1e1e1e', rowText:'#bbbbbb', border:'#333333',
    hoverBg:'#282828', accent:'#888888'
  },
  {
    name: '纯白简约', type:'light',
    bg:'#ffffff', surface:'#fafafa', headerBg:'#f0f0f0', headerText:'#333333',
    rowBg1:'#ffffff', rowBg2:'#f8f8f8', rowText:'#444444', border:'#e0e0e0',
    hoverBg:'#f0f5ff', accent:'#6c5ce7'
  },
  {
    name: '浅灰优雅', type:'light',
    bg:'#f5f6fa', surface:'#f0f1f5', headerBg:'#e8e9ef', headerText:'#2d3436',
    rowBg1:'#f5f6fa', rowBg2:'#ecedf2', rowText:'#444444', border:'#d8d9e0',
    hoverBg:'#e8ecf5', accent:'#6c5ce7'
  },
  {
    name: '天空蓝', type:'light',
    bg:'#f0f6fd', surface:'#eaf2fa', headerBg:'#dce8f5', headerText:'#1a3a5a',
    rowBg1:'#f0f6fd', rowBg2:'#e8f0f8', rowText:'#2a4a6a', border:'#c8d8e8',
    hoverBg:'#dce8f5', accent:'#0984e3'
  },
  {
    name: '薄荷绿', type:'light',
    bg:'#f0faf6', surface:'#eaf8f2', headerBg:'#dcf0e8', headerText:'#1a3a2a',
    rowBg1:'#f0faf6', rowBg2:'#e8f4ee', rowText:'#2a4a3a', border:'#c0e0d0',
    hoverBg:'#dceee4', accent:'#00b894'
  },
  {
    name: '暖阳米白', type:'light',
    bg:'#fdf8f0', surface:'#f8f2e8', headerBg:'#f0e8d8', headerText:'#4a3a20',
    rowBg1:'#fdf8f0', rowBg2:'#f8f0e0', rowText:'#5a4a30', border:'#e0d0b8',
    hoverBg:'#f0e8d0', accent:'#e17055'
  },
  {
    name: '樱花粉', type:'light',
    bg:'#fef5f8', surface:'#faf0f4', headerBg:'#f5e0ea', headerText:'#4a2030',
    rowBg1:'#fef5f8', rowBg2:'#faeef2', rowText:'#5a3040', border:'#e8c8d8',
    hoverBg:'#f5e0ea', accent:'#e84393'
  }
];
