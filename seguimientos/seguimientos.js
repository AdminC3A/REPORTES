// ============================================================================
//  Módulo: 📋 Seguimientos
//  Quien reportó (o el coordinador) ve la foto que mandó el responsable:
//  ✅ Corregido → se cierra (y la bitácora queda «Cerrado» con su foto)
//  ↩ Repetir    → le vuelve a llegar al responsable con lo que falta
// ============================================================================
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = App.esc;
  let L = [], filtro = 'pend';
  if (!App.exigirSesion()) return;
  cargar();

  async function cargar() {
    try {
      const r = await App.api('listaSeguimientos', {});
      if (!r.ok) throw new Error(r.error);
      L = r.lista;
      $('cargando').hidden = true; $('filtros').hidden = false;
      pintar();
    } catch (e) { $('cargando').hidden = false; $('cargando').textContent = '⚠ ' + e.message; }
  }
  const grupo = function (x) { return x.estado === 'Cerrado' ? 'cerr' : (x.estado === 'Foto recibida' ? 'pend' : 'esp'); };
  document.querySelectorAll('.filtro').forEach(function (b) {
    b.addEventListener('click', function () { filtro = b.getAttribute('data-f'); pintar(); });
  });
  function fecha(iso) { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] : ''; }

  function pintar() {
    const n = { pend: 0, esp: 0, cerr: 0 };
    L.forEach(function (x) { n[grupo(x)]++; });
    document.querySelectorAll('.filtro').forEach(function (b) {
      const f = b.getAttribute('data-f');
      b.classList.toggle('activo', f === filtro);
      b.innerHTML = { pend: '📸 Por revisar', esp: '⏳ Esperando', cerr: '✅ Cerrados' }[f] + ' <b>' + n[f] + '</b>';
    });
    const vis = L.filter(function (x) { return grupo(x) === filtro; });
    $('lista').innerHTML = vis.length ? vis.map(function (x) {
      const i = L.indexOf(x);
      const est = x.estado === 'Foto recibida' ? 'Foto' : x.estado;
      return '<div class="tarjeta seg"><div class="arriba"><div><p class="nom">' + esc(x.contratista) + '</p>' +
        '<p class="dato">' + esc(x.trabajador) + ' · ' + esc(fecha(x.fecha)) + ' · ' + esc(x.obra) + (x.vueltas > 1 ? ' · vuelta ' + x.vueltas : '') + '</p></div>' +
        '<span class="estado ' + esc(est) + '">' + esc(x.estado) + '</span></div>' +
        '<p class="asunto">' + esc(x.asunto) + '</p>' +
        '<p class="dato">Responsable: ' + esc(x.responsable || '—') + (x.correo ? ' · ' + esc(x.correo) : '') + (x.whatsapp ? ' · 📲 ' + esc(x.whatsapp) : '') + ' · reportó ' + esc(x.creo) + '</p>' +
        '<div class="fotos-ab"><a href="' + esc(x.pdf) + '" target="_blank" rel="noopener">📄 Antes (reporte)</a>' +
        (x.foto ? x.foto.split(/\s+/).filter(Boolean).map(function (u, k, arr) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">📸 Después' + (arr.length > 1 ? ' ' + (k + 1) : '') + ' (' + esc(fecha(x.fechaFoto)) + ')</a>'; }).join('') : '<a aria-disabled="true">⏳ Sin foto todavía</a>') + '</div>' +
        (x.notaResp ? '<p class="dato">💬 Responsable: ' + esc(x.notaResp) + '</p>' : '') +
        (x.notaRev ? '<p class="dato">↩ Revisión: ' + esc(x.notaRev) + ' (' + esc(x.reviso) + ')</p>' : '') +
        (x.estado === 'Foto recibida' ? '<div class="botones"><button class="boton si" type="button" data-cerrar="' + i + '">✅ Corregido</button><button class="boton no" type="button" data-repetir="' + i + '">↩ Repetir</button></div>' : '') +
        '</div>';
    }).join('') : '<p class="vacio">' + { pend: 'No hay fotos por revisar.', esp: 'Nadie está pendiente de mandar foto.', cerr: 'Todavía no hay seguimientos cerrados.' }[filtro] + '</p>';
    $('lista').querySelectorAll('[data-cerrar]').forEach(function (b) { b.addEventListener('click', function () { revisar(L[Number(b.getAttribute('data-cerrar'))], 'cerrar', b); }); });
    $('lista').querySelectorAll('[data-repetir]').forEach(function (b) { b.addEventListener('click', function () { revisar(L[Number(b.getAttribute('data-repetir'))], 'repetir', b); }); });
  }

  async function revisar(x, decision, b) {
    let nota = '';
    if (decision === 'repetir') {
      nota = prompt('¿Qué falta? (se le manda al responsable)');
      if (nota === null || !nota.trim()) return;
    } else if (!confirm('¿Quedó corregido? Se cierra el asunto y la bitácora queda «Cerrado» con la foto.')) return;
    b.disabled = true;
    try {
      const r = await App.api('revisarSeguimiento', { id: x.id, decision: decision, nota: nota });
      if (!r.ok) throw new Error(r.error);
      $('msg').innerHTML = decision === 'cerrar'
        ? '<div class="aviso ok">✅ Cerrado: ' + esc(x.contratista) + '.</div>'
        : '<div class="aviso alerta">↩ Se le pidió repetir' + (r.correo ? ' (correo a ' + esc(r.correo) + ')' : '') + '.' +
          (r.whatsapp ? ' <a class="boton chico" target="_blank" rel="noopener" href="https://wa.me/' + esc(r.whatsapp) + '?text=' + encodeURIComponent(r.mensaje) + '">📲 Avisar por WhatsApp</a>' : '') + '</div>';
      await cargar();
    } catch (e) { $('msg').innerHTML = '<div class="aviso error">⚠ ' + esc(e.message) + '</div>'; b.disabled = false; }
  }
})();
