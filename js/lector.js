// ============================================================================
//  Lector de QR — abre directo la cámara trasera.
//  · Si el celular trae lector propio (Android con Chrome) se usa ése.
//  · Si no (iPhone), se usa lib/html5-qrcode.min.js.
//  Uso: App.lector.iniciar('id', function (texto) {…})  ·  App.lector.detener()
// ============================================================================
(function () {
  const base = new URL('..', document.currentScript.src).href;
  let flujo = null, intervalo = null, libreria = null;

  function cargarLibreria() {
    if (window.Html5Qrcode) return Promise.resolve();
    return new Promise(function (ok, mal) {
      const s = document.createElement('script');
      s.src = base + 'lib/html5-qrcode.min.js';
      s.onload = ok; s.onerror = function () { mal(new Error('No se pudo cargar el lector.')); };
      document.head.appendChild(s);
    });
  }
  async function lectorPropio() {
    try { return 'BarcodeDetector' in window && (await window.BarcodeDetector.getSupportedFormats()).indexOf('qr_code') !== -1; }
    catch (e) { return false; }
  }
  async function iniciarPropio(caja, alLeer) {
    const video = document.createElement('video');
    video.setAttribute('playsinline', ''); video.muted = true; video.className = 'lector-video';
    const marco = document.createElement('div'); marco.className = 'lector-marco';
    caja.innerHTML = ''; caja.classList.add('lector-caja'); caja.appendChild(video); caja.appendChild(marco);
    flujo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    video.srcObject = flujo;
    await video.play();
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    let ocupado = false;
    intervalo = setInterval(async function () {
      if (ocupado || video.readyState < 2) return;
      ocupado = true;
      try { const r = await detector.detect(video); if (r.length && r[0].rawValue) alLeer(r[0].rawValue); } catch (e) {}
      ocupado = false;
    }, 120);
  }
  async function iniciar(id, alLeer) {
    await detener();
    const caja = document.getElementById(id);
    if (await lectorPropio()) {
      try { await iniciarPropio(caja, alLeer); return 'propio'; } catch (e) { caja.innerHTML = ''; }
    }
    await cargarLibreria();
    libreria = new window.Html5Qrcode(id);
    await libreria.start({ facingMode: 'environment' }, { fps: 15, qrbox: { width: 220, height: 220 } }, alLeer, function () {});
    return 'libreria';
  }
  async function detener() {
    clearInterval(intervalo); intervalo = null;
    if (flujo) { flujo.getTracks().forEach(function (t) { t.stop(); }); flujo = null; }
    if (libreria) { try { await libreria.stop(); } catch (e) {} libreria = null; }
  }
  const st = document.createElement('style');
  st.textContent = '.lector-caja{position:relative;overflow:hidden;border-radius:14px;background:#000}' +
    '.lector-video{display:block;width:100%;height:auto;max-height:46vh;object-fit:cover}' +
    '.lector-marco{position:absolute;left:50%;top:50%;width:56%;aspect-ratio:1;transform:translate(-50%,-50%);border:3px solid rgba(255,255,255,.85);border-radius:12px;box-shadow:0 0 0 2000px rgba(0,0,0,.25)}';
  document.head.appendChild(st);
  window.App = window.App || {};
  window.App.lector = { iniciar: iniciar, detener: detener };
})();
