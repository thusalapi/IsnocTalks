import type { Shape } from './types';

/** Draws one normalised shape onto a canvas of width w and height h (CSS pixels). */
export function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, w: number, h: number) {
  const lw = Math.max(1.5, shape.size * w);
  ctx.save();
  ctx.strokeStyle = shape.color;
  ctx.fillStyle = shape.color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 3;

  const P = (p: { x: number; y: number }) => [p.x * w, p.y * h] as const;

  switch (shape.type) {
    case 'pen': {
      if (shape.points.length === 0) break;
      ctx.beginPath();
      const [x0, y0] = P(shape.points[0]);
      ctx.moveTo(x0, y0);
      if (shape.points.length === 1) ctx.lineTo(x0 + 0.1, y0 + 0.1);
      for (let i = 1; i < shape.points.length - 1; i++) {
        const [x1, y1] = P(shape.points[i]);
        const [x2, y2] = P(shape.points[i + 1]);
        ctx.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2);
      }
      if (shape.points.length > 1) {
        const [xl, yl] = P(shape.points[shape.points.length - 1]);
        ctx.lineTo(xl, yl);
      }
      ctx.stroke();
      break;
    }
    case 'line':
    case 'arrow': {
      const [x1, y1] = P(shape.from);
      const [x2, y2] = P(shape.to);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (shape.type === 'arrow') {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const head = Math.max(12, lw * 4);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 7), y2 - head * Math.sin(angle - Math.PI / 7));
        ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 7), y2 - head * Math.sin(angle + Math.PI / 7));
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'rect': {
      const [x1, y1] = P(shape.from);
      const [x2, y2] = P(shape.to);
      ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      break;
    }
    case 'ellipse': {
      const [x1, y1] = P(shape.from);
      const [x2, y2] = P(shape.to);
      ctx.beginPath();
      ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'text': {
      const [x, y] = P(shape.at);
      const fontPx = textFontPx(shape.size, w);
      ctx.font = `700 ${fontPx}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(2, fontPx / 6);
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeText(shape.text, x, y);
      ctx.fillText(shape.text, x, y);
      break;
    }
  }
  ctx.restore();
}

export function textFontPx(size: number, w: number) {
  return Math.max(14, Math.round(size * w * 5));
}
