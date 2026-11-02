const $ = (selector) => document.querySelector(selector);
const MAX = 1600;

// --- Android nativo (proyecto android/: WebView con JS bridge) --------------
// Cuando corre dentro de la app Android hay un inyector de objetos llamado
// AndroidSaver (window.AndroidSaver) que guarda la imagen en la Galeria.
// El backend Python (rembg) no existe dentro del movil: opcionalmente el
// usuario apunta a un servidor en su red local con "apiBase" (localStorage).
const NATIVE_ANDROID = typeof window !== 'undefined' && typeof window.AndroidSaver?.saveImage === 'function';
const API_BASE = ((typeof localStorage !== 'undefined' && localStorage.getItem('apiBase')) || '').replace(/\/+$/, '');
const HAS_BACKEND = !NATIVE_ANDROID || !!API_BASE;
const apiUrl = (path) => API_BASE + path;

const FONTS = {
  Impact: { c: 'Impact, Anton, sans-serif', w: 400 },
  Anton: { c: 'Anton, Impact, sans-serif', w: 400 },
  Oswald: { c: 'Oswald, sans-serif', w: 700 },
  Montserrat: { c: 'Montserrat, sans-serif', w: 800 },
  Comic: { c: "'Comic Neue','Comic Sans MS',cursive", w: 700 },
  Arial: { c: 'Arial, Helvetica, sans-serif', w: 700 }
};

const PRESETS = {
  classic: { f: 'Impact', fill: '#ffffff', stroke: '#000000', s: 54, sw: 16 },
  modern: { f: 'Montserrat', fill: '#ffffff', stroke: '#000000', s: 46, sw: 0 },
  neon: { f: 'Anton', fill: '#00ffff', stroke: '#ff00ff', s: 52, sw: 12 }
};

const EXPORT_PRESETS = {
  original: { label: 'Original', w: 900, h: 900 },
  '1080x1080': { label: '1080 × 1080', w: 1080, h: 1080 },
  '1200x1200': { label: '1200 × 1200', w: 1200, h: 1200 },
  '1080x1920': { label: '1080 × 1920', w: 1080, h: 1920 },
  '1920x1080': { label: '1920 × 1080', w: 1920, h: 1080 }
};

const state = {
  art: { w: 900, h: 900 },
  orig: { w: 900, h: 900 },
  imgs: [],
  isel: 0,
  selK: 'txt',
  layers: [],
  sel: 0,
  bar: 0,
  upper: true,
  hits: [],
  drag: null,
  raf: 0,
  cleanOn: false,
  guides: false,
  history: [],
  hIndex: -1,
  dropDepth: 0,
  wm: {
    enabled: false,
    text: 'miweb.com',
    x: .82,
    y: .92,
    size: 28,
    fill: '#ffffff',
    stroke: '#0b1220',
    opacity: .8,
    align: 'right',
    blur: 0,
    shadow: '#000000',
    shadowBlur: 0,
    locked: false
  }
};

const cv = $('#cv');
const cx = cv.getContext('2d');

const mk = (t = '', o = {}) => ({
  t,
  x: .5,
  y: .5,
  s: 54,
  f: 'Impact',
  fill: '#ffffff',
  stroke: '#000000',
  sw: 14,
  align: 'center',
  opacity: 1,
  shadow: '#000000',
  shadowBlur: 0,
  locked: false,
  ...o
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const normalizeOpacity = (value) => clamp(Number(value ?? 1), .1, 1);
const normalizeShadowBlur = (value) => clamp(Number(value ?? 0), 0, 30);
const normalizeAlign = (value) => ['left', 'center', 'right'].includes(value) ? value : 'center';
const normalizeColor = (value, fallback) => {
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!candidate) return fallback;
  const valid = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(candidate);
  return valid ? candidate : fallback;
};

function toast(msg, err = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('err', !!err);
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2400);
}

function cur() {
  return state.layers[state.sel];
}

function normalizeSelection() {
  if (state.selK === 'img') {
    state.isel = clamp(state.isel, 0, Math.max(0, state.imgs.length - 1));
    return;
  }
  state.sel = clamp(state.sel, 0, Math.max(0, state.layers.length - 1));
}

function buildSnapshot() {
  return JSON.stringify({
    art: state.art,
    orig: state.orig,
    layers: state.layers,
    bar: state.bar,
    upper: state.upper,
    wm: state.wm,
    imgs: state.imgs.map((m) => ({
      x: m.x,
      y: m.y,
      w: m.w,
      sy: m.sy,
      filter: m.filter,
      tpl: m.tpl,
      src: m.c.toDataURL()
    }))
  });
}

function updateUndoBtns() {
  $('#undoBtn').disabled = state.hIndex <= 0;
  $('#redoBtn').disabled = state.hIndex >= state.history.length - 1;
}

function pushHistory() {
  const snapshot = buildSnapshot();
  if (state.history[state.hIndex] === snapshot) return;
  state.history = state.history.slice(0, state.hIndex + 1);
  state.history.push(snapshot);
  if (state.history.length > 25) state.history.shift();
  else state.hIndex += 1;
  updateUndoBtns();
  saveLocal();
}

async function loadState(idx) {
  if (idx < 0 || idx >= state.history.length) return;

  state.hIndex = idx;
  const data = JSON.parse(state.history[state.hIndex]);
  state.art = data.art;
  state.orig = data.orig;
  state.layers = data.layers;
  state.bar = data.bar;
  state.upper = data.upper;
  state.wm = { ...state.wm, ...(data.wm || {}) };

  state.imgs = await Promise.all((data.imgs || []).map(async (m) => {
    const img = new Image();
    img.src = m.src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return {
      c,
      x: m.x,
      y: m.y,
      w: m.w,
      sy: m.sy,
      filter: m.filter || 'none',
      tpl: m.tpl
    };
  }));

  state.isel = clamp(state.isel, 0, Math.max(0, state.imgs.length - 1));
  cv.style.cursor = state.cleanOn ? 'crosshair' : 'default';
  normalizeSelection();
  sync();
  schedule();
  updateUndoBtns();
}

function setSelection(nextK, nextIndex) {
  state.selK = nextK;
  if (nextK === 'txt') state.sel = nextIndex;
  if (nextK === 'img') state.isel = nextIndex;
  sync();
  schedule();
}

function wrap(text, max) {
  const out = [];
  text.split('\n').forEach((paragraph) => {
    let line = '';
    paragraph.split(' ').forEach((word) => {
      const probe = line ? line + ' ' + word : word;
      if (line && cx.measureText(probe).width > max) {
        out.push(line);
        line = word;
      } else {
        line = probe;
      }
    });
    if (line) out.push(line);
  });
  return out;
}

function schedule() {
  cancelAnimationFrame(state.raf);
  state.raf = requestAnimationFrame(() => {
    draw();
    // Autosave agresivo: cualquier cambio visual (arrastrar, pintar, controles,
    // plantilla...) agenda el guardado del borrador poco despues de parar de
    // interactuar; cerrar la pestana sin guardar ya no pierde el trabajo.
    scheduleSave();
  });
}

