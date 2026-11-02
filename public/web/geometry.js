/* Matemática de capas y color (dominio puro, testable en Node sin DOM). */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const normalizeOpacity = (value) => clamp(Number(value ?? 1), .1, 1);
export const normalizeShadowBlur = (value) => clamp(Number(value ?? 0), 0, 30);
export const normalizeAlign = (value) => ['left', 'center', 'right'].includes(value) ? value : 'center';

export const normalizeColor = (value, fallback) => {
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!candidate) return fallback;
  const valid = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(candidate);
  return valid ? candidate : fallback;
};

export function hexToRgb(hex) {
  const value = (hex || '').replace('#', '');
  const full = value.length === 3 ? value.split('').map((char) => char + char).join('') : value;
  const int = Number.parseInt(full, 16) || 0;
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex || '#ffffff');
  const channel = (value) => {
    const s = value / 255;
    return s <= .03928 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
