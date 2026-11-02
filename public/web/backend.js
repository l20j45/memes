/* Adaptador del backend (puerto ApiPort fase 1): detección de entorno y
   resolución de URLs. En Android nativo no hay backend propio salvo que el
   usuario configure "Servidor IA" (localStorage.apiBase en la WebView). */
export const NATIVE_ANDROID = typeof window !== 'undefined' && typeof window.AndroidSaver?.saveImage === 'function';
export const API_BASE = ((typeof localStorage !== 'undefined' && localStorage.getItem('apiBase')) || '').replace(/\/+$/, '');
export const HAS_BACKEND = !NATIVE_ANDROID || !!API_BASE;
export const apiUrl = (path) => API_BASE + path;