function geom() {
  const bh = Math.round(state.art.h * state.bar / 100);
  return { W: state.art.w, bh, H: state.art.h + bh };
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((char) => char + char).join('') : value;
  const int = Number.parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex || '#ffffff');
  const channel = (value) => {
    const s = value / 255;
    return s <= .03928 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function getWatermarkColors() {
  const bg = ($('#bg').value || '#ffffff').trim();
  const dark = relativeLuminance(bg) > 0.52;
  return dark
    ? { fill: 'rgba(15,23,42,0.78)', stroke: 'rgba(255,255,255,0.9)' }
    : { fill: 'rgba(255,255,255,0.75)', stroke: 'rgba(15,23,42,0.8)' };
}

function getWatermarkBox(ctx, W, H) {
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

// Patrón de cuadrícula estilo "PNG transparente": cuadros blanco/gris claro
// para que el usuario vea dónde NO hay fondo. Cacheado porque se repinta a
// cada frame del bucle de dibujo.
let checkerCache = null;
function checkerPattern(context) {
  if (!checkerCache) {
    const tile = document.createElement('canvas');
    tile.width = 20;
    tile.height = 20;
    const t = tile.getContext('2d');
    t.fillStyle = '#d6dae2';
    t.fillRect(0, 0, 20, 20);
    t.fillStyle = '#f2f4f8';
    t.fillRect(0, 0, 10, 10);
    t.fillRect(10, 10, 10, 10);
    checkerCache = context.createPattern(tile, 'repeat');
  }
  return checkerCache;
}

function draw(exp = false) {
  const { W, bh, H } = geom();
  if (cv.width !== W || cv.height !== H) {
    cv.width = W;
    cv.height = H;
  }

  cx.clearRect(0, 0, W, H);
  if ($('#bgTransparent').checked) {
    cx.fillStyle = checkerPattern(cx);
    cx.fillRect(0, 0, W, H);
  } else {
    cx.fillStyle = '#fff';
    cx.fillRect(0, 0, W, H);
    cx.fillStyle = $('#bg').value;
    cx.fillRect(0, bh, W, state.art.h);
  }

  cx.save();
  cx.beginPath();
  cx.rect(0, bh, W, state.art.h);
  cx.clip();

  state.imgs.forEach((m, i) => {
    const w = m.w * W;
    const h = w * m.c.height / m.c.width * (m.sy || 1);
    const x = m.x * W - w / 2;
    const y = bh + m.y * state.art.h - h / 2;
    m.box = { x, y, w, h };
    cx.save();

    if (m.filter === 'deepfry') {
      cx.filter = 'contrast(250%) saturate(300%) brightness(110%)';
    } else if (m.filter && m.filter !== 'none') {
      cx.filter = m.filter;
    }

    cx.drawImage(m.c, x, y, w, h);
    if (!exp && state.cleanOn && i === state.isel && m.mask) {
      cx.filter = 'none';
      cx.globalAlpha = .55;
      cx.drawImage(m.mask, x, y, w, h);
    }
    cx.restore();
  });
  cx.restore();

  if (!exp && !state.imgs.length) {
    cx.fillStyle = '#8a90a0';
    cx.font = `700 ${Math.round(W / 22)}px 'Space Grotesk',sans-serif`;
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText('Sube, pega o suelta una imagen', W / 2, bh + state.art.h / 2);
  }

  if (!exp && state.selK === 'img' && state.imgs[state.isel] && !state.cleanOn) {
    const b = state.imgs[state.isel].box;
    const u = Math.max(2, W / 380);
    const hs = u * 6;
    cx.save();
    cx.setLineDash([10, 8]);
    cx.lineWidth = u;
    cx.strokeStyle = '#2b50ff';
    cx.strokeRect(b.x, b.y, b.w, b.h);
    cx.setLineDash([]);
    cx.fillStyle = '#2b50ff';
    [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].forEach(([hx, hy]) => cx.fillRect(hx - hs, hy - hs, hs * 2, hs * 2));
    [[b.x + b.w / 2, b.y], [b.x + b.w / 2, b.y + b.h], [b.x, b.y + b.h / 2], [b.x + b.w, b.y + b.h / 2]].forEach(([hx, hy]) => {
      cx.fillStyle = '#fff';
      cx.fillRect(hx - hs, hy - hs, hs * 2, hs * 2);
      cx.strokeRect(hx - hs, hy - hs, hs * 2, hs * 2);
    });
    cx.restore();
  }

  if (state.guides && !exp) {
    cx.save();
    cx.strokeStyle = 'rgba(137, 92, 246, 0.42)';
    cx.setLineDash([8, 8]);
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(W / 3, 0);
    cx.lineTo(W / 3, H);
    cx.moveTo((W * 2) / 3, 0);
    cx.lineTo((W * 2) / 3, H);
    cx.moveTo(0, H / 3);
    cx.lineTo(W, H / 3);
    cx.moveTo(0, (H * 2) / 3);
    cx.lineTo(W, (H * 2) / 3);
    cx.stroke();
    cx.restore();
  }

  state.hits = [];
  state.layers.forEach((l, i) => {
    if (!l.t.trim()) return;
    const F = FONTS[l.f] || FONTS.Impact;
    const px = Math.round(l.s / 600 * W);
    const align = normalizeAlign(l.align);
    const opacity = normalizeOpacity(l.opacity);
    const shadowColor = l.shadow || '#000000';
    const shadowBlur = normalizeShadowBlur(l.shadowBlur);
    const textValue = state.upper ? l.t.toUpperCase() : l.t;
    cx.font = `${F.w} ${px}px ${F.c}`;
    cx.textAlign = align;
    cx.textBaseline = 'middle';
    cx.lineJoin = 'round';
    cx.miterLimit = 2;
    cx.shadowColor = shadowColor;
    cx.shadowBlur = shadowBlur;
    cx.globalAlpha = opacity;
    const maxWidth = W * .92;
    const lines = wrap(textValue, maxWidth);
    const lh = px * 1.15;
    const block = lines.length * lh;
    const cy = clamp(l.y * H, block / 2, H - block / 2);
    const anchorX = l.x * W;
    cx.fillStyle = l.fill;
    cx.strokeStyle = l.stroke;
    cx.lineWidth = l.sw / 600 * W * 1.5;
    let mw = 0;

    lines.forEach((line, k) => {
      const y = cy - block / 2 + lh * (k + .5);
      const measure = cx.measureText(line).width;
      if (l.sw > 0) cx.strokeText(line, anchorX, y);
      cx.fillText(line, anchorX, y);
      mw = Math.max(mw, measure);
    });

    const boxX = align === 'left' ? anchorX : align === 'right' ? anchorX - mw : anchorX - mw / 2;
    state.hits.push({ i, x: boxX, y: cy - block / 2, w: mw, h: block });

    if (!exp && state.selK === 'txt' && i === state.sel) {
      cx.save();
      cx.shadowBlur = 0;
      cx.globalAlpha = 1;
      cx.setLineDash([10, 8]);
      cx.lineWidth = Math.max(2, W / 380);
      cx.strokeStyle = '#2b50ff';
      cx.strokeRect(boxX - 8, cy - block / 2 - 4, mw + 16, block + 8);
      cx.restore();
    }

    cx.shadowBlur = 0;
    cx.globalAlpha = 1;
  });

  if (state.wm.enabled) {
    const txt = (state.wm.text || '').trim();
    if (txt) {
      const Wm = state.wm;
      const px = W * (Wm.x ?? .82);
      const py = H * (Wm.y ?? .92);
      cx.save();
      cx.font = `700 ${Math.round(Wm.size || 28)}px sans-serif`;
      cx.textAlign = Wm.align || 'right';
      cx.textBaseline = 'middle';
      cx.fillStyle = Wm.fill || '#ffffff';
      cx.strokeStyle = Wm.stroke || '#0b1220';
      cx.shadowColor = Wm.shadow || '#000000';
      cx.shadowBlur = Number(Wm.shadowBlur ?? 0);
      cx.filter = `blur(${Number(Wm.blur ?? 0)}px)`;
      cx.globalAlpha = normalizeOpacity(Wm.opacity ?? .8);
      cx.lineWidth = 2;
      cx.strokeText(txt, px, py);
      cx.fillText(txt, px, py);
      if (!exp && state.selK === 'wm') {
        const box = getWatermarkBox(cx, W, H);
        if (box) {
          cx.setLineDash([10, 8]);
          cx.strokeStyle = '#7b93ff';
          cx.strokeRect(box.x - 8, box.y - 8, box.w + 16, box.h + 16);
          cx.setLineDash([]);
        }
      }
      cx.restore();
    }
  }
}

function pt(e) {
  const r = cv.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * cv.width / r.width,
    y: (e.clientY - r.top) * cv.height / r.height
  };
}

function getHandle(p, b, k) {
  const hs = 18 * k;
  const hp = (x, y) => Math.hypot(p.x - x, p.y - y) < hs;
  if (hp(b.x, b.y)) return 'tl';
  if (hp(b.x + b.w, b.y)) return 'tr';
  if (hp(b.x, b.y + b.h)) return 'bl';
  if (hp(b.x + b.w, b.y + b.h)) return 'br';
  if (hp(b.x + b.w / 2, b.y)) return 't';
  if (hp(b.x + b.w / 2, b.y + b.h)) return 'b';
  if (hp(b.x, b.y + b.h / 2)) return 'l';
  if (hp(b.x + b.w, b.y + b.h / 2)) return 'r';
  return null;
}

function applyRatio() {
  const value = $('#ratio').value;
  if (value === 'orig') {
    state.art = { w: state.orig.w, h: state.orig.h };
    return;
  }
  // Los presets son dimensiones reales en píxeles ("ancho:alto"), no un
  // factor multiplicado por 1080: así 16:9 es 1920×1080 (horizontal) y
  // 9:16 es 1080×1920 (TikTok/Reels/Stories).
  const [w, h] = value.split(':').map(Number);
  state.art = { w: w, h: h };
}

function fitW(c, cover) {
  const ar = state.art.h / state.art.w;
  const ir = c.height / c.width;
  return cover ? Math.max(1, ar / ir) : Math.min(1, ar / ir);
}

async function addImage(src) {
  try {
    let bmp = src;
    if (src instanceof Blob) {
      try {
        bmp = await createImageBitmap(src, { imageOrientation: 'from-image' });
      } catch {
        bmp = await createImageBitmap(src);
      }
    }

    const k = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);

    if (!state.imgs.length) {
      state.orig = { w: c.width, h: c.height };
      applyRatio();
      state.imgs = [{ c, x: .5, y: .5, w: fitW(c, true), filter: 'none' }];
      state.isel = 0;
      state.selK = 'txt';
    } else {
      state.imgs.push({ c, x: .5, y: .5, w: Math.min(.6, fitW(c, false)), filter: 'none' });
      state.isel = state.imgs.length - 1;
      state.selK = 'img';
      toast('Imagen añadida.');
    }

    sync();
    pushHistory();
    schedule();
  } catch (error) {
    console.error(error);
    toast('No se pudo abrir esa imagen.', true);
  }
}

function fromFile(file) {
  const files = Array.isArray(file) ? file : [file];
  const valid = files.filter((item) => item && item.type && item.type.startsWith('image/'));

  if (!valid.length) {
    toast('No es una imagen válida.', true);
    return;
  }

  valid.forEach((item) => addImage(item));
}

function syncImgs() {
  const tabs = $('#itabs');
  tabs.textContent = '';
  state.imgs.forEach((m, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab';
    button.setAttribute('aria-pressed', state.selK === 'img' && i === state.isel);
    button.textContent = 'Imagen ' + (i + 1);
    button.onclick = () => setSelection('img', i);
    tabs.appendChild(button);
  });

  const current = state.imgs[state.isel];
  $('#ictl').hidden = !current;
  if (!current) return;

  const w = Math.round(current.w * 100);
  const h = Math.round(current.w * state.art.w * current.c.height / current.c.width * (current.sy || 1) / state.art.h * 100);
  $('#isz').value = w;
  $('#iszV').textContent = w + '%';
  $('#iw').value = w;
  $('#iwV').textContent = w + '%';
  $('#ih').value = h;
  $('#ihV').textContent = h + '%';
  $('#filterSel').value = current.filter || 'none';
}

