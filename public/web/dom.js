/* Utilidades de DOM (adaptador de presentación). Único módulo que toca el
   document directamente para behaviors transversales (toasts, selectors). */
export const $ = (selector) => document.querySelector(selector);

export function toast(msg, err = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('err', !!err);
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2400);
}
