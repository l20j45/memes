/* Estado global del editor (dominio): posiciones NORMALIZADAS 0..1 respecto
   al lienzo. Es un singleton compartido: los módulos importan este objeto y
   mutan sus campos (no reasignan la referencia). */
export const state = {
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
  cropOn: false,
  cropRect: null,
  cropShape: 'rect',   // 'rect' | 'poly' (poligono con nodos arrastrables)
  cropPoly: [],        // nodos como fracciones de la fuente (0..1) de la capa
  guides: false,
  history: [],
  hIndex: -1,
  dropDepth: 0,
  wm: {
    enabled: false,
    mode: 'text',        // 'text' | 'img' (logo con transparencia)
    img: null,           // { c: canvas del logo, w: ancho como fraccion del lienzo }
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

/* Fábrica de capa de texto con valores por defecto (update con {...o}). */
export const mk = (t = '', o = {}) => ({
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
