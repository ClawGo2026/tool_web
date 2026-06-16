import { hexToRgba } from '../utils.js';

// Line styles — 10 styles for line chart
export const LINE_STYLES = [
  {
    name: '经典实线',
    icon: (c) => `<svg viewBox="0 0 28 20"><polyline points="1,15 7,8 14,11 20,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="1" cy="15" r="2" fill="${c}"/><circle cx="7" cy="8" r="2" fill="${c}"/><circle cx="14" cy="11" r="2" fill="${c}"/><circle cx="20" cy="4" r="2" fill="${c}"/><circle cx="27" cy="9" r="2" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '平滑曲线',
    icon: (c) => `<svg viewBox="0 0 28 20"><path d="M1,15 C7,8 7,8 14,11 C20,4 20,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/><circle cx="1" cy="15" r="2" fill="${c}"/><circle cx="14" cy="11" r="2" fill="${c}"/><circle cx="27" cy="9" r="2" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg) => {
      if (points.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Catmull-Rom to Cubic Bezier conversion.
      // The curve passes through every data point.
      const tension = 0.5;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        // Cubic bezier control points from Catmull-Rom
        const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
        const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
        const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
        const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      ctx.stroke();
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '阶梯折线',
    icon: (c) => `<svg viewBox="0 0 28 20"><polyline points="1,15 7,15 7,8 14,8 14,11 20,11 20,4 27,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="1" cy="15" r="2" fill="${c}"/><circle cx="7" cy="8" r="2" fill="${c}"/><circle cx="14" cy="11" r="2" fill="${c}"/><circle cx="20" cy="4" r="2" fill="${c}"/><circle cx="27" cy="9" r="2" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i - 1].y);
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '面积填充',
    icon: (c) => `<svg viewBox="0 0 28 20"><polygon points="1,15 7,8 14,11 20,4 27,9 27,19 1,19" fill="${c}" opacity=".25"/><polyline points="1,15 7,8 14,11 20,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="1" cy="15" r="2" fill="${c}"/><circle cx="27" cy="9" r="2" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg, chartH, padTop) => {
      // Fill area
      ctx.fillStyle = hexToRgba(color, 0.2);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length - 1].x, padTop + chartH);
      ctx.lineTo(points[0].x, padTop + chartH);
      ctx.closePath();
      ctx.fill();
      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '平滑面积',
    icon: (c) => `<svg viewBox="0 0 28 20"><path d="M1,15 C7,8 7,8 14,11 C20,4 20,4 27,9 L27,19 L1,19 Z" fill="${c}" opacity=".25"/><path d="M1,15 C7,8 7,8 14,11 C20,4 20,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/><circle cx="1" cy="15" r="2" fill="${c}"/><circle cx="27" cy="9" r="2" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg, chartH, padTop) => {
      if (points.length < 2) return;
      const tension = 0.5;
      // Build the smooth curve path (Catmull-Rom to Cubic Bezier)
      const buildSmoothPath = () => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[Math.max(0, i - 1)];
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[Math.min(points.length - 1, i + 2)];
          const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
          const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
          const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
          const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
      };
      // Fill area: smooth curve + bottom edges
      buildSmoothPath();
      const last = points[points.length - 1];
      ctx.lineTo(last.x, padTop + chartH);
      ctx.lineTo(points[0].x, padTop + chartH);
      ctx.closePath();
      ctx.fillStyle = hexToRgba(color, 0.2);
      ctx.fill();
      // Stroke line
      buildSmoothPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      // Points
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '虚线',
    icon: (c) => `<svg viewBox="0 0 28 20"><polyline points="1,15 7,8 14,11 20,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="4,3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="1" cy="15" r="2" fill="${c}"/><circle cx="7" cy="8" r="2" fill="${c}"/><circle cx="14" cy="11" r="2" fill="${c}"/><circle cx="20" cy="4" r="2" fill="${c}"/><circle cx="27" cy="9" r="2" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '加粗线条',
    icon: (c) => `<svg viewBox="0 0 28 20"><polyline points="1,15 7,8 14,11 20,4 27,9" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="1" cy="15" r="2.5" fill="${c}"/><circle cx="7" cy="8" r="2.5" fill="${c}"/><circle cx="14" cy="11" r="2.5" fill="${c}"/><circle cx="20" cy="4" r="2.5" fill="${c}"/><circle cx="27" cy="9" r="2.5" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '点线相间',
    icon: (c) => `<svg viewBox="0 0 28 20"><polyline points="1,15 7,8 14,11 20,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="1,4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="1" cy="15" r="2" fill="${c}"/><circle cx="7" cy="8" r="2" fill="${c}"/><circle cx="14" cy="11" r="2" fill="${c}"/><circle cx="20" cy="4" r="2" fill="${c}"/><circle cx="27" cy="9" r="2" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '发光线条',
    icon: (c) => `<svg viewBox="0 0 28 20"><polyline points="1,15 7,8 14,11 20,4 27,9" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".25"/><polyline points="1,15 7,8 14,11 20,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="1" cy="15" r="2" fill="${c}"/><circle cx="27" cy="9" r="2" fill="${c}"/></svg>`,
    drawLine: (ctx, points, color, bg) => {
      // Glow
      ctx.strokeStyle = hexToRgba(color, 0.3);
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      // Main line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      points.forEach(p => {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  {
    name: '无点纯线',
    icon: (c) => `<svg viewBox="0 0 28 20"><polyline points="1,15 7,8 14,11 20,4 27,9" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    drawLine: (ctx, points, color, bg) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
  }
];