function syncWatermarkControls() {
  const wm = state.wm;
  $('#wmCheck').checked = !!wm.enabled;
  $('#wmLock').checked = !!wm.locked;
  $('#wmText').value = wm.text || 'miweb.com';
  $('#wmX').value = Math.round((wm.x ?? .82) * 100);
  $('#wmY').value = Math.round((wm.y ?? .92) * 100);
  $('#wmSize').value = wm.size ?? 28;
  $('#wmOpacity').value = wm.opacity ?? .8;
  $('#wmBlur').value = wm.blur ?? 0;
  $('#wmShadowBlur').value = wm.shadowBlur ?? 0;
  $('#wmFill').value = normalizeColor(wm.fill || '#ffffff', '#ffffff');
  $('#wmStroke').value = normalizeColor(wm.stroke || '#0b1220', '#0b1220');
  $('#wmShadow').value = normalizeColor(wm.shadow || '#000000', '#000000');
  $('#wmXV').textContent = Math.round((wm.x ?? .82) * 100) + '%';
  $('#wmYV').textContent = Math.round((wm.y ?? .92) * 100) + '%';
  $('#wmSizeV').textContent = Math.round(wm.size ?? 28) + 'px';
  $('#wmOpacityV').textContent = Number(wm.opacity ?? .8).toFixed(2);
  $('#wmBlurV').textContent = Number(wm.blur ?? 0) + 'px';
  $('#wmShadowBlurV').textContent = Number(wm.shadowBlur ?? 0) + 'px';
}

function sync() {
  syncImgs();
  syncWatermarkControls();
  const layer = cur();
  const tabs = $('#tabs');
  tabs.textContent = '';

  state.layers.forEach((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab';
    button.setAttribute('aria-pressed', state.selK === 'txt' && i === state.sel);
    button.textContent = `${i + 1}. ${item.t.trim().slice(0, 14) || 'vacío'}`;
    button.onclick = () => setSelection('txt', i);
    tabs.appendChild(button);
  });

  if (!layer) return;
  $('#lockLayer').checked = !!layer.locked;
  if (document.activeElement !== $('#txt')) $('#txt').value = layer.t;
  $('#font').value = layer.f;
  $('#fill').value = normalizeColor(layer.fill, '#ffffff');
  $('#stroke').value = normalizeColor(layer.stroke, '#000000');
  $('#shadowColor').value = normalizeColor(layer.shadow, '#000000');
  $('#size').value = layer.s;
  $('#sw').value = layer.sw;
  $('#shadowBlur').value = layer.shadowBlur ?? 0;
  $('#opacity').value = layer.opacity ?? 1;
  $('#bar').value = state.bar;
  $('#upper').checked = state.upper;
  $('#showGuides').checked = !!state.guides;
  $('#cleanOn').checked = !!state.cleanOn;
  $('#sizeV').textContent = layer.s;
  $('#swV').textContent = layer.sw;
  $('#shadowV').textContent = layer.shadowBlur ?? 0;
  $('#barV').textContent = state.bar + '%';
}

function applyWatermarkPreset(key) {
  const presets = {
    corner: { x: .82, y: .92, align: 'right', size: 28, fill: '#ffffff', stroke: '#0b1220', opacity: .8, blur: 0, shadow: '#000000', shadowBlur: 0 },
    center: { x: .5, y: .5, align: 'center', size: 34, fill: '#ffffff', stroke: '#0b1220', opacity: .9, blur: 0, shadow: '#000000', shadowBlur: 8 },
    subtle: { x: .82, y: .9, align: 'right', size: 22, fill: '#f8fafc', stroke: '#94a3b8', opacity: .55, blur: 0.5, shadow: '#0f172a', shadowBlur: 8 }
  };

  state.wm = { ...state.wm, ...(presets[key] || presets.corner) };
  syncWatermarkControls();
  saveLocal();
  schedule();
}

function bindControl(id, key, numeric = false) {
  $('#' + id).addEventListener('input', (event) => {
    const value = numeric ? +event.target.value : event.target.value;
    if (!cur()) return;
    cur()[key] = value;
    sync();
    schedule();
    saveLocal();
  });
}

const DEFAULT_MEME_TEMPLATES = [
  {
    n: 'Drake Hotline', w: 900, h: 900,
    fn: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#121826');
      g.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = '700 52px Arial';
      ctx.fillText('NOPE', 90, 180);
      ctx.fillText('SI', 660, 720);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(70, 240, w - 140, 340);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(70, 320, w - 140, 240);
      ctx.fillStyle = '#fff';
      ctx.fillText('Me gusta', 120, 380);
      ctx.fillText('Me gusta', 120, 440);
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(120, 560, w - 240, 6);
    }
  },
  {
    n: 'Woman yelling', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#f3f3f3';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, 0, w, h * .45);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, h * .45, w, h * .55);
      ctx.fillStyle = '#fff';
      ctx.font = '700 46px Arial';
      ctx.fillText('Mujer', 90, 140);
      ctx.fillText('gritando', 90, 190);
      ctx.fillText('Gato', 540, 760);
      ctx.fillText('calmado', 540, 810);
    }
  },
  {
    n: 'Success Kid', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#f5d0a9';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(440, 360, 220, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111827';
      ctx.fillRect(250, 520, 400, 180);
      ctx.fillStyle = '#fff';
      ctx.font = '700 58px Arial';
      ctx.fillText('¡ÉXITO!', 280, 170);
    }
  },
  {
    n: 'One does not simply', w: 900, h: 900,
    fn: (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#2d2d34');
      sky.addColorStop(1, '#111827');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(110, 160, 680, 520);
      ctx.fillStyle = '#111827';
      ctx.font = '700 42px Arial';
      ctx.fillText('ONE DOES NOT', 140, 220);
      ctx.fillText('SIMPLY', 250, 280);
      ctx.fillText('Meme', 330, 700);
    }
  },
  {
    n: 'This is fine', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(220, 220, 460, 430);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(260, 310, 130, 130);
      ctx.fillRect(500, 310, 130, 130);
      ctx.fillStyle = '#111827';
      ctx.fillRect(390, 510, 120, 70);
      ctx.font = '700 56px Arial';
      ctx.fillText('THIS IS FINE', 120, 180);
    }
  },
  {
    n: 'Expanding brain', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(100, 120, 200, 200);
      ctx.fillRect(320, 180, 200, 200);
      ctx.fillRect(540, 240, 200, 220);
      ctx.fillStyle = '#fff';
      ctx.font = '700 38px Arial';
      ctx.fillText('Idea', 160, 200);
      ctx.fillText('Más', 390, 260);
      ctx.fillText('¡Boom!', 590, 330);
    }
  }
];

const CINEMATIC_MEME_TEMPLATES = [
  {
    n: 'Cine brutal', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 52px Arial';
      ctx.fillText('SOLO', 130, 170);
      ctx.fillText('UN POCO', 250, 710);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(120, 220, 660, 300);
    }
  },
  {
    n: 'Plot twist', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 0, w, 140);
      ctx.fillStyle = '#fff';
      ctx.font = '700 48px Arial';
      ctx.fillText('PLOT TWIST', 200, 220);
      ctx.fillText('Meme', 300, 700);
    }
  },
  {
    n: 'Drama', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(80, 160, 740, 540);
      ctx.fillStyle = '#111827';
      ctx.font = '700 54px Arial';
      ctx.fillText('DRAMA', 280, 300);
    }
  }
];

function appendTemplateSet(templates) {
  const box = $('#tpl');
  if (!box) return;

  templates.forEach((template) => {
    const c = document.createElement('canvas');
    c.width = template.w;
    c.height = template.h;
    template.fn(c.getContext('2d'), template.w, template.h);

    const button = document.createElement('button');
    button.type = 'button';
    button.title = template.n;
    const thumb = document.createElement('canvas');
    thumb.width = 96;
    thumb.height = 96;
    thumb.getContext('2d').drawImage(c, 0, 0, template.w, template.h, 0, 0, 96, 96);
    button.appendChild(thumb);
    button.onclick = () => useTemplate(c);
    box.appendChild(button);
  });
}

async function fetchMemeCatalog(query = '', source = 'viral') {
  const term = (query || '').trim();
  const useProxy = !NATIVE_ANDROID || !!API_BASE;

  if (source === 'reddit') {
    if (!useProxy) throw new Error('La búsqueda en Reddit necesita el servidor (configura "Servidor IA").');
    const endpoint = apiUrl('/api/meme-search-reddit' + (term ? `?q=${encodeURIComponent(term)}` : ''));
    const reddit = await fetch(endpoint);
    if (!reddit.ok) throw new Error('Busqueda en Reddit no disponible');
    const payload = await reddit.json();
    return Array.isArray(payload?.data?.memes) ? payload.data.memes : [];
  }

  if (useProxy) {
    const proxy = await fetch(apiUrl('/api/meme-search' + (term ? `?q=${encodeURIComponent(term)}` : '')));
    if (proxy.ok) {
      const payload = await proxy.json();
      const items = Array.isArray(payload?.data?.memes) ? payload.data.memes : [];
      if (items.length || term) return items; // si hay termino, el proxy ya filtró
    }
  }
  // Sin proxy (0 = Android sin backend): API directa de Imgflip con filtro literal
  const response = await fetch('https://api.imgflip.com/get_memes');
  if (!response.ok) throw new Error('No disponible');

  const payload = await response.json();
  const items = Array.isArray(payload?.data?.memes) ? payload.data.memes : [];
  if (!term) return items;
  const normalized = term.toLowerCase();
  return items.filter((item) => item?.name && item.name.toLowerCase().includes(normalized));
}

