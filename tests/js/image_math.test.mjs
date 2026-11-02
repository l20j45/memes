/* Tests del dominio puro web/image_math.js (dilatacion + inpainting) */
import test from 'node:test';
import assert from 'node:assert/strict';

import { dilateMask, inpaint } from '../../public/web/image_math.js';

function grid(w, h, set) {
  const m = new Uint8Array(w * h);
  for (const [x, y] of set) m[y * w + x] = 1;
  return m;
}

test('dilateMask expande por radio en cruz/chebyshev', () => {
  const w = 9, h = 9;
  const hole = grid(w, h, [[4, 4]]);
  const r1 = dilateMask(hole, w, h, 1);
  // radio 1 en chebyshev: cuadrado 3x3
  assert.equal(r1[4 * w + 4], 1);
  assert.equal(r1[3 * w + 3], 1);
  assert.equal(r1[5 * w + 5], 1);
  assert.equal(r1[2 * w + 2], 0);  // fuera del radio
  // sin tocar el original (pura)
  assert.equal(hole[3 * w + 3], 0);

  const r2 = dilateMask(hole, w, h, 2);
  assert.equal(r2[2 * w + 2], 1);
  assert.equal(r2[1 * w + 1], 0);
});

test('dilateMask respeta bordes (no sale del lienzo)', () => {
  const w = 3, h = 3;
  const hole = grid(w, h, [[0, 0]]);
  // r=1: solo cubo chebyshev 2x2 desde la esquina
  const d1 = dilateMask(hole, w, h, 1);
  assert.equal(d1[0], 1);
  assert.equal(d1[1], 1);
  assert.equal(d1[4], 1);
  assert.equal(d1[8], 0);  // esquina opuesta fuera del radio
  // r grande: cubre todo el lienzo sin salirse
  const d5 = dilateMask(hole, w, h, 5);
  assert.equal(d5[8], 1);
  assert.ok(d1.every((v) => v === 0 || v === 1) && d5.every((v) => v === 0 || v === 1));
});

test('dilateMask con radio 0 no cambia nada', () => {
  const w = 2, h = 2;
  const hole = grid(w, h, [[0, 1]]);
  const d = dilateMask(hole, w, h, 0);
  assert.deepEqual([...d], [...hole]);
});

test('inpaint rellena huecos con datos cercanos y conserva lo valido', () => {
  // Imagen 4x1: p0 rojo, p1 hueco, p2 azul, p3 azul.
  const w = 4, h = 1;
  const data = new Uint8ClampedArray(w * h * 4);
  const put = (i, r, g, b) => { data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b; data[i * 4 + 3] = 255; };
  put(0, 255, 0, 0);
  put(1, 0, 0, 0);       // sera hueco
  put(2, 0, 0, 255);
  put(3, 0, 0, 255);

  const hole = new Uint8Array([0, 1, 0, 0]);
  const before = Uint8ClampedArray.from(data);
  inpaint(data, hole, w, h);

  // los pixeles validos NO cambian
  assert.deepEqual([data[0], data[1], data[2]], [before[0], before[1], before[2]]);
  // el hueco queda opaco
  assert.equal(data[4 + 3], 255);
  // el relleno cae entre rojo y azul (canal R sube, canal B sube)
  const r = data[4], b = data[6];
  assert.ok(r > 0 && r < 255, `R del hueco intermedio, recibio ${r}`);
  assert.ok(b > 0 && b < 255, `B del hueco intermedio, recibio ${b}`);
});

test('inpaint con hueco completo llena con promedio de la piramide (no NaN)', () => {
  const w = 2, h = 2;
  const data = new Uint8ClampedArray(w * h * 4);
  // todo hueco: da igual, no hay nada valido, no debe explotar ni dejar NaN
  const hole = new Uint8Array(w * h).fill(1);
  inpaint(data, hole, w, h);
  for (let i = 0; i < w * h; i++) {
    assert.ok(Number.isFinite(data[i * 4]), `canal R finito en pixel ${i}`);
    assert.equal(data[i * 4 + 3], 255);
  }
});

test('inpaint no toca imagen sin huecos', () => {
  const w = 2, h = 2;
  const data = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255, 70, 80, 90, 255, 100, 110, 120, 255]);
  const hole = new Uint8Array(w * h); // nada borrado
  const before = Uint8ClampedArray.from(data);
  inpaint(data, hole, w, h);
  assert.deepEqual([...data], [...before]);
});
