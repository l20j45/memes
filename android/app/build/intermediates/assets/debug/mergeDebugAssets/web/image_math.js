/* Algoritmos de imagen por píxel del "modo borrador" (dominio puro):
   dilatación de máscara con distancia de chebyshev en dos barridos (X/Y) e
   inpainting por pirámide ponderada (bajar la resolución y rellenar los
   huecos con colores válidos de niveles superiores). Sin DOM ni Canvas:
   operan sobre Uint8ClampedArray/Float32Array, testables en Node. */

export function dilateMask(mask, w, h, radius) {
  const temp = new Uint8Array(w * h);
  const result = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let found = 0;
      for (let k = -radius; k <= radius; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w && mask[y * w + xx]) {
          found = 1;
          break;
        }
      }
      temp[y * w + x] = found;
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let found = 0;
      for (let k = -radius; k <= radius; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h && temp[yy * w + x]) {
          found = 1;
          break;
        }
      }
      result[y * w + x] = found;
    }
  }

  return result;
}

export function inpaint(d, hole, w, h) {
  const col = new Float32Array(w * h * 3);
  const wt = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!hole[i]) {
      wt[i] = 1;
      col[i * 3] = d[i * 4];
      col[i * 3 + 1] = d[i * 4 + 1];
      col[i * 3 + 2] = d[i * 4 + 2];
    }
  }

  const levels = [{ w, h, col, wt }];
  while (levels[levels.length - 1].w > 1 || levels[levels.length - 1].h > 1) {
    const last = levels[levels.length - 1];
    const nw = Math.ceil(last.w / 2);
    const nh = Math.ceil(last.h / 2);
    const nc = new Float32Array(nw * nh * 3);
    const nt = new Float32Array(nw * nh);
    for (let y = 0; y < nh; y++) {
      for (let x = 0; x < nw; x++) {
        const index = y * nw + x;
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const j = Math.min(last.h - 1, y * 2 + dy) * last.w + Math.min(last.w - 1, x * 2 + dx);
            nt[index] += last.wt[j] / 4;
            nc[index * 3] += last.col[j * 3] / 4;
            nc[index * 3 + 1] += last.col[j * 3 + 1] / 4;
            nc[index * 3 + 2] += last.col[j * 3 + 2] / 4;
          }
        }
      }
    }
    levels.push({ w: nw, h: nh, col: nc, wt: nt });
  }

  let output = null;
  for (let levelIndex = levels.length - 1; levelIndex >= 0; levelIndex--) {
    const level = levels[levelIndex];
    const next = levelIndex < levels.length - 1 ? levels[levelIndex + 1] : null;
    const result = new Float32Array(level.w * level.h * 3);

    for (let y = 0; y < level.h; y++) {
      for (let x = 0; x < level.w; x++) {
        const index = y * level.w + x;
        const alpha = Math.min(1, level.wt[index]);
        if (!next) {
          result[index * 3] = level.col[index * 3] / Math.max(alpha, 1e-6);
          result[index * 3 + 1] = level.col[index * 3 + 1] / Math.max(alpha, 1e-6);
          result[index * 3 + 2] = level.col[index * 3 + 2] / Math.max(alpha, 1e-6);
          continue;
        }

        const fx = Math.max(0, Math.min(next.w - 1, (x + .5) / 2 - .5));
        const fy = Math.max(0, Math.min(next.h - 1, (y + .5) / 2 - .5));
        const x0 = fx | 0;
        const y0 = fy | 0;
        const x1 = Math.min(next.w - 1, x0 + 1);
        const y1 = Math.min(next.h - 1, y0 + 1);
        const tx = fx - x0;
        const ty = fy - y0;

        for (let channel = 0; channel < 3; channel++) {
          const up = (
            (output[(y0 * next.w + x0) * 3 + channel] * (1 - tx) + output[(y0 * next.w + x1) * 3 + channel] * tx) * (1 - ty) +
            (output[(y1 * next.w + x0) * 3 + channel] * (1 - tx) + output[(y1 * next.w + x1) * 3 + channel] * tx) * ty
          );
          result[index * 3 + channel] = level.col[index * 3 + channel] + (1 - alpha) * up;
        }
      }
    }

    output = result;
  }

  for (let i = 0; i < w * h; i++) {
    if (hole[i]) {
      d[i * 4] = output[i * 3];
      d[i * 4 + 1] = output[i * 3 + 1];
      d[i * 4 + 2] = output[i * 3 + 2];
      d[i * 4 + 3] = 255;
    }
  }
}
