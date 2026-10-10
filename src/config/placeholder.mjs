export function buildPlaceholderFrames({ frameWidth: w, frameHeight: h, columns, rows }) {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
  const frames = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const bob = col % 2;
      const stride = Math.max(1, Math.floor(h * 0.06));
      const rects = [
        { x: Math.floor(w * 0.2), y: Math.floor(h * 0.32) + bob, width: Math.floor(w * 0.6), height: Math.floor(h * 0.46), color: colors[row % colors.length] },
        { x: Math.floor(w * 0.25), y: Math.floor(h * 0.1) + bob, width: Math.floor(w * 0.5), height: Math.floor(h * 0.25), color: '#fff2d5' },
        { x: Math.floor(w * 0.25), y: Math.floor(h * 0.8) - (col % 4 === 1 ? stride : 0), width: Math.max(1, Math.floor(w * 0.2)), height: Math.max(1, Math.floor(h * 0.12)), color: '#20243c' },
        { x: Math.floor(w * 0.55), y: Math.floor(h * 0.8) - (col % 4 === 3 ? stride : 0), width: Math.max(1, Math.floor(w * 0.2)), height: Math.max(1, Math.floor(h * 0.12)), color: '#20243c' },
      ];
      frames.push({ index: row * columns + col, x: col * w, y: row * h, rects });
    }
  }
  return frames;
}