async function loadViralTemplates(query = '', source = 'viral') {
  const isReddit = source === 'reddit';
  const btn = $(isReddit ? '#redditBtn' : '#viralBtn');
  const searchBtn = $('#searchViralBtn');
  const input = $('#memeSearch');
  if (!btn || !searchBtn) return;

  const activeBtn = query ? searchBtn : btn;
  activeBtn.disabled = true;
  activeBtn.textContent = 'Cargando...';
  btn.disabled = true;

  try {
    const term = (query || input?.value || '').trim();
    const items = await fetchMemeCatalog(term, source);
    // El backend ya filtra por termino (o devuelve posts calientes de Reddit);
    // sin termino y con Imgflip mostramos una muestra aleatoria del catalogo.
    const filtered = (!term && !isReddit) ? [...items].sort(() => Math.random() - 0.5) : items;
    const selected = filtered.slice(0, 12);

    const loaded = await Promise.all(selected.map(async (item) => {
      if (!item?.url) return null;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        img.src = item.url;
      });
      if (!img.width || !img.height) return null;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return { n: item.name || 'Meme viral', w: canvas.width, h: canvas.height, fn: (ctx2, w2, h2) => ctx2.drawImage(img, 0, 0, w2, h2) };
    }));

    const valid = loaded.filter(Boolean);
    const box = $('#tpl');
    if (box) box.textContent = '';

    if (valid.length) {
      appendTemplateSet(valid);
      toast(term ? `Resultados ${isReddit ? 'en Reddit ' : ''}para “${term}”` : (isReddit ? 'Posts calientes de memes en Reddit.' : 'Plantillas virales cargadas.'));
    } else {
      toast('No encontré memes con ese término. Prueba otro.', true);
    }
  } catch (error) {
    console.warn('No se pudieron cargar memes' + (isReddit ? ' desde Reddit' : ' virales') + ':', error);
    toast(isReddit
      ? 'No se pudo buscar en Reddit; prueba de nuevo en un momento.'
      : 'No se pudieron cargar memes virales; usando plantillas locales.', true);
  } finally {
    btn.disabled = false;
    btn.textContent = isReddit ? 'Reddit' : 'Memes virales';
    searchBtn.disabled = false;
    searchBtn.textContent = 'Buscar';
  }
}

function renderTemplateSet(key) {
  const box = $('#tpl');
  if (!box) return;
  box.textContent = '';

  const presets = {
    classic: DEFAULT_MEME_TEMPLATES,
    cinematic: CINEMATIC_MEME_TEMPLATES,
    viral: DEFAULT_MEME_TEMPLATES
  };

  appendTemplateSet(presets[key] || DEFAULT_MEME_TEMPLATES);
}

function buildTemplates() {
  const box = $('#tpl');
  if (!box) return;
  box.textContent = '';
  appendTemplateSet(DEFAULT_MEME_TEMPLATES);

  document.querySelectorAll('[data-template-set]').forEach((btn) => {
    btn.addEventListener('click', () => {
      renderTemplateSet(btn.dataset.templateSet);
    });
  });

  if ($('#viralBtn')) {
    $('#viralBtn').onclick = () => loadViralTemplates();
  }
  if ($('#redditBtn')) {
    $('#redditBtn').onclick = () => loadViralTemplates($('#memeSearch').value, 'reddit');
  }
  if (NATIVE_ANDROID && $('#apiBaseRow')) {
    // En Android el backend rembg corre en un PC de la LAN; aqui se apunta a el.
    $('#apiBaseRow').style.display = '';
    const input = $('#apiBase');
    input.value = API_BASE;
    $('#apiBaseSave').onclick = () => {
      const value = input.value.trim().replace(/\/+$/, '');
      localStorage.setItem('apiBase', value);
      toast(value ? 'Servidor IA configurado; recargando...' : 'Servidor IA desactivado; recargando...');
      setTimeout(() => location.reload(), 900);
    };
  }
  if ($('#draftRow')) {
    // La sincronizacion de borradores necesita backend (web con servidor, o
    // Android con "Servidor IA" configurado).
    if (HAS_BACKEND) {
      $('#draftRow').style.display = '';
      $('#draftUp').onclick = () => uploadDraft();
      $('#draftDown').onclick = () => downloadDraft();
    }
  }
  if ($('#searchViralBtn')) {
    $('#searchViralBtn').onclick = () => loadViralTemplates($('#memeSearch').value);
  }
  if ($('#memeSearch')) {
    $('#memeSearch').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        loadViralTemplates($('#memeSearch').value);
      }
    });
  }
}

function useTemplate(c) {
  state.imgs = state.imgs.filter((image) => !image.tpl);
  state.orig = { w: c.width, h: c.height };
  applyRatio();
  state.imgs.unshift({ c, x: .5, y: .5, w: fitW(c, true), tpl: true, filter: 'none' });
  state.isel = 0;
  state.selK = 'img';
  sync();
  pushHistory();
  schedule();
}

function stroke(p, first) {
  const image = state.imgs[state.isel];
  const box = image && image.box;
  const canvas = image && image.c;
  if (!image || !box || !canvas) return;

  if (!image.mask || image.mask.width !== canvas.width || image.mask.height !== canvas.height) {
    image.mask = document.createElement('canvas');
    image.mask.width = canvas.width;
    image.mask.height = canvas.height;
  }

  const kx = canvas.width / box.w;
  const x = (p.x - box.x) * kx;
  const y = (p.y - box.y) * kx;
  const g = image.mask.getContext('2d');
  g.strokeStyle = '#ff2d55';
  g.fillStyle = '#ff2d55';
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.lineWidth = Number($('#brush').value) * (state.art.w / 700) * kx;
  g.beginPath();
  g.moveTo(first ? x : state.drag.lx, first ? y : state.drag.ly);
  g.lineTo(x + .01, y);
  g.stroke();
  state.drag.lx = x;
  state.drag.ly = y;
}

