// ============================================================================
//  Página pública (sin usuario): «Has sido reportado… envía la foto aquí».
//  La liga trae un código único (?t=…) que sólo sirve para este asunto.
// ============================================================================
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = App.esc;
  const t = new URLSearchParams(location.search).get('t') || '';
  let fotos = [];
  cargar();

  async function cargar() {
    try {
      const r = await App.api('seguimientoPublico', { t: t });
      if (!r.ok) throw new Error(r.error);
      $('cargando').hidden = true; $('caja').hidden = false;
      if (r.logoObra) { $('logo-obra').src = r.logoObra; $('logo-obra').hidden = false; }
      $('saludo').textContent = 'Hola' + (r.responsable ? ' ' + r.responsable : '') + ': han sido reportados';
      $('asunto').textContent = r.asunto;
      $('datos').textContent = 'Obra ' + r.obra + (r.contratista ? ' · ' + r.contratista : '') + (r.trabajador ? ' · Trabajador: ' + r.trabajador : '');
      $('pdf').href = r.pdf;
      $('repetir').innerHTML = r.estado === 'Repetir' ? '<div class="aviso error">↩ Hay que repetir la corrección' + (r.notaRevision ? ': ' + esc(r.notaRevision) : '') + '</div>' : '';
      if (r.estado === 'Cerrado') { $('subir').hidden = true; $('gracias').hidden = false; $('gracias').querySelector('h2').textContent = '✅ Este asunto ya está cerrado. ¡Gracias!'; }
      else if (r.estado === 'Foto recibida') { $('msg').innerHTML = '<div class="aviso ok">Ya mandaste una foto; si quieres, puedes mandar otra.</div>'; }
    } catch (e) { $('cargando').textContent = '⚠ ' + e.message; }
  }
  $('b-camara').addEventListener('click', function () { $('in-camara').value = ''; $('in-camara').click(); });
  $('b-galeria').addEventListener('click', function () { $('in-galeria').value = ''; $('in-galeria').click(); });
  ['in-camara', 'in-galeria'].forEach(function (id) {
    $(id).addEventListener('change', function () {
      Array.from(this.files || []).forEach(function (f) { if (fotos.length < 6) reducir(f); else alert('Máximo 6 fotos.'); });
    });
  });
  function pintar() {
    $('vistas').innerHTML = fotos.map(function (f, i) { return '<div class="v"><img src="' + f + '" alt=""><button type="button" data-q="' + i + '" aria-label="Quitar">✕</button></div>'; }).join('');
    $('vistas').querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { fotos.splice(Number(b.getAttribute('data-q')), 1); pintar(); }); });
    $('enviar').disabled = !fotos.length;
    $('enviar').textContent = fotos.length > 1 ? 'Enviar ' + fotos.length + ' fotos' : 'Enviar foto';
  }
  function reducir(file) {
    const lector = new FileReader();
    lector.onload = function () {
      const img = new Image();
      img.onload = function () {
        const k = Math.min(1, 1600 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        if (fotos.length < 6) fotos.push(c.toDataURL('image/jpeg', 0.8));
        pintar();
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  }
  $('enviar').addEventListener('click', async function () {
    const b = this;
    if (!fotos.length) return;
    b.disabled = true; b.textContent = 'Enviando…';
    try {
      const r = await App.api('seguimientoFoto', { t: t, fotos: fotos, nota: $('nota').value.trim() });
      if (!r.ok) throw new Error(r.error);
      $('subir').hidden = true; $('gracias').hidden = false;
      window.scrollTo(0, 0);
    } catch (e) { $('msg').innerHTML = '<div class="aviso error">⚠ ' + esc(e.message) + '</div>'; b.disabled = false; pintar(); }
  });
})();
