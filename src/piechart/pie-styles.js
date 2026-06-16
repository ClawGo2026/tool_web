import { adjustColor, hexToRgba } from '../utils.js';

// Pie chart styles — 8 styles
export const PIE_STYLES = [
  {
    name: '经典实心',
    icon: (colors) => {
      const c = colors;
      return `<svg viewBox="0 0 28 20">
        <circle cx="14" cy="10" r="8" fill="${c[0]}" opacity=".3"/>
        <path d="M14,2 A8,8 0 0,1 22,10 L14,10 Z" fill="${c[0]}"/>
        <path d="M22,10 A8,8 0 0,1 6,16 L14,10 Z" fill="${c[1]}"/>
        <path d="M6,16 A8,8 0 0,1 2,10 L14,10 Z" fill="${c[2]}"/>
        <path d="M2,10 A8,8 0 0,1 14,2 L14,10 Z" fill="${c[3]}" opacity=".8"/>
      </svg>`;
    },
    drawPie: (ctx, cx, cy, radius, segments) => {
      let startAngle = -Math.PI / 2;
      segments.forEach(seg => {
        const sliceAngle = seg.ratio * Math.PI * 2;
        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
      });
    }
  },
  {
    name: '圆环图',
    icon: (colors) => {
      const c = colors;
      return `<svg viewBox="0 0 28 20">
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[0]}" stroke-width="3" stroke-dasharray="16 34" stroke-dashoffset="0"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[1]}" stroke-width="3" stroke-dasharray="12 38" stroke-dashoffset="-16"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[2]}" stroke-width="3" stroke-dasharray="8 42" stroke-dashoffset="-28"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[3]}" stroke-width="3" stroke-dasharray="4 46" stroke-dashoffset="-36"/>
      </svg>`;
    },
    drawPie: (ctx, cx, cy, radius, segments) => {
      const innerRadius = radius * 0.55;
      let startAngle = -Math.PI / 2;
      segments.forEach(seg => {
        const sliceAngle = seg.ratio * Math.PI * 2;
        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
      });
    }
  },
  {
    name: '描边分离',
    icon: (colors) => {
      const c = colors;
      return `<svg viewBox="0 0 28 20">
        <path d="M14,2 A8,8 0 0,1 22,10 L14,10 Z" fill="${c[0]}" stroke="#fff" stroke-width=".5"/>
        <path d="M22,10 A8,8 0 0,1 6,16 L14,10 Z" fill="${c[1]}" stroke="#fff" stroke-width=".5"/>
        <path d="M6,16 A8,8 0 0,1 2,10 L14,10 Z" fill="${c[2]}" stroke="#fff" stroke-width=".5"/>
        <path d="M2,10 A8,8 0 0,1 14,2 L14,10 Z" fill="${c[3]}" stroke="#fff" stroke-width=".5"/>
      </svg>`;
    },
    drawPie: (ctx, cx, cy, radius, segments) => {
      let startAngle = -Math.PI / 2;
      segments.forEach(seg => {
        const sliceAngle = seg.ratio * Math.PI * 2;
        const midAngle = startAngle + sliceAngle / 2;
        const offset = 4;
        const ox = Math.cos(midAngle) * offset;
        const oy = Math.sin(midAngle) * offset;
        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.moveTo(cx + ox, cy + oy);
        ctx.arc(cx + ox, cy + oy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        startAngle += sliceAngle;
      });
    }
  },
  {
    name: '半圆图',
    icon: (colors) => {
      const c = colors;
      return `<svg viewBox="0 0 28 20">
        <path d="M6,18 A8,8 0 0,1 22,18 L22,10 L6,10 Z" fill="${c[0]}" opacity=".3"/>
        <path d="M6,18 A8,8 0 0,1 22,18 L14,10 Z" fill="${c[0]}"/>
        <path d="M6,18 A8,8 0 0,1 6,10 L14,10 Z" fill="${c[1]}"/>
        <path d="M22,18 A8,8 0 0,1 22,10 L14,10 Z" fill="${c[2]}"/>
      </svg>`;
    },
    drawPie: (ctx, cx, cy, radius, segments) => {
      let startAngle = Math.PI;
      segments.forEach(seg => {
        const sliceAngle = seg.ratio * Math.PI;
        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
      });
    }
  },
  {
    name: '渐变立体',
    icon: (colors) => {
      const c = colors;
      return `<svg viewBox="0 0 28 20">
        <defs><radialGradient id="pg" cx="40%" cy="35%"><stop offset="0%" stop-color="${c[0]}"/><stop offset="100%" stop-color="${adjustColor(c[0],-40)}"/></radialGradient></defs>
        <circle cx="14" cy="10" r="8" fill="${c[0]}" opacity=".15"/>
        <path d="M14,2 A8,8 0 0,1 22,10 L14,10 Z" fill="url(#pg)"/>
        <path d="M22,10 A8,8 0 0,1 6,16 L14,10 Z" fill="${c[1]}"/>
        <path d="M6,16 A8,8 0 0,1 2,10 L14,10 Z" fill="${c[2]}"/>
        <path d="M2,10 A8,8 0 0,1 14,2 L14,10 Z" fill="${c[3]}" opacity=".8"/>
      </svg>`;
    },
    drawPie: (ctx, cx, cy, radius, segments) => {
      let startAngle = -Math.PI / 2;
      segments.forEach(seg => {
        const sliceAngle = seg.ratio * Math.PI * 2;
        const midAngle = startAngle + sliceAngle / 2;
        const grad = ctx.createRadialGradient(
          cx + Math.cos(midAngle) * radius * 0.3,
          cy + Math.sin(midAngle) * radius * 0.3,
          0,
          cx, cy, radius
        );
        grad.addColorStop(0, adjustColor(seg.color, 30));
        grad.addColorStop(1, adjustColor(seg.color, -20));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
      });
    }
  },
  {
    name: '圆角饼图',
    icon: (colors) => {
      const c = colors;
      return `<svg viewBox="0 0 28 20">
        <path d="M14,2 A8,8 0 0,1 21.5,7.5 L14,10 Z" fill="${c[0]}" rx="1"/>
        <path d="M21.5,7.5 A8,8 0 0,1 21.5,12.5 L14,10 Z" fill="${c[1]}"/>
        <path d="M21.5,12.5 A8,8 0 0,1 6.5,16 L14,10 Z" fill="${c[2]}"/>
        <path d="M6.5,16 A8,8 0 0,1 14,2 L14,10 Z" fill="${c[3]}" opacity=".8"/>
        <circle cx="14" cy="10" r="2" fill="#fff" opacity=".3"/>
      </svg>`;
    },
    drawPie: (ctx, cx, cy, radius, segments) => {
      const r = radius * 0.35;
      let startAngle = -Math.PI / 2;
      segments.forEach(seg => {
        const sliceAngle = seg.ratio * Math.PI * 2;
        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.moveTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(cx + r * Math.cos(startAngle + sliceAngle), cy + r * Math.sin(startAngle + sliceAngle), r, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
      });
    }
  },
  {
    name: '嵌套圆环',
    icon: (colors) => {
      const c = colors;
      return `<svg viewBox="0 0 28 20">
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[0]}" stroke-width="2" stroke-dasharray="12 38" stroke-dashoffset="0"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[1]}" stroke-width="2" stroke-dasharray="10 40" stroke-dashoffset="-12"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[2]}" stroke-width="2" stroke-dasharray="8 42" stroke-dashoffset="-22"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[3]}" stroke-width="2" stroke-dasharray="10 40" stroke-dashoffset="-30"/>
        <circle cx="14" cy="10" r="4" fill="${c[0]}" opacity=".3"/>
      </svg>`;
    },
    drawPie: (ctx, cx, cy, radius, segments) => {
      const outerR = radius;
      const innerR1 = radius * 0.65;
      const innerR2 = radius * 0.35;
      let startAngle = -Math.PI / 2;
      segments.forEach((seg, i) => {
        const sliceAngle = seg.ratio * Math.PI * 2;
        const r = i % 2 === 0 ? outerR : innerR1;
        const ir = i % 2 === 0 ? innerR1 : innerR2;
        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, ir, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
      });
    }
  },
  {
    name: '简约线条',
    icon: (colors) => {
      const c = colors;
      return `<svg viewBox="0 0 28 20">
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[0]}" stroke-width="1.5" stroke-dasharray="16 34" stroke-dashoffset="0"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[1]}" stroke-width="1.5" stroke-dasharray="12 38" stroke-dashoffset="-16"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[2]}" stroke-width="1.5" stroke-dasharray="8 42" stroke-dashoffset="-28"/>
        <circle cx="14" cy="10" r="8" fill="none" stroke="${c[3]}" stroke-width="1.5" stroke-dasharray="4 46" stroke-dashoffset="-36"/>
        <circle cx="14" cy="10" r="3" fill="none" stroke="${c[0]}" stroke-width="1"/>
      </svg>`;
    },
    drawPie: (ctx, cx, cy, radius, segments) => {
      const innerRadius = radius * 0.55;
      let startAngle = -Math.PI / 2;
      segments.forEach(seg => {
        const sliceAngle = seg.ratio * Math.PI * 2;
        ctx.strokeStyle = seg.color;
        ctx.fillStyle = hexToRgba(seg.color, 0.15);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        startAngle += sliceAngle;
      });
    }
  }
];
