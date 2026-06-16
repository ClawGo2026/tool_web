// Shared utility functions

export function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function isLightColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160;
}

export function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function adjustColor(hex, amount) {
  let c = hex.replace('#', '');
  let r = Math.max(0, Math.min(255, parseInt(c.substr(0, 2), 16) + amount));
  let g = Math.max(0, Math.min(255, parseInt(c.substr(2, 2), 16) + amount));
  let b = Math.max(0, Math.min(255, parseInt(c.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