function dilateMask(mask, w, h, radius) {
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

function inpaint(d, hole, w, h) {
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

// Bandera de proceso en curso: evita lanzar la inferencia de rembg una
// segunda vez mientras la primera sigue corriendo en el backend (cada llamada
// ejecuta un modelo U2-Net bloqueante en CPU y encolarlas puede saturar
// completamente la máquina).
let bgRealBusy = false;

async function removeBackgroundReal() {
  const image = state.imgs[state.isel];
  if (!image) return toast('Selecciona una imagen primero.', true);

  if (bgRealBusy) {
    return toast('Ya hay un proceso de fondo real en marcha. Espera a que termine.', true);
  }

  if (!HAS_BACKEND) {
    return toast('"Quitar fondo real" necesita el servidor Python. En Android configúralo en "Servidor IA" (tu PC en la misma red), o usa el borrador manual.', true);
  }

  const btn = $('#removeBgRealBtn');
  const originalLabel = btn.textContent;
  bgRealBusy = true;
  btn.disabled = true;
  btn.classList.add('loading');
  btn.setAttribute('aria-busy', 'true');
  btn.textContent = 'Procesando…';
  toast('Procesando fondo con IA… puede tardar unos segundos.');

  try {
    const canvas = document.createElement('canvas');
    canvas.width = image.c.width;
    canvas.height = image.c.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image.c, 0, 0);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Blob vacío');

    const form = new FormData();
    form.append('image', blob, 'image.png');

    // Backend integrado en FastAPI (o servidor remoto configurado en Android):
    // ruta relativa en escritorio, absoluta en el móvil cuando hay apiBase.
    const response = await fetch(apiUrl('/api/remove-bg'), {
      method: 'POST',
      body: form
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Fallo del backend');
    }

    const processedBlob = await response.blob();
    const bitmap = await createImageBitmap(processedBlob);
    const out = document.createElement('canvas');
    out.width = bitmap.width;
    out.height = bitmap.height;
    const outCtx = out.getContext('2d');
    outCtx.drawImage(bitmap, 0, 0);

    image.c = out;
    image.mask = null;

    // Auto-crop del backend: el resultado llega recortado al bounding box del
    // canal alfa y la cabecera "X-Crop-Box: left,top,ancho_orig,alto_orig"
    // indica que zona del original es. Re-escalamos y re-posicionamos la capa
    // para que el sujeto ocupe en el lienzo exactamente el espacio (posicion y
    // tamano) que ocupaba; si la cabecera no viene, queda centrado como antes.
    const cropParts = (response.headers.get('x-crop-box') || '')
      .split(',').map(v => Number(v.trim()));
    const [cropLeft, cropTop, origW, origH] = cropParts;
    if (
      cropParts.length === 4 && cropParts.every(Number.isFinite) &&
      origW > 0 && origH > 0 && bitmap.width < origW && bitmap.height < origH
    ) {
      const W = state.art.w;
      const H = state.art.h;
      const w0 = image.w * W;                       // ancho renderizado actual
      const h0 = w0 * origH / origW * (image.sy || 1); // alto renderizado actual
      const fw = bitmap.width / origW;              // fraccion conservada en X
      const fh = bitmap.height / origH;             // fraccion conservada en Y
      if (fw > 0 && fh > 0) {
        const w1 = fw * w0;                          // nuevo ancho renderizado
        const h1 = fh * h0;                          // nuevo alto renderizado
        const left = image.x * W - w0 / 2 + (cropLeft / origW) * w0;
        const top  = image.y * H - h0 / 2 + (cropTop / origH) * h0;
        image.w = w1 / W;
        image.sy = h1 / (w1 * bitmap.height / bitmap.width);
        image.x = (left + w1 / 2) / W;
        image.y = (top + h1 / 2) / H;
      } else {
        image.sy = 1;
        image.x = .5;
        image.y = .5;
      }
    } else {
      image.sy = 1;
      image.x = .5;
      image.y = .5;
    }

    pushHistory();
    sync();
    schedule();
    toast('Fondo real eliminado y recortado correctamente.');
  } catch (error) {
    console.error(error);
    toast('El backend de fondo real no está disponible. Inícialo en Python.', true);
  } finally {
    // El bloqueo SIEMPRE se libera, incluso si el fetch o el decode fallan,
    // para que el botón pueda volver a usarse después de un error.
    bgRealBusy = false;
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.removeAttribute('aria-busy');
    btn.textContent = originalLabel;
  }
}

function removeBackground() {
  const image = state.imgs[state.isel];
  if (!image) return toast('Selecciona una imagen primero.', true);

  const canvas = image.c;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width: w, height: h } = canvas;
  const source = ctx.getImageData(0, 0, w, h);
  const data = source.data;

  const samplePoints = [];
  const margin = Math.max(12, Math.round(Math.min(w, h) * 0.04));
  for (let x = 0; x < w; x += Math.max(8, Math.round(w / 12))) {
    samplePoints.push([x, 0], [x, h - 1]);
  }
  for (let y = 0; y < h; y += Math.max(8, Math.round(h / 12))) {
    samplePoints.push([0, y], [w - 1, y]);
  }
  samplePoints.push([Math.floor(w / 2), Math.floor(h / 2)]);

  let r = 0, g = 0, b = 0, count = 0;
  for (const [x, y] of samplePoints) {
    const index = (Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4;
    if (data[index + 3] < 10) continue;
    r += data[index];
    g += data[index + 1];
    b += data[index + 2];
    count++;
  }

  if (!count) return toast('No pude detectar el fondo de la imagen.', true);

  const bg = { r: r / count, g: g / count, b: b / count };
  const tolerance = 52;
  const minAlpha = 70;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < minAlpha) continue;
    const dr = Math.abs(data[i] - bg.r);
    const dg = Math.abs(data[i + 1] - bg.g);
    const db = Math.abs(data[i + 2] - bg.b);
    const nearBg = dr + dg + db < tolerance * 3;
    const edge = (i / 4) % w < margin || (i / 4) % w > w - margin || Math.floor((i / 4) / w) < margin || Math.floor((i / 4) / w) > h - margin;
    if (nearBg && edge) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(source, 0, 0);
  image.mask = null;
  pushHistory();
  schedule();
  toast('Fondo removido con ajuste automático.');
}

function applyClean() {
  const image = state.imgs[state.isel];
  if (!image || !image.mask) return toast('Primero pinta sobre lo que quieres borrar.', true);

  const w = image.c.width;
  const h = image.c.height;
  const ctx = image.c.getContext('2d', { willReadFrequently: true });
  const maskCtx = image.mask.getContext('2d', { willReadFrequently: true });
  const maskData = maskCtx.getImageData(0, 0, w, h).data;
  const source = ctx.getImageData(0, 0, w, h);
  const d = source.data;

  let hole = new Uint8Array(w * h);
  let painted = 0;
  const onlyText = $('#onlyText').checked;

  for (let i = 0; i < w * h; i++) {
    if (maskData[i * 4 + 3] < 60) continue;
    if (onlyText) {
      const r = d[i * 4];
      const g = d[i * 4 + 1];
      const b = d[i * 4 + 2];
      if (!(Math.min(r, g, b) > 200 || Math.max(r, g, b) < 60)) continue;
    }
    hole[i] = 1;
    painted++;
  }

  if (!painted) return toast('No se detectó texto blanco/negro en el trazo.', true);

  hole = dilateMask(hole, w, h, Math.max(2, Math.round(w / 400)));
  inpaint(d, hole, w, h);
  ctx.putImageData(source, 0, 0);
  image.mask = null;
  pushHistory();
  schedule();
  toast('Listo. Ctrl+Z si no te gusta.');
}

function cropBars() {
  const image = state.imgs[state.isel];
  if (!image) return toast('Sube una imagen primero.', true);

  const c = image.c;
  const w = c.width;
  const h = c.height;
  const data = c.getContext('2d').getImageData(0, 0, w, h).data;
  const tolerance = 24;

  const matchRatio = (y, reference) => {
    let count = 0;
    for (let x = 0; x < w; x++) {
      const index = (y * w + x) * 4;
      if (Math.abs(data[index] - reference[0]) < tolerance && Math.abs(data[index + 1] - reference[1]) < tolerance && Math.abs(data[index + 2] - reference[2]) < tolerance) count++;
    }
    return count / w;
  };

  const lastIndex = (h - 1) * w * 4;
  const topRef = [data[0], data[1], data[2]];
  const bottomRef = [data[lastIndex], data[lastIndex + 1], data[lastIndex + 2]];

  let top = 0;
  let bottom = h - 1;

  while (top < h - 10 && matchRatio(top, topRef) > .35) top++;
  while (bottom > top + 10 && matchRatio(bottom, bottomRef) > .35) bottom--;

  if (top === 0 && bottom === h - 1) return toast('No encontré barras que quitar.', true);

  const nextCanvas = document.createElement('canvas');
  nextCanvas.width = w;
  nextCanvas.height = bottom - top + 1;
  nextCanvas.getContext('2d').drawImage(c, 0, top, w, nextCanvas.height, 0, 0, w, nextCanvas.height);

  image.c = nextCanvas;
  image.mask = null;
  image.sy = 1;
  image.x = .5;
  image.y = .5;

  if (state.imgs.length === 1 && !image.tpl) {
    state.orig = { w: nextCanvas.width, h: nextCanvas.height };
    applyRatio();
    image.w = fitW(nextCanvas, true);
  }

  pushHistory();
  sync();
  schedule();
  toast('Barras recortadas.');
}

function saveLocal() {
  try {
    const payload = {
      art: state.art,
      orig: state.orig,
      layers: state.layers,
      bar: state.bar,
      upper: state.upper,
      guides: state.guides,
      bg: $('#bg').value,
      bgTransparent: $('#bgTransparent').checked,
      wm: state.wm
    };
    localStorage.setItem('meme_studio_draft', JSON.stringify(payload));
  } catch (error) {
    console.warn('No se pudo guardar el borrador', error);
  }
}

// Autoayuda del autosave: re-agenda el guardado y escribe cuando la
// interaccion se estabiliza (~1.2s sin cambios). Los saves inmediatos
// (pushHistory) siguen igual; esto cubre los cambios que no van al historial.
let _localTimer = null;
function scheduleSave(delay = 1200) {
  clearTimeout(_localTimer);
  _localTimer = setTimeout(saveLocal, delay);
}

window.addEventListener('beforeunload', () => {
  clearTimeout(_localTimer);
  saveLocal();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    // Al minimizar/alternar app (importante en Android PWA)
    clearTimeout(_localTimer);
    saveLocal();
  }
});

function loadLocal() {
  try {
    const raw = localStorage.getItem('meme_studio_draft');
    if (!raw) return;
    const data = JSON.parse(raw);
    state.art = data.art || state.art;
    state.orig = data.orig || state.orig;
    state.layers = data.layers || state.layers;
    state.bar = data.bar ?? 0;
    state.upper = data.upper ?? true;
    state.guides = !!(data.guides ?? state.guides);
    state.wm = { ...state.wm, ...(data.wm || {}) };
    if (data.bg) $('#bg').value = data.bg;
    if (data.bgTransparent !== undefined) $('#bgTransparent').checked = !!data.bgTransparent;
  } catch (error) {
    console.warn('No se pudo restaurar el borrador', error);
  }
}

// --- Sincronizacion de borradores con el servidor (movil <-> PC) -------------
// Cada usuario guarda UN borrador remoto con el meme completo: la imagen
// (dataURL), las capas, posiciones, filtros y ajustes. Formato compatible con
// buildSnapshot()/loadState() + los ajustes de UI del borrador local.

function remoteDraftPayload() {
  return {
    art: state.art,
    orig: state.orig,
    layers: state.layers,
    bar: state.bar,
    upper: state.upper,
    guides: state.guides,
    bg: $('#bg').value,
    bgTransparent: $('#bgTransparent').checked,
    wm: state.wm,
    savedAt: Date.now(),
    imgs: state.imgs.map((m) => ({
      x: m.x,
      y: m.y,
      w: m.w,
      sy: m.sy,
      filter: m.filter,
      tpl: m.tpl,
      src: m.c.toDataURL()
    }))
  };
}

async function restoreRemoteDraft(data) {
  state.imgs = (await Promise.all((data.imgs || []).map(async (m) => {
    const img = new Image();
    img.src = m.src;
    try {
      await img.decode();
    } catch {
      return null;
    }
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return {
      c,
      x: m.x ?? .5,
      y: m.y ?? .5,
      w: m.w ?? fitW(c, false),
      sy: m.sy ?? 1,
      filter: m.filter || 'none',
      tpl: m.tpl
    };
  }))).filter(Boolean);

  if (!state.imgs.length) throw new Error('El borrador no contiene imagenes validas');

  state.art = data.art || state.art;
  state.orig = data.orig || state.orig;
  state.layers = data.layers || state.layers;
  state.bar = data.bar ?? 0;
  state.upper = data.upper ?? true;
  state.guides = !!(data.guides ?? state.guides);
  state.wm = { ...state.wm, ...(data.wm || {}) };
  if (data.bg) $('#bg').value = data.bg;
  if (data.bgTransparent !== undefined) $('#bgTransparent').checked = !!data.bgTransparent;

  state.sel = 0;
  state.isel = 0;
  state.selK = state.imgs.length ? 'img' : 'txt';
  normalizeSelection();
  sync();
  pushHistory();
  schedule();
}

