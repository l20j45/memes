/* Constantes del dominio visual: límites, tipografías y presets de estilos.
   Identidad de datos puros: nada de DOM ni I/O. */
export const MAX = 1600;

export const FONTS = {
  Impact: { c: 'Impact, Anton, sans-serif', w: 400 },
  Anton: { c: 'Anton, Impact, sans-serif', w: 400 },
  Oswald: { c: 'Oswald, sans-serif', w: 700 },
  Montserrat: { c: 'Montserrat, sans-serif', w: 800 },
  Comic: { c: "'Comic Neue','Comic Sans MS',cursive", w: 700 },
  Arial: { c: 'Arial, Helvetica, sans-serif', w: 700 }
};

export const PRESETS = {
  classic: { f: 'Impact', fill: '#ffffff', stroke: '#000000', s: 54, sw: 16 },
  modern: { f: 'Montserrat', fill: '#ffffff', stroke: '#000000', s: 46, sw: 0 },
  neon: { f: 'Anton', fill: '#00ffff', stroke: '#ff00ff', s: 52, sw: 12 }
};

export const EXPORT_PRESETS = {
  // 'original' SIN w/h fijos: render() lo resuelve con las dimensiones
  // reales del lienzo (state.art) — preservar el aspecto SIEMPRE.
  original: { label: 'Original' },
  '1080x1080': { label: '1080 × 1080', w: 1080, h: 1080 },
  '1200x1200': { label: '1200 × 1200', w: 1200, h: 1200 },
  '1080x1920': { label: '1080 × 1920', w: 1080, h: 1920 },
  '1920x1080': { label: '1920 × 1080', w: 1920, h: 1080 }
};
