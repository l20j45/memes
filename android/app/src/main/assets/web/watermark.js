/* Dominio de la marca de agua: geometría del cuadro editable.
   Puro respecto al estado (leé el singleton) y al contexto 2D que se le pasa
   para medir el texto; no dibuja. */
import { state } from './state.js';

export function getWatermarkBox(ctx, W, H) {
  const wm = state.wm || {};
  const txt = (wm.text || '').trim();
  if (!wm.enabled || !txt) return null;

  ctx.save();
  ctx.font = `700 ${Math.round((wm.size || 28))}px sans-serif`;
  ctx.textAlign = wm.align || 'right';
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(txt);
  const px = (wm.x ?? .82) * W;
  const py = (wm.y ?? .92) * H;
  const left = wm.align === 'left' ? px : wm.align === 'center' ? px - metrics.width / 2 : px - metrics.width;
  const top = py - ((wm.size || 28) / 2);
  ctx.restore();
  return { x: left, y: top, w: metrics.width, h: wm.size || 28 };
}
