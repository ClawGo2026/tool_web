// ── Bubble Chart Layout Algorithms ──

const LAYOUT_ALGORITHMS = [
  { id: 'force', name: '力导向', icon: '🔵' },
  { id: 'grid', name: '网格', icon: '📊' },
  { id: 'circular', name: '圆形', icon: '⭕' },
  { id: 'treemap', name: '树图', icon: '🌳' }
];

// ── Force-Directed Layout ──
function layoutForceDirected(bubbles, canvasW, canvasH) {
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;
  const damping = 0.9;
  const iterations = 100;

  // Initialize positions randomly in center area
  const positions = bubbles.map((b, i) => ({
    x: centerX + (Math.random() - 0.5) * canvasW * 0.5,
    y: centerY + (Math.random() - 0.5) * canvasH * 0.5,
    vx: 0,
    vy: 0,
    radius: b.radius
  }));

  // Physics simulation
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < positions.length; i++) {
      const p1 = positions[i];
      let fx = 0, fy = 0;

      // Repulsion from all other bubbles
      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;
        const p2 = positions[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = p1.radius + p2.radius;

        if (dist < minDist * 2) {
          const force = (minDist * 2 - dist) / dist * 0.5;
          fx += dx * force;
          fy += dy * force;
        }
      }

      // Attraction to center
      fx += (centerX - p1.x) * 0.001;
      fy += (centerY - p1.y) * 0.001;

      // Update velocity
      p1.vx = (p1.vx + fx) * damping;
      p1.vy = (p1.vy + fy) * damping;

      // Update position
      p1.x += p1.vx;
      p1.y += p1.vy;

      // Constrain to canvas bounds
      p1.x = Math.max(p1.radius, Math.min(canvasW - p1.radius, p1.x));
      p1.y = Math.max(p1.radius, Math.min(canvasH - p1.radius, p1.y));
    }
  }

  return positions.map((p, i) => ({
    x: p.x,
    y: p.y,
    radius: bubbles[i].radius,
    label: bubbles[i].label,
    value: bubbles[i].value
  }));
}

// ── Grid/Spiral Layout ──
function layoutGrid(bubbles, canvasW, canvasH) {
  // Sort by size (largest first)
  const sorted = [...bubbles].sort((a, b) => b.radius - a.radius);
  const count = sorted.length;

  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(count * (canvasW / canvasH)));
  const rows = Math.ceil(count / cols);
  const cellW = canvasW / cols;
  const cellH = canvasH / rows;

  return sorted.map((b, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: cellW * (col + 0.5),
      y: cellH * (row + 0.5),
      radius: b.radius,
      label: b.label,
      value: b.value
    };
  });
}

// ── Circular Packing Layout ──
function layoutCircular(bubbles, canvasW, canvasH) {
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;
  const maxRadius = Math.min(canvasW, canvasH) * 0.45;

  // Sort by size (largest first)
  const sorted = [...bubbles].sort((a, b) => b.radius - a.radius);
  const positions = [];

  // Place largest in center
  positions.push({
    x: centerX,
    y: centerY,
    radius: sorted[0].radius,
    label: sorted[0].label,
    value: sorted[0].value
  });

  // Place remaining in spiral
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
  for (let i = 1; i < sorted.length; i++) {
    const b = sorted[i];
    const angle = i * goldenAngle;
    const r = Math.sqrt(i / sorted.length) * maxRadius;

    let x = centerX + r * Math.cos(angle);
    let y = centerY + r * Math.sin(angle);

    // Ensure no overlap with existing bubbles
    let attempts = 0;
    while (attempts < 50) {
      let overlap = false;
      for (const p of positions) {
        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.radius + p.radius + 5) {
          overlap = true;
          break;
        }
      }
      if (!overlap) break;

      // Adjust position
      r *= 1.05;
      x = centerX + r * Math.cos(angle + attempts * 0.1);
      y = centerY + r * Math.sin(angle + attempts * 0.1);
      attempts++;
    }

    // Constrain to canvas
    x = Math.max(b.radius, Math.min(canvasW - b.radius, x));
    y = Math.max(b.radius, Math.min(canvasH - b.radius, y));

    positions.push({ x, y, radius: b.radius, label: b.label, value: b.value });
  }

  return positions;
}

// ── Treemap Packing Layout ──
function layoutTreemap(bubbles, canvasW, canvasH) {
  // Sort by size (largest first)
  const sorted = [...bubbles].sort((a, b) => b.radius - a.radius);
  const positions = [];

  // Simple row-based packing
  let x = 0, y = 0, rowHeight = 0;

  for (const b of sorted) {
    const diameter = b.radius * 2;

    // Check if we need a new row
    if (x + diameter > canvasW && x > 0) {
      x = 0;
      y += rowHeight + 5;
      rowHeight = 0;
    }

    positions.push({
      x: x + b.radius,
      y: y + b.radius,
      radius: b.radius,
      label: b.label,
      value: b.value
    });

    x += diameter + 5;
    rowHeight = Math.max(rowHeight, diameter);
  }

  // Center the entire layout
  const totalHeight = y + rowHeight;
  const offsetY = (canvasH - totalHeight) / 2;
  for (const p of positions) {
    p.y += offsetY;
  }

  return positions;
}

// ── Main Layout Function ──
function calculateLayout(bubbles, canvasW, canvasH, algorithm) {
  switch (algorithm) {
    case 'force': return layoutForceDirected(bubbles, canvasW, canvasH);
    case 'grid': return layoutGrid(bubbles, canvasW, canvasH);
    case 'circular': return layoutCircular(bubbles, canvasW, canvasH);
    case 'treemap': return layoutTreemap(bubbles, canvasW, canvasH);
    default: return layoutGrid(bubbles, canvasW, canvasH);
  }
}