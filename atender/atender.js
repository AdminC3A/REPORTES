// ============================================================================
//  Página pública (sin usuario): «Has sido reportado… envía la foto aquí».
//  La liga trae un código único (?t=…) que sólo sirve para este asunto.
// ============================================================================
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = App.esc;
  const t = new URLSearchParams(location.search).get('t') || '';
  let foto = '';
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
  ['in-camara', 'in-galeria'].forEach(function (id) { $(id).addEventListener('change', function () { if (this.files[0]) reducir(this.files[0]); }); });
  function reducir(file) {
    const lector = new FileReader();
    lector.onload = function () {
      const img = new Image();
      img.onload = function () {
        const k = Math.min(1, 1600 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        foto = c.toDataURL('image/jpeg', 0.8);
        $('vista').src = foto; $('vista').hidden = false; $('enviar').disabled = false;
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  }
  $('enviar').addEventListener('click', async function () {
    const b = this;
    if (!foto) return;
    b.disabled = true; b.textContent = 'Enviando…';
    try {
      const r = await App.api('seguimientoFoto', { t: t, foto: foto, nota: $('nota').value.trim() });
      if (!r.ok) throw new Error(r.error);
      $('subir').hidden = true; $('gracias').hidden = false;
      window.scrollTo(0, 0);
    } catch (e) { $('msg').innerHTML = '<div class="aviso error">⚠ ' + esc(e.message) + '</div>'; b.disabled = false; b.textContent = 'Enviar foto'; }
  });
})();
