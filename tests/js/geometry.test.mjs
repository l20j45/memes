/* Tests del dominio puro web/geometry.js — ejecutables con: node --test tests/js/ */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clamp, normalizeOpacity, normalizeShadowBlur, normalizeAlign, normalizeColor,
  hexToRgb, relativeLuminance,
} from '../../web/geometry.js';

test('clamp acota en ambos extremos', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
});

test('normalizeOpacity acota y respetea defaults', () => {
  assert.equal(normalizeOpacity(.5), .5);
  assert.equal(normalizeOpacity(0), .1);      // bajo el minimo
  assert.equal(normalizeOpacity(2), 1);       // sobre el maximo
  assert.equal(normalizeOpacity(undefined), 1);
  assert.equal(normalizeOpacity('0.2'), .2);  // string numerico ok
});

test('normalizeShadowBlur acota 0..30', () => {
  assert.equal(normalizeShadowBlur(15), 15);
  assert.equal(normalizeShadowBlur(-3), 0);
  assert.equal(normalizeShadowBlur(99), 30);
  assert.equal(normalizeShadowBlur(null), 0);
});

test('normalizeAlign acepta solo left/center/right', () => {
  assert.equal(normalizeAlign('left'), 'left');
  assert.equal(normalizeAlign('right'), 'right');
  assert.equal(normalizeAlign('center'), 'center');
  assert.equal(normalizeAlign('justify'), 'center');
  assert.equal(normalizeAlign(), 'center');
});

test('normalizeColor valida hex y cae al fallback', () => {
  assert.equal(normalizeColor('#ffffff', '#000000'), '#ffffff');
  assert.equal(normalizeColor('#AbCdEf', '#000000'), '#AbCdEf'); // case-insensitive
  assert.equal(normalizeColor('#fff', '#000000'), '#fff');        // 3 digitos
  assert.equal(normalizeColor('#1234567a', '#000000'), '#1234567a'); // 8 con alpha
  assert.equal(normalizeColor('rojo', '#000000'), '#000000');    // no-hex
  assert.equal(normalizeColor('', '#000000'), '#000000');
  assert.equal(normalizeColor(null, '#0b1220'), '#0b1220');
  assert.equal(normalizeColor('#12345', '#000000'), '#000000');  // 5 digitos invalido
});

test('hexToRgb convierte 3 y 6 digitos', () => {
  assert.deepEqual(hexToRgb('#ffffff'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(hexToRgb('#000000'), { r: 0, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('#abc'), { r: 170, g: 187, b: 204 });
  assert.deepEqual(hexToRgb(''), { r: 0, g: 0, b: 0 });          // vacio -> 0
});

test('relativeLuminance orden cualitativo correcto', () => {
  const black = relativeLuminance('#000000');
  const white = relativeLuminance('#ffffff');
  const red = relativeLuminance('#ff0000');
  assert.ok(black < red && red < white);
  assert.ok(Math.abs(white - 1) < 1e-6);
  assert.ok(Math.abs(black) < 1e-6);
  // un color es idempotente
  assert.ok(Math.abs(red - relativeLuminance('#ff0000')) < 1e-12);
});