function authErrorMessage(status, fallback) {
  if (status === 401) return 'Login requerido (usuario/contrasena del servidor).';
  if (status === 404) return 'El servidor no tiene ningun borrador guardado para tu usuario.';
  if (status === 413) return 'El borrador es demasiado grande para el servidor.';
  return fallback;
}

async function uploadDraft() {
  const button = $('#draftUp');
  if (!validateExportReady()) {
    toast('Añade una imagen antes de subir el borrador.', true);
    return;
  }
  button.disabled = true;
  const original = button.textContent;
  button.textContent = 'Subiendo...';
  try {
    const response = await fetch(apiUrl('/api/draft'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(remoteDraftPayload())
    });
    if (!response.ok) {
      toast(authErrorMessage(response.status, 'No se pudo subir el borrador.'), true);
      return;
    }
    const info = await response.json();
    toast(`Borrador subido como "${info.user}" (${(info.bytes / 1024).toFixed(0)} KB).`);
  } catch (error) {
    console.error(error);
    toast('No se pudo conectar con el servidor para subir el borrador.', true);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

async function downloadDraft() {
  const button = $('#draftDown');
  if (!confirm('¿Reemplazar lo que hay en el canvas por el borrador guardado en el servidor?')) return;
  button.disabled = true;
  const original = button.textContent;
  button.textContent = 'Descargando...';
  try {
    const response = await fetch(apiUrl('/api/draft'));
    if (!response.ok) {
      toast(authErrorMessage(response.status, 'No se pudo traer el borrador.'), true);
      return;
    }
    const data = await response.json();
    await restoreRemoteDraft(data);
    toast('Borrador restaurado desde el servidor.');
  } catch (error) {
    console.error(error);
    toast(error.message === 'El borrador no contiene imagenes validas'
      ? error.message
      : 'No se pudo conectar con el servidor para traer el borrador.', true);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function getExportPreset() {
  const key = $('#exportPreset').value;
  return EXPORT_PRESETS[key] || EXPORT_PRESETS.original;
}

function validateExportReady() {
  if (!state.imgs.length) {
    toast('Añade una imagen primero.', true);
    return false;
  }
  return true;
}

function clearSelectedText() {
  const layer = cur();
  if (!layer) return;
  layer.t = '';
  sync();
  pushHistory();
  schedule();
  toast('Texto vaciado.');
}

function render(type, presetKey = $('#exportPreset').value) {
  const preset = EXPORT_PRESETS[presetKey] || EXPORT_PRESETS.original;
  const out = document.createElement('canvas');
  out.width = preset.w || cv.width;
  out.height = preset.h || cv.height;
  const ctx = out.getContext('2d');

  const previous = {
    selK: state.selK,
    sel: state.sel,
    cleanOn: state.cleanOn
  };

  try {
    state.selK = null;
    state.sel = -1;
    state.cleanOn = false;
    $('#cleanOn').checked = false;
    cv.style.cursor = 'default';
    draw(true);
    if (type === 'image/jpeg') {
      // JPEG no soporta canal alpha: se aplana siempre sobre un color.
      ctx.fillStyle = $('#bgTransparent').checked ? '#ffffff' : $('#bg').value;
      ctx.fillRect(0, 0, out.width, out.height);
    } else if (!$('#bgTransparent').checked) {
      // PNG/WebP respetan la transparencia: solo se rellena si hay color de fondo.
      ctx.fillStyle = $('#bg').value;
      ctx.fillRect(0, 0, out.width, out.height);
    }
    ctx.drawImage(cv, 0, 0, out.width, out.height);
  } finally {
    state.selK = previous.selK;
    state.sel = previous.sel;
    state.cleanOn = previous.cleanOn;
    $('#cleanOn').checked = !!state.cleanOn;
    cv.style.cursor = state.cleanOn ? 'crosshair' : 'default';
    draw();
  }

  return new Promise((resolve) => {
    out.toBlob((blob) => {
      resolve(blob);
    }, type, .92);
  });
}

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

async function download() {
  if (!validateExportReady()) return;

  const type = $('#fmt').value;
  const blob = await render(type, $('#exportPreset').value);
  if (!blob) return toast('No se pudo generar la imagen.', true);

  if (NATIVE_ANDROID) {
    // WebView: <a download> no guarda en la Galeria; el bridge nativo escribe
    // en MediaStore (Pictures/MemeStudioPro) y dispara el escaneo multimedia.
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const result = String(window.AndroidSaver.saveImage(dataUrl, `meme-${Date.now()}.${EXT[type] || 'png'}`));
    if (result === 'ok') toast('Meme guardado en la galería (Pictures/MemeStudioPro)');
    else toast('No se pudo guardar el meme: ' + result, true);
    return;
  }

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `meme-${Date.now()}.${EXT[type] || 'png'}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Meme descargado');
}

async function copy() {
  if (!validateExportReady()) return;
  if (!navigator.clipboard || !window.ClipboardItem) {
    toast('Tu navegador no soporta copiar imágenes aquí. Usa Descargar.', true);
    return;
  }

  try {
    const blob = await render('image/png', $('#exportPreset').value);
    if (!blob) throw new Error('Blob vacío');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('¡Copiado al portapapeles!');
  } catch (error) {
    console.error(error);
    toast('El navegador bloqueó la acción. Usa Descargar.', true);
  }
}

function bindAccordions() {
  document.querySelectorAll('.accordion-item').forEach((item) => {
    const head = item.querySelector('.accordion-head');
    if (!head) return;
    head.addEventListener('click', () => {
      const open = !item.classList.contains('is-collapsed');
      document.querySelectorAll('.accordion-item').forEach((panel) => {
        const button = panel.querySelector('.accordion-head');
        const collapsed = panel === item ? open : true;
        panel.classList.toggle('is-collapsed', collapsed);
        if (button) button.setAttribute('aria-expanded', String(!collapsed));
      });
    });
  });
}

function initEvents() {
  bindAccordions();

  cv.addEventListener('pointerdown', (e) => {
    const p = pt(e);
    const { W, bh, H } = geom();
    const k = W / 700;
    const pad = 14;

    if (state.cleanOn && state.imgs[state.isel] && state.imgs[state.isel].box) {
      state.drag = { m: 'paint' };
      stroke(p, true);
      cv.setPointerCapture(e.pointerId);
      schedule();
      return;
    }

    const m = state.selK === 'img' && state.imgs[state.isel];
    if (m && m.box) {
      const mode = getHandle(p, m.box, k);
      if (mode) {
        state.drag = { m: mode, startW: m.w, startSy: (m.sy || 1), startX: p.x, startY: p.y };
        cv.setPointerCapture(e.pointerId);
        return;
      }
    }

    const wmBox = state.wm.enabled ? getWatermarkBox(cx, W, H) : null;
    if (wmBox && p.x >= wmBox.x && p.x <= wmBox.x + wmBox.w && p.y >= wmBox.y && p.y <= wmBox.y + wmBox.h) {
      if (state.wm.locked) {
        state.selK = 'wm';
        sync();
        schedule();
        return;
      }
      state.selK = 'wm';
      state.drag = { m: 'wm', startX: p.x, startY: p.y, startWmX: state.wm.x, startWmY: state.wm.y };
      cv.setPointerCapture(e.pointerId);
      sync();
      schedule();
      return;
    }

    const hit = [...state.hits].reverse().find((box) =>
      p.x >= box.x - pad &&
      p.x <= box.x + box.w + pad &&
      p.y >= box.y - pad &&
      p.y <= box.y + box.h + pad
    );

    if (hit) {
      state.selK = 'txt';
      state.sel = hit.i;
      const layer = cur();
      if (layer && layer.locked) {
        sync();
        schedule();
        return;
      }
      const nearRight = p.x >= hit.x + hit.w - 22 && p.y >= hit.y + hit.h - 22;
      state.drag = nearRight
        ? { m: 'txt-resize', startX: p.x, startY: p.y, startS: layer.s }
        : { m: 'mv', dx: p.x - layer.x * W, dy: p.y - layer.y * H };
    } else {
      let j = -1;
      for (let i = state.imgs.length - 1; i >= 0; i--) {
        const b = state.imgs[i].box;
        if (b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
          j = i;
          break;
        }
      }
      if (j < 0) return;
      state.selK = 'img';
      state.isel = j;
      const o = state.imgs[j];
      state.drag = { m: 'mv', dx: p.x - o.x * W, dy: p.y - (bh + o.y * state.art.h) };
    }

    cv.setPointerCapture(e.pointerId);
    sync();
    schedule();
  });

  cv.addEventListener('pointermove', (e) => {
    const p = pt(e);
    const { W, bh, H } = geom();
    const k = W / 700;

    if (state.drag && state.drag.m === 'paint') {
      stroke(p);
      schedule();
      return;
    }

    if (!state.drag && state.cleanOn) {
      cv.style.cursor = 'crosshair';
      return;
    }

    if (!state.drag) {
      const m = state.selK === 'img' && state.imgs[state.isel];
      if (m && m.box) {
        const mode = getHandle(p, m.box, k);
        if (mode === 'br' || mode === 'tl') cv.style.cursor = 'nwse-resize';
        else if (mode === 'bl' || mode === 'tr') cv.style.cursor = 'nesw-resize';
        else if (mode === 't' || mode === 'b') cv.style.cursor = 'ns-resize';
        else if (mode === 'l' || mode === 'r') cv.style.cursor = 'ew-resize';
        else cv.style.cursor = 'grab';
      } else if ((state.selK === 'txt' && cur()) || state.selK === 'wm') {
        cv.style.cursor = 'move';
      } else {
        cv.style.cursor = 'default';
      }
      return;
    }

    const o = state.imgs[state.isel];
    if (state.drag.m === 'wm') {
      state.wm.x = clamp(state.drag.startWmX + (p.x - state.drag.startX) / W, 0, 1.2);
      state.wm.y = clamp(state.drag.startWmY + (p.y - state.drag.startY) / H, 0, 1.2);
      syncWatermarkControls();
      schedule();
      return;
    }
    if (state.drag.m === 'txt-resize') {
      const layer = cur();
      const delta = (p.x - state.drag.startX) + (p.y - state.drag.startY) * 0.35;
      layer.s = clamp(state.drag.startS * (1 + delta / Math.max(120, W * .35)), 12, 220);
      sync();
      schedule();
      return;
    }
    if (state.drag.m === 'br' || state.drag.m === 'tl' || state.drag.m === 'bl' || state.drag.m === 'tr') {
      const factor = (state.drag.m === 'br' || state.drag.m === 'tr') ? 1 : -1;
      o.w = clamp(state.drag.startW + factor * 2 * (p.x - state.drag.startX) / W, .05, 4);
      syncImgs();
    } else if (state.drag.m === 'r' || state.drag.m === 'l') {
      const factor = state.drag.m === 'r' ? 1 : -1;
      const nw = clamp(state.drag.startW + factor * 2 * (p.x - state.drag.startX) / W, .05, 4);
      o.sy = (o.sy || 1) * o.w / nw;
      o.w = nw;
      syncImgs();
    } else if (state.drag.m === 'b' || state.drag.m === 't') {
      const factor = state.drag.m === 'b' ? 1 : -1;
      const hpx = Math.max(W * .03, (state.drag.startW * W * o.c.height / o.c.width * state.drag.startSy) + factor * 2 * (p.y - state.drag.startY));
      o.sy = hpx / (o.w * W * o.c.height / o.c.width);
      syncImgs();
    } else if (state.selK === 'txt') {
      const layer = cur();
      layer.x = clamp((p.x - state.drag.dx) / W, 0, 1);
      layer.y = clamp((p.y - state.drag.dy) / H, 0, 1);
    } else if (o) {
      o.x = clamp((p.x - state.drag.dx) / W, -.5, 1.5);
      o.y = clamp((p.y - state.drag.dy - bh) / state.art.h, -.5, 1.5);
    }

    schedule();
  });

  ['pointerup', 'pointercancel'].forEach((eventName) => {
    cv.addEventListener(eventName, () => {
      if (state.drag) {
        const paint = state.drag.m === 'paint';
        state.drag = null;
        if (!paint) pushHistory();
      }
    });
  });

  $('#alignH').onclick = () => {
    if (state.selK === 'txt') cur().x = .5;
    else if (state.imgs[state.isel]) state.imgs[state.isel].x = .5;
    pushHistory();
    schedule();
  };

  $('#alignV').onclick = () => {
    if (state.selK === 'txt') cur().y = .5;
    else if (state.imgs[state.isel]) state.imgs[state.isel].y = .5;
    pushHistory();
    schedule();
  };

  $('#filterSel').addEventListener('change', (event) => {
    const image = state.imgs[state.isel];
    if (!image) return;
    image.filter = event.target.value;
    pushHistory();
    schedule();
  });

  $('#isz').addEventListener('input', (event) => {
    const image = state.imgs[state.isel];
    if (!image) return;
    image.w = Number(event.target.value) / 100;
    state.selK = 'img';
    sync();
    schedule();
  });

  $('#iw').addEventListener('input', (event) => {
    const image = state.imgs[state.isel];
    if (!image) return;
    const nw = Number(event.target.value) / 100;
    image.sy = (image.sy || 1) * image.w / nw;
    image.w = nw;
    state.selK = 'img';
    syncImgs();
    schedule();
  });

  $('#ih').addEventListener('input', (event) => {
    const image = state.imgs[state.isel];
    if (!image) return;
    image.sy = (Number(event.target.value) / 100 * state.art.h) / (image.w * state.art.w * image.c.height / image.c.width);
    state.selK = 'img';
    syncImgs();
    schedule();
  });

  $('#stretchBtn').onclick = () => {
    const image = state.imgs[state.isel];
    if (!image) return;
    image.w = 1;
    image.sy = state.art.h / (state.art.w * image.c.height / image.c.width);
    image.x = .5;
    image.y = .5;
    pushHistory();
    sync();
    schedule();
  };

  $('#shapeBtn').onclick = () => {
    const image = state.imgs[state.isel];
    if (!image) return;
    image.sy = 1;
    pushHistory();
    sync();
    schedule();
  };

  $('#fitBtn').onclick = () => {
    const image = state.imgs[state.isel];
    if (!image) return;
    image.w = fitW(image.c, false);
    image.sy = 1;
    image.x = .5;
    image.y = .5;
    pushHistory();
    sync();
    schedule();
  };

  $('#coverBtn').onclick = () => {
    const image = state.imgs[state.isel];
    if (!image) return;
    image.w = fitW(image.c, true);
    image.sy = 1;
    image.x = .5;
    image.y = .5;
    pushHistory();
    sync();
    schedule();
  };

  $('#frontBtn').onclick = () => {
    const image = state.imgs[state.isel];
    if (!image) return;
    state.imgs.push(state.imgs.splice(state.isel, 1)[0]);
    state.isel = state.imgs.length - 1;
    pushHistory();
    sync();
    schedule();
  };

  $('#backBtn').onclick = () => {
    const image = state.imgs[state.isel];
    if (!image) return;
    state.imgs.unshift(state.imgs.splice(state.isel, 1)[0]);
    state.isel = 0;
    pushHistory();
    sync();
    schedule();
  };

  $('#idelBtn').onclick = () => {
    if (!state.imgs[state.isel]) return;
    state.imgs.splice(state.isel, 1);
    state.isel = Math.max(0, state.isel - 1);
    if (!state.imgs.length) state.selK = 'txt';
    pushHistory();
    sync();
    schedule();
  };

  $('#ratio').addEventListener('change', () => {
    applyRatio();
    pushHistory();
    schedule();
  });

  $('#bg').addEventListener('input', () => {
    schedule();
    saveLocal();
  });

  $('#bgTransparent').addEventListener('change', () => {
    schedule();
    saveLocal();
  });

  $('#font').addEventListener('change', (event) => {
    cur().f = event.target.value;
    sync();
    pushHistory();
    schedule();
  });

  $('#bar').addEventListener('input', (event) => {
    state.bar = Number(event.target.value);
    sync();
    schedule();
  });

  $('#shadowColor').addEventListener('input', (event) => {
    if (!cur()) return;
    cur().shadow = event.target.value;
    pushHistory();
    schedule();
  });

  $('#shadowBlur').addEventListener('input', (event) => {
    if (!cur()) return;
    cur().shadowBlur = Number(event.target.value);
    sync();
    schedule();
  });

  $('#opacity').addEventListener('input', (event) => {
    if (!cur()) return;
    cur().opacity = normalizeOpacity(event.target.value);
    sync();
    schedule();
  });

  $('#upper').addEventListener('change', (event) => {
    state.upper = event.target.checked;
    pushHistory();
    schedule();
  });

  $('#showGuides').addEventListener('change', (event) => {
    state.guides = event.target.checked;
    schedule();
    saveLocal();
  });

  $('#lockLayer').addEventListener('change', (event) => {
    if (!cur()) return;
    cur().locked = event.target.checked;
    saveLocal();
  });

  $('#wmLock').addEventListener('change', (event) => {
    state.wm.locked = event.target.checked;
    schedule();
    saveLocal();
  });

  $('#wmCheck').addEventListener('change', (event) => {
    state.wm.enabled = event.target.checked;
    state.selK = state.wm.enabled ? 'wm' : state.selK;
    schedule();
    saveLocal();
  });

  $('#wmText').addEventListener('input', (event) => {
    state.wm.text = event.target.value;
    schedule();
    saveLocal();
  });

  $('#wmX').addEventListener('input', (event) => {
    state.wm.x = Number(event.target.value) / 100;
    schedule();
    saveLocal();
  });

  $('#wmY').addEventListener('input', (event) => {
    state.wm.y = Number(event.target.value) / 100;
    schedule();
    saveLocal();
  });

  $('#wmSize').addEventListener('input', (event) => {
    state.wm.size = Number(event.target.value);
    schedule();
    saveLocal();
  });

  $('#wmOpacity').addEventListener('input', (event) => {
    state.wm.opacity = Number(event.target.value);
    schedule();
    saveLocal();
  });

  $('#wmBlur').addEventListener('input', (event) => {
    state.wm.blur = Number(event.target.value);
    schedule();
    saveLocal();
  });

  $('#wmShadowBlur').addEventListener('input', (event) => {
    state.wm.shadowBlur = Number(event.target.value);
    schedule();
    saveLocal();
  });

  $('#wmFill').addEventListener('input', (event) => {
    state.wm.fill = event.target.value;
    schedule();
    saveLocal();
  });

  $('#wmStroke').addEventListener('input', (event) => {
    state.wm.stroke = event.target.value;
    schedule();
    saveLocal();
  });

  $('#wmShadow').addEventListener('input', (event) => {
    state.wm.shadow = event.target.value;
    schedule();
    saveLocal();
  });

  document.querySelectorAll('[data-wm-preset]').forEach((button) => {
    button.addEventListener('click', () => applyWatermarkPreset(button.dataset.wmPreset));
  });

  $('#addBtn').onclick = () => {
    const base = cur() || {};
    state.layers.push(mk('Nuevo texto', { y: .5, f: base.f, fill: base.fill, stroke: base.stroke, s: base.s, sw: base.sw }));
    state.sel = state.layers.length - 1;
    sync();
    pushHistory();
    schedule();
    $('#txt').focus();
  };

  $('#dupBtn').onclick = () => {
    if (!cur()) return;
    const source = cur();
    const copy = mk(source.t, {
      x: clamp(source.x + .08, 0, 1),
      y: clamp(source.y + .06, 0, 1),
      f: source.f,
      fill: source.fill,
      stroke: source.stroke,
      s: source.s,
      sw: source.sw,
      align: source.align || 'center',
      opacity: source.opacity ?? 1,
      shadow: source.shadow || '#000000',
      shadowBlur: source.shadowBlur ?? 0
    });
    state.layers.splice(state.sel + 1, 0, copy);
    state.sel = state.sel + 1;
    sync();
    pushHistory();
    schedule();
  };

  $('#delBtn').onclick = () => {
    if (!state.layers.length) return;
    state.layers.splice(state.sel, 1);
    if (!state.layers.length) {
      state.layers.push(mk('', { y: .5 }));
      state.sel = 0;
    } else {
      state.sel = Math.max(0, Math.min(state.sel, state.layers.length - 1));
    }
    sync();
    pushHistory();
    schedule();
  };

  $('#clearTextBtn').onclick = clearSelectedText;

  $('#alignLeftBtn').onclick = () => {
    if (!cur()) return;
    cur().align = 'left';
    cur().x = .12;
    pushHistory();
    sync();
    schedule();
  };
  $('#alignCenterBtn').onclick = () => {
    if (!cur()) return;
    cur().align = 'center';
    cur().x = .5;
    pushHistory();
    sync();
    schedule();
  };
  $('#alignRightBtn').onclick = () => {
    if (!cur()) return;
    cur().align = 'right';
    cur().x = .88;
    pushHistory();
    sync();
    schedule();
  };

  $('#presets').addEventListener('click', (event) => {
    const key = event.target.dataset.p;
    if (!key) return;
    if (key === 'bar') {
      state.bar = 24;
      if (!state.layers.length) {
        state.layers = [mk('', { y: .1 })];
        state.sel = 0;
      }
      state.layers.forEach((layer) => Object.assign(layer, PRESETS.classic));
      Object.assign(state.layers[0], { f: 'Arial', fill: '#000000', stroke: '#000000', s: 40, sw: 0, y: state.bar / (200 + 2 * state.bar) });
    } else {
      state.bar = 0;
      state.layers.forEach((layer) => Object.assign(layer, PRESETS[key]));
    }
    sync();
    pushHistory();
    schedule();
  });

  $('#resetBtn').onclick = () => {
    state.layers = [mk('', { y: .1 }), mk('', { y: .9 })];
    state.sel = 0;
    state.bar = 0;
    state.upper = true;
    $('#ratio').value = 'orig';
    $('#bg').value = '#ffffff';
    $('#bgTransparent').checked = true;
    state.imgs = [];
    state.orig = { w: 900, h: 900 };
    applyRatio();
    sync();
    pushHistory();
    schedule();
  };

  $('#upBtn').onclick = () => $('#file').click();
  $('#file').addEventListener('change', (event) => {
    const files = [...(event.target.files || [])];
    if (files.length) fromFile(files);
    event.target.value = '';
  });

  $('#pasteBtn').onclick = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((candidate) => candidate.startsWith('image/'));
        if (type) {
          fromFile(await item.getType(type));
          return;
        }
      }
      toast('No hay imágenes en el portapapeles.', true);
    } catch {
      toast('Usa Ctrl+V para pegar.', true);
    }
  };

  $('#cleanOn').addEventListener('change', (event) => {
    state.cleanOn = event.target.checked;
    if (state.cleanOn && state.imgs.length && state.selK !== 'img') {
      state.selK = 'img';
      sync();
    }
    cv.style.cursor = state.cleanOn ? 'crosshair' : 'default';
    schedule();
  });

  $('#brush').addEventListener('input', (event) => {
    $('#brushV').textContent = event.target.value;
  });

  $('#clearMask').onclick = () => {
    const image = state.imgs[state.isel];
    if (image) image.mask = null;
    schedule();
  };

  $('#removeBgBtn').onclick = () => {
    if (!state.imgs.length) return toast('Añade una imagen primero.', true);
    state.selK = 'img';
    state.cleanOn = false;
    $('#cleanOn').checked = false;
    cv.style.cursor = 'default';
    removeBackground();
  };

  $('#removeBgRealBtn').onclick = removeBackgroundReal;

  $('#eraseObjectBtn').onclick = () => {
    if (!state.imgs.length) return toast('Añade una imagen primero.', true);
    state.selK = 'img';
    state.cleanOn = true;
    cv.style.cursor = 'crosshair';
    $('#cleanOn').checked = true;
    const cleanSection = $('#cleanOn').closest('.accordion-item');
    if (cleanSection && cleanSection.classList.contains('is-collapsed')) {
      cleanSection.classList.remove('is-collapsed');
      const head = cleanSection.querySelector('.accordion-head');
      if (head) head.setAttribute('aria-expanded', 'true');
    }
    toast('Pinta sobre el objeto que quieres borrar.');
    schedule();
  };

  $('#cleanBtn').onclick = applyClean;
  $('#cropBtn').onclick = cropBars;
  $('#brushV').textContent = $('#brush').value;

  $('#dlBtn').onclick = download;
  $('#copyBtn').onclick = copy;
  $('#exportPreset').addEventListener('change', () => {
    const preset = getExportPreset();
    $('#exportPreset').value = preset ? $('#exportPreset').value : 'original';
  });

  window.addEventListener('keydown', (event) => {
    const ctrl = event.ctrlKey || event.metaKey;
    if (ctrl && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) $('#redoBtn').click();
      else $('#undoBtn').click();
    }
    if (ctrl && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      $('#redoBtn').click();
    }
    if (ctrl && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      $('#dupBtn').click();
    }
    if (ctrl && event.key === 'Enter') {
      event.preventDefault();
      download();
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && !state.cleanOn && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      event.preventDefault();
      if (state.selK === 'img') {
        $('#idelBtn').click();
        return;
      }
      if (state.selK === 'txt') {
        if (!state.layers.length) return;
        state.layers.splice(state.sel, 1);
        if (!state.layers.length) {
          state.layers.push(mk('', { y: .5 }));
          state.sel = 0;
        } else {
          state.sel = Math.max(0, Math.min(state.sel, state.layers.length - 1));
        }
        sync();
        pushHistory();
        schedule();
        return;
      }
      if (state.selK === 'wm') {
        state.wm.enabled = false;
        state.selK = 'txt';
        sync();
        schedule();
        saveLocal();
      }
    }
  });

  window.addEventListener('paste', (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) return;
    const file = [...clipboard.files].find((item) => item.type.startsWith('image/'));
    if (file) {
      event.preventDefault();
      fromFile(file);
    }
  });

  const drop = $('#drop');
  window.addEventListener('dragenter', (event) => {
    if ([...event.dataTransfer.types].includes('Files')) {
      state.dropDepth += 1;
      drop.classList.add('on');
    }
  });

  window.addEventListener('dragleave', () => {
    state.dropDepth = Math.max(0, state.dropDepth - 1);
    if (!state.dropDepth) drop.classList.remove('on');
  });

  window.addEventListener('dragover', (event) => event.preventDefault());
  window.addEventListener('drop', (event) => {
    event.preventDefault();
    state.dropDepth = 0;
    drop.classList.remove('on');
    const files = [...(event.dataTransfer.files || [])];
    if (files.length) fromFile(files);
  });

  $('#undoBtn').onclick = () => loadState(state.hIndex - 1);
  $('#redoBtn').onclick = () => loadState(state.hIndex + 1);

  bindControl('txt', 't');
  bindControl('fill', 'fill');
  bindControl('stroke', 'stroke');
  bindControl('size', 's', true);
  bindControl('sw', 'sw', true);

  buildTemplates();
  loadLocal();
  if (!state.layers.length) {
    state.layers = [mk('', { y: .1 }), mk('', { y: .9 })];
    state.sel = 0;
    state.bar = 0;
    state.upper = true;
  }
  normalizeSelection();
  sync();
  pushHistory();
  schedule();
}

initEvents();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => schedule());
}

// --- PWA: service worker (instalable desde Chrome/Edge + cache offline) -----
// Solo en entorno web con HTTP(S); en la WebView Android (file://) no aplica.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// --- Deep-link ?img= / ?t1= / ?t2= ------------------------------------------
// Enlace con imagen precargada y (opcional) los dos textos clasicos:
// ?img=<url de la imagen> &t1=<texto superior>&t2=<texto inferior>
// Util para compartir un meme a medio hacer y para las capturas del README.
try {
  const query = new URLSearchParams(location.search);
  const t1 = query.get('t1');
  const t2 = query.get('t2');
  const bootImg = query.get('img');

  if ((t1 || t2) && state.layers.length >= 2) {
    if (t1) state.layers[0].t = t1;
    if (t2) state.layers[1].t = t2;
    state.sel = 0;
    sync();
    pushHistory();
    schedule();
  }

  if (bootImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (img.width && img.height) addImage(img);
    };
    img.src = bootImg;
  }
} catch (error) {
  console.warn('Deep-link de arranque invalido', error);
}
