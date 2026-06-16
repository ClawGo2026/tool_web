// Bar styles — 15 styles for histogram chart
const BAR_STYLES = [
  {
    name: '经典渐变',
    icon: (c) => `<svg viewBox="0 0 28 20"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c}"/><stop offset="100%" stop-color="${adjustColor(c,-40)}"/></linearGradient></defs><rect x="1" y="4" width="8" height="15" rx="2" fill="url(#g)"/><rect x="11" y="8" width="8" height="11" rx="2" fill="url(#g)"/><rect x="21" y="1" width="6" height="18" rx="2" fill="url(#g)"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      roundRect(ctx, x+2, y+2, w, h, 4); ctx.fill();
      const grad = isV
        ? ctx.createLinearGradient(x, y, x, y+h)
        : ctx.createLinearGradient(x, y, x+w, y);
      grad.addColorStop(0, color);
      grad.addColorStop(1, adjustColor(color, -30));
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, w, h, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.15)';
      if (isV) { roundRect(ctx, x, y, w, Math.min(h,6), 4); ctx.fill(); }
      else { roundRect(ctx, x+w-Math.min(w,6), y, Math.min(w,6), h, 4); ctx.fill(); }
    }
  },
  {
    name: '扁平纯色',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="1" y="4" width="8" height="15" rx="1" fill="${c}"/><rect x="11" y="8" width="8" height="11" rx="1" fill="${c}"/><rect x="21" y="1" width="6" height="18" rx="1" fill="${c}"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      ctx.fillStyle = color;
      roundRect(ctx, x, y, w, h, 3); ctx.fill();
    }
  },
  {
    name: '胶囊圆角',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="1" y="4" width="8" height="15" rx="4" fill="${c}"/><rect x="11" y="8" width="8" height="11" rx="4" fill="${c}"/><rect x="21" y="1" width="6" height="18" rx="3" fill="${c}"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const r = Math.min(w, h) / 2;
      ctx.fillStyle = color;
      roundRect(ctx, x, y, w, h, r); ctx.fill();
    }
  },
  {
    name: '描边空心',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="1" y="4" width="8" height="15" rx="2" fill="none" stroke="${c}" stroke-width="1.5"/><rect x="11" y="8" width="8" height="11" rx="2" fill="none" stroke="${c}" stroke-width="1.5"/><rect x="21" y="1" width="6" height="18" rx="2" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, w, h, 4); ctx.stroke();
      ctx.fillStyle = hexToRgba(color, 0.08);
      roundRect(ctx, x, y, w, h, 4); ctx.fill();
    }
  },
  {
    name: '3D立体',
    icon: (c) => {
      const d = adjustColor(c, -35);
      return `<svg viewBox="0 0 28 20"><polygon points="1,4 9,4 11,2 3,2" fill="${d}"/><rect x="1" y="4" width="8" height="15" fill="${c}"/><polygon points="11,8 19,8 21,6 13,6" fill="${d}"/><rect x="11" y="8" width="8" height="11" fill="${c}"/><polygon points="21,1 27,1 29,-1 23,-1" fill="${d}"/><rect x="21" y="1" width="6" height="18" fill="${c}"/></svg>`;
    },
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      const depth = Math.max(3, w * 0.2);
      const dark = adjustColor(color, -40);
      if (isV) {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w + depth, y - depth);
        ctx.lineTo(x + w + depth, y + h - depth);
        ctx.lineTo(x + w, y + h);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = adjustColor(color, 15);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth, y - depth);
        ctx.lineTo(x + w + depth, y - depth);
        ctx.lineTo(x + w, y);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + depth, y + h + depth);
        ctx.lineTo(x + w + depth, y + h + depth);
        ctx.lineTo(x + w, y + h);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = adjustColor(color, 15);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth, y - depth);
        ctx.lineTo(x + w + depth, y - depth);
        ctx.lineTo(x + w, y);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }
  },
  {
    name: '玻璃质感',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="1" y="4" width="8" height="15" rx="2" fill="${c}" opacity=".6"/><rect x="1" y="4" width="8" height="7" rx="2" fill="white" opacity=".25"/><rect x="11" y="8" width="8" height="11" rx="2" fill="${c}" opacity=".6"/><rect x="11" y="8" width="8" height="5" rx="2" fill="white" opacity=".25"/><rect x="21" y="1" width="6" height="18" rx="2" fill="${c}" opacity=".6"/><rect x="21" y="1" width="6" height="8" rx="2" fill="white" opacity=".25"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      ctx.fillStyle = 'rgba(0,0,0,.1)';
      roundRect(ctx, x+1, y+1, w, h, 4); ctx.fill();
      ctx.fillStyle = hexToRgba(color, 0.55);
      roundRect(ctx, x, y, w, h, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      if (isV) roundRect(ctx, x+2, y+2, w-4, h*0.4, 3);
      else roundRect(ctx, x+2, y+2, w*0.4, h-4, 3);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(color, 0.7);
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, w, h, 4); ctx.stroke();
    }
  },
  {
    name: '条纹填充',
    icon: (c) => `<svg viewBox="0 0 28 20"><defs><pattern id="s" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="${c}" stroke-width="2"/></pattern></defs><rect x="1" y="4" width="8" height="15" rx="1" fill="${c}" opacity=".3"/><rect x="1" y="4" width="8" height="15" rx="1" fill="url(#s)"/><rect x="11" y="8" width="8" height="11" rx="1" fill="${c}" opacity=".3"/><rect x="11" y="8" width="8" height="11" rx="1" fill="url(#s)"/><rect x="21" y="1" width="6" height="18" rx="1" fill="${c}" opacity=".3"/><rect x="21" y="1" width="6" height="18" rx="1" fill="url(#s)"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      ctx.fillStyle = hexToRgba(color, 0.25);
      roundRect(ctx, x, y, w, h, 3); ctx.fill();
      ctx.save();
      roundRect(ctx, x, y, w, h, 3); ctx.clip();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      const step = 6;
      const isV = dir === 'vertical';
      if (isV) {
        for (let s = -h; s < w + h; s += step) {
          ctx.beginPath(); ctx.moveTo(x+s, y+h); ctx.lineTo(x+s+h, y); ctx.stroke();
        }
      } else {
        for (let s = -w; s < w + h; s += step) {
          ctx.beginPath(); ctx.moveTo(x, y+s); ctx.lineTo(x+w, y+s+w); ctx.stroke();
        }
      }
      ctx.restore();
    }
  },
  {
    name: '霓虹发光',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="2" y="5" width="6" height="13" rx="2" fill="${c}" opacity=".2"/><rect x="2" y="5" width="6" height="13" rx="2" fill="none" stroke="${c}" stroke-width="1"/><rect x="12" y="9" width="6" height="9" rx="2" fill="${c}" opacity=".2"/><rect x="12" y="9" width="6" height="9" rx="2" fill="none" stroke="${c}" stroke-width="1"/><rect x="22" y="2" width="4" height="16" rx="2" fill="${c}" opacity=".2"/><rect x="22" y="2" width="4" height="16" rx="2" fill="none" stroke="${c}" stroke-width="1"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      for (let g = 3; g >= 0; g--) {
        const spread = g * 4;
        ctx.fillStyle = hexToRgba(color, 0.06 + g * 0.02);
        roundRect(ctx, x-spread, y-spread, w+spread*2, h+spread*2, 4+spread); ctx.fill();
      }
      ctx.fillStyle = hexToRgba(color, 0.85);
      roundRect(ctx, x, y, w, h, 4); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      roundRect(ctx, x, y, w, h, 4); ctx.stroke();
    }
  },
  {
    name: '圆点图案',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="1" y="4" width="8" height="15" rx="2" fill="${c}" opacity=".2"/><circle cx="3" cy="7" r="1" fill="${c}"/><circle cx="7" cy="7" r="1" fill="${c}"/><circle cx="5" cy="10" r="1" fill="${c}"/><circle cx="3" cy="13" r="1" fill="${c}"/><circle cx="7" cy="13" r="1" fill="${c}"/><circle cx="5" cy="16" r="1" fill="${c}"/><rect x="11" y="8" width="8" height="11" rx="2" fill="${c}" opacity=".2"/><circle cx="13" cy="10" r="1" fill="${c}"/><circle cx="17" cy="10" r="1" fill="${c}"/><circle cx="15" cy="13" r="1" fill="${c}"/><circle cx="13" cy="16" r="1" fill="${c}"/><circle cx="17" cy="16" r="1" fill="${c}"/><rect x="21" y="1" width="6" height="18" rx="2" fill="${c}" opacity=".2"/><circle cx="23" cy="4" r="1" fill="${c}"/><circle cx="25" cy="7" r="1" fill="${c}"/><circle cx="23" cy="10" r="1" fill="${c}"/><circle cx="25" cy="13" r="1" fill="${c}"/><circle cx="23" cy="16" r="1" fill="${c}"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      ctx.fillStyle = hexToRgba(color, 0.18);
      roundRect(ctx, x, y, w, h, 3); ctx.fill();
      ctx.fillStyle = color;
      const r = Math.max(2, Math.min(w, h) * 0.06);
      const gapX = r * 3.5, gapY = r * 3.5;
      ctx.save();
      roundRect(ctx, x, y, w, h, 3); ctx.clip();
      for (let dy = gapY/2; dy < h; dy += gapY) {
        for (let dx = gapX/2; dx < w; dx += gapX) {
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  },
  {
    name: '浮雕阴影',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="2" y="5" width="8" height="15" rx="2" fill="rgba(0,0,0,.15)"/><rect x="1" y="4" width="8" height="15" rx="2" fill="${c}"/><rect x="1" y="4" width="8" height="3" rx="2" fill="rgba(255,255,255,.2)"/><rect x="12" y="9" width="8" height="11" rx="2" fill="rgba(0,0,0,.15)"/><rect x="11" y="8" width="8" height="11" rx="2" fill="${c}"/><rect x="11" y="8" width="8" height="3" rx="2" fill="rgba(255,255,255,.2)"/><rect x="22" y="2" width="6" height="18" rx="2" fill="rgba(0,0,0,.15)"/><rect x="21" y="1" width="6" height="18" rx="2" fill="${c}"/><rect x="21" y="1" width="6" height="3" rx="2" fill="rgba(255,255,255,.2)"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      roundRect(ctx, x+3, y+3, w, h, 5); ctx.fill();
      ctx.fillStyle = color;
      roundRect(ctx, x, y, w, h, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      if (isV) roundRect(ctx, x+2, y+2, w-4, h*0.35, 4);
      else roundRect(ctx, x+2, y+2, w*0.35, h-4, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.1)';
      if (isV) roundRect(ctx, x+2, y+h-h*0.25, w-4, h*0.22, 4);
      else roundRect(ctx, x+w-w*0.25, y+2, w*0.22, h-4, 4);
      ctx.fill();
    }
  },
  {
    name: '双色分割',
    icon: (c) => {
      const c2 = adjustColor(c, 40);
      return `<svg viewBox="0 0 28 20"><rect x="1" y="4" width="8" height="7" rx="0" fill="${c}"/><rect x="1" y="11" width="8" height="8" rx="0" fill="${c2}"/><rect x="1" y="4" width="8" height="15" rx="2" fill="none" stroke="rgba(255,255,255,.15)" stroke-width=".5"/><rect x="11" y="8" width="8" height="5" rx="0" fill="${c}"/><rect x="11" y="13" width="8" height="6" rx="0" fill="${c2}"/><rect x="11" y="8" width="8" height="11" rx="2" fill="none" stroke="rgba(255,255,255,.15)" stroke-width=".5"/><rect x="21" y="1" width="6" height="9" rx="0" fill="${c}"/><rect x="21" y="10" width="6" height="9" rx="0" fill="${c2}"/><rect x="21" y="1" width="6" height="18" rx="2" fill="none" stroke="rgba(255,255,255,.15)" stroke-width=".5"/></svg>`;
    },
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      const c2 = adjustColor(color, 40);
      ctx.save();
      roundRect(ctx, x, y, w, h, 4); ctx.clip();
      if (isV) {
        const mid = y + h * 0.45;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, mid - y);
        ctx.fillStyle = c2;
        ctx.fillRect(x, mid, w, y + h - mid);
      } else {
        const mid = x + w * 0.45;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, mid - x, h);
        ctx.fillStyle = c2;
        ctx.fillRect(mid, y, x + w - mid, h);
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.2)';
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, w, h, 4); ctx.stroke();
    }
  },
  {
    name: '内发光',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="1" y="4" width="8" height="15" rx="2" fill="${c}"/><rect x="3" y="6" width="4" height="11" rx="1" fill="white" opacity=".2"/><rect x="11" y="8" width="8" height="11" rx="2" fill="${c}"/><rect x="13" y="10" width="4" height="7" rx="1" fill="white" opacity=".2"/><rect x="21" y="1" width="6" height="18" rx="2" fill="${c}"/><rect x="22.5" y="3" width="3" height="14" rx="1" fill="white" opacity=".2"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      ctx.fillStyle = color;
      roundRect(ctx, x, y, w, h, 4); ctx.fill();
      const glow = isV
        ? ctx.createRadialGradient(x+w/2, y+h*0.35, 0, x+w/2, y+h*0.35, Math.max(w,h)*0.5)
        : ctx.createRadialGradient(x+w*0.35, y+h/2, 0, x+w*0.35, y+h/2, Math.max(w,h)*0.5);
      glow.addColorStop(0, 'rgba(255,255,255,.3)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      roundRect(ctx, x, y, w, h, 4); ctx.fill();
    }
  },
  {
    name: '渐变边框',
    icon: (c) => `<svg viewBox="0 0 28 20"><rect x="1" y="4" width="8" height="15" rx="2" fill="none" stroke="${c}" stroke-width="2"/><rect x="1" y="4" width="8" height="15" rx="2" fill="${c}" opacity=".12"/><rect x="11" y="8" width="8" height="11" rx="2" fill="none" stroke="${c}" stroke-width="2"/><rect x="11" y="8" width="8" height="11" rx="2" fill="${c}" opacity=".12"/><rect x="21" y="1" width="6" height="18" rx="2" fill="none" stroke="${c}" stroke-width="2"/><rect x="21" y="1" width="6" height="18" rx="2" fill="${c}" opacity=".12"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      const grad = isV
        ? ctx.createLinearGradient(x, y, x, y+h)
        : ctx.createLinearGradient(x, y, x+w, y);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, adjustColor(color, 30));
      grad.addColorStop(1, color);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      roundRect(ctx, x, y, w, h, 4); ctx.stroke();
      ctx.fillStyle = hexToRgba(color, 0.1);
      roundRect(ctx, x, y, w, h, 4); ctx.fill();
    }
  },
  {
    name: '圆顶尖角',
    icon: (c) => `<svg viewBox="0 0 28 20"><path d="M3,19 L3,6 Q5,4 7,6 L9,19 Z" fill="${c}"/><path d="M13,19 L13,10 Q15,8 17,10 L19,19 Z" fill="${c}"/><path d="M22,19 L22,3 Q24,1 26,3 L27,19 Z" fill="${c}"/></svg>`,
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      const r = Math.min(w * 0.5, 8);
      ctx.fillStyle = color;
      ctx.beginPath();
      if (isV) {
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x, y + h);
      }
      ctx.closePath();
      ctx.fill();
    }
  },
  {
    name: '阶梯堆叠',
    icon: (c) => {
      const c2 = adjustColor(c, -25);
      return `<svg viewBox="0 0 28 20"><rect x="1" y="12" width="8" height="7" rx="1" fill="${c2}"/><rect x="1" y="4" width="8" height="8" rx="1" fill="${c}"/><rect x="11" y="13" width="8" height="6" rx="1" fill="${c2}"/><rect x="11" y="8" width="8" height="5" rx="1" fill="${c}"/><rect x="21" y="13" width="6" height="6" rx="1" fill="${c2}"/><rect x="21" y="1" width="6" height="12" rx="1" fill="${c}"/></svg>`;
    },
    drawBar: (ctx, x, y, w, h, color, dir) => {
      const isV = dir === 'vertical';
      const c2 = adjustColor(color, -25);
      const seg = isV ? h * 0.4 : w * 0.4;
      ctx.save();
      roundRect(ctx, x, y, w, h, 3); ctx.clip();
      if (isV) {
        ctx.fillStyle = c2;
        ctx.fillRect(x, y + h - seg, w, seg);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h - seg);
      } else {
        ctx.fillStyle = c2;
        ctx.fillRect(x, y, seg, h);
        ctx.fillStyle = color;
        ctx.fillRect(x + seg, y, w - seg, h);
      }
      ctx.restore();
    }
  }
];