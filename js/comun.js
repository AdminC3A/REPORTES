// ============================================================================
//  REPORTEADOR DE SEGURIDAD · común
//  Usa la misma hoja y las mismas llaves (usuario y código) de la app NOMINAS 2027.
//  La sesión se guarda en este teléfono hasta tocar «Salir».
// ============================================================================
(function () {
  const VERSION = '2026.11.17-2';
  const LLAVE = 'rep_token', LLAVE_SESION = 'rep_sesion';

  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function raiz() { return new URL('..', document.currentScript ? document.currentScript.src : location.href).href; }
  const RAIZ = raiz();

  async function api(accion, datos) {
    const url = window.APP_CONFIG && window.APP_CONFIG.API_URL;
    if (!url || url.indexOf('http') !== 0) throw new Error('Falta la liga de Apps Script en config.js');
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ accion: accion, token: leer(LLAVE) }, datos || {}))
    });
    const json = await resp.json();
    if (!json.ok && json.error === 'SESION') { salir(); throw new Error('Tu sesión terminó. Vuelve a entrar.'); }
    return json;
  }
  function salir() { guardar(LLAVE, null); guardar(LLAVE_SESION, null); location.href = RAIZ + 'index.html'; }
  function sesion() { try { return JSON.parse(leer(LLAVE_SESION) || 'null'); } catch (e) { return null; } }
  function exigirSesion() { if (!leer(LLAVE)) { location.href = RAIZ + 'index.html'; return null; } return sesion(); }

  /* Pie con la versión (y aviso si la hoja tiene otro Code.gs) */
  function pie(versionGs) {
    document.querySelectorAll('.pie').forEach(function (el) {
      el.textContent = 'Reporteador v' + VERSION + (versionGs ? ' · hoja v' + versionGs : '');
    });
  }

  window.App = window.App || {};
  Object.assign(window.App, { api: api, esc: esc, salir: salir, sesion: sesion, exigirSesion: exigirSesion, pie: pie, version: VERSION,
    guardarSesion: function (token, s) { guardar(LLAVE, token); guardar(LLAVE_SESION, JSON.stringify(s)); } });
  document.addEventListener('DOMContentLoaded', function () { pie(''); });
})();
