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
  const CERRADOS = ['Cerrado', 'No cumplió', 'Ponche aplicado'];
  const grupo = function (x) { return CERRADOS.indexOf(x.estado) !== -1 ? 'cerr' : (x.estado === 'Foto recibida' || x.estado === 'Sin evidencia' ? 'pend' : 'esp'); };
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
      const est = x.estado === 'Foto recibida' || x.estado === 'Sin evidencia' ? 'Foto' : CERRADOS.indexOf(x.estado) !== -1 ? 'Cerrado' : x.estado;
      const perdon = x.tipo === 'Ponche perdonado';
      const porRevisar = x.estado === 'Foto recibida' || x.estado === 'Sin evidencia';
      const ultima = perdon && x.vueltas >= (x.maxVueltas || 3);
      return '<div class="tarjeta seg"><div class="arriba"><div><p class="nom">' + (perdon ? '🕊 ' : '') + esc(x.contratista || '(sin empresa)') + '</p>' +
        '<p class="dato">' + (perdon ? 'Ponche perdonado con condición · ' : '') + esc(x.trabajador) + ' · ' + esc(fecha(x.fecha)) + ' · ' + esc(x.obra) +
          (perdon ? ' · vuelta ' + x.vueltas + ' de ' + (x.maxVueltas || 3) : (x.vueltas > 1 ? ' · vuelta ' + x.vueltas : '')) + '</p></div>' +
        '<span class="estado ' + esc(est) + '">' + esc(x.estado) + '</span></div>' +
        '<p class="asunto">' + esc(x.asunto) + '</p>' +
        '<p class="dato">Responsable: ' + esc(x.responsable || '—') + (x.correo ? ' · ' + esc(x.correo) : '') + (x.whatsapp ? ' · 📲 ' + esc(x.whatsapp) : '') + ' · reportó ' + esc(x.creo) + '</p>' +
        '<div class="fotos-ab"><a href="' + esc(x.pdf) + '" target="_blank" rel="noopener">📄 Antes (reporte)</a>' +
        (x.foto ? x.foto.split(/\s+/).filter(Boolean).map(function (u, k, arr) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">📸 Después' + (arr.length > 1 ? ' ' + (k + 1) : '') + ' (' + esc(fecha(x.fechaFoto)) + ')</a>'; }).join('') : '<a aria-disabled="true">⏳ Sin foto todavía</a>') + '</div>' +
        (x.notaResp ? '<p class="dato">💬 Responsable: ' + esc(x.notaResp) + '</p>' : '') +
        (x.causa ? '<p class="dato">🚫 Sin evidencia: ' + esc(x.causa) + '</p>' : '') +
        (x.notaRev ? '<p class="dato">↩ Revisión: ' + esc(x.notaRev) + ' (' + esc(x.reviso) + ')</p>' : '') +
        (porRevisar ? '<div class="botones"><button class="boton si" type="button" data-cerrar="' + i + '">✅ Corregido</button>' +
          (!ultima ? '<button class="boton no" type="button" data-repetir="' + i + '">↩ Repetir</button>'
                   : '<button class="boton no" type="button" data-final="ponche" data-i="' + i + '">🔨 No cumplió: aplicar ponche</button><button class="boton no" type="button" data-final="nocumplio" data-i="' + i + '">⚠ No cumplió: dejarlo anotado</button>') + '</div>' : '') +
        (perdon && !porRevisar && CERRADOS.indexOf(x.estado) === -1 ? '<div class="botones"><button class="boton secundario" type="button" data-subir="' + i + '">📸 Subir evidencia</button><button class="boton secundario" type="button" data-sinev="' + i + '">🚫 No se subió (anotar causa)</button></div>' : '') +
        '</div>';
    }).join('') : '<p class="vacio">' + { pend: 'No hay fotos por revisar.', esp: 'Nadie está pendiente de mandar foto.', cerr: 'Todavía no hay seguimientos cerrados.' }[filtro] + '</p>';
    $('lista').querySelectorAll('[data-cerrar]').forEach(function (b) { b.addEventListener('click', function () { revisar(L[Number(b.getAttribute('data-cerrar'))], 'cerrar', b); }); });
    $('lista').querySelectorAll('[data-repetir]').forEach(function (b) { b.addEventListener('click', function () { revisar(L[Number(b.getAttribute('data-repetir'))], 'repetir', b); }); });
    $('lista').querySelectorAll('[data-final]').forEach(function (b) { b.addEventListener('click', function () { revisar(L[Number(b.getAttribute('data-i'))], b.getAttribute('data-final'), b); }); });
    $('lista').querySelectorAll('[data-subir]').forEach(function (b) { b.addEventListener('click', function () { subir(L[Number(b.getAttribute('data-subir'))], b); }); });
    $('lista').querySelectorAll('[data-sinev]').forEach(function (b) { b.addEventListener('click', function () { sinEvidencia(L[Number(b.getAttribute('data-sinev'))], b); }); });
  }
  /* 🕊 El supervisor sube la evidencia que le mandaron, o anota por qué no la hay */
  function subir(x, b) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.addEventListener('change', function () {
      const f = input.files && input.files[0];
      if (!f) return;
      const lector = new FileReader();
      lector.onload = function () {
        const img = new Image();
        img.onload = async function () {
          const k = Math.min(1, 1600 / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          const nota = prompt('Nota (opcional): ¿qué corrigió o cómo te llegó la evidencia?', '');
          if (nota === null) return;
          b.disabled = true;
          try {
            const r = await App.api('evidenciaSeguimiento', { id: x.id, fotos: [c.toDataURL('image/jpeg', 0.8)], nota: nota });
            if (!r.ok) throw new Error(r.error);
            $('msg').innerHTML = '<div class="aviso ok">📸 Evidencia guardada: ahora valídala o pide repetir.</div>';
            filtro = 'pend'; await cargar();
          } catch (e) { $('msg').innerHTML = '<div class="aviso error">⚠ ' + esc(e.message) + '</div>'; b.disabled = false; }
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(f);
    });
    input.click();
  }
  async function sinEvidencia(x, b) {
    const causa = prompt('¿Por qué no se sube la evidencia? (queda anotado)');
    if (causa === null || !causa.trim()) return;
    b.disabled = true;
    try {
      const r = await App.api('evidenciaSeguimiento', { id: x.id, sinEvidencia: true, causa: causa.trim() });
      if (!r.ok) throw new Error(r.error);
      $('msg').innerHTML = '<div class="aviso ok">🚫 Anotado sin evidencia: ahora valídalo o pide repetir.</div>';
      filtro = 'pend'; await cargar();
    } catch (e) { $('msg').innerHTML = '<div class="aviso error">⚠ ' + esc(e.message) + '</div>'; b.disabled = false; }
  }

  async function revisar(x, decision, b) {
    let nota = '';
    if (decision === 'repetir') {
      nota = prompt('¿Qué falta? (se le manda al responsable)');
      if (nota === null || !nota.trim()) return;
    } else if (decision === 'ponche' || decision === 'nocumplio') {
      nota = prompt(decision === 'ponche' ? '🔨 No cumplió en 3 vueltas: los reportes vuelven a «Por decidir» en Ponchados para aplicar el ponche. Nota (opcional):'
                                          : '⚠ No cumplió en 3 vueltas: queda anotado en el historial, sin ponche. Nota (opcional):', '');
      if (nota === null) return;
    } else if (!confirm(x.tipo === 'Ponche perdonado' ? '¿Se cumplió la condición? Se cierra el seguimiento.' : '¿Quedó corregido? Se cierra el asunto y la bitácora queda «Cerrado» con la foto.')) return;
    b.disabled = true;
    try {
      const r = await App.api('revisarSeguimiento', { id: x.id, decision: decision, nota: nota });
      if (!r.ok) throw new Error(r.error);
      $('msg').innerHTML = decision === 'ponche' ? '<div class="aviso ok">🔨 ' + r.reabiertos + ' reporte(s) volvieron a «Por decidir» en Ponchados (app de asistencias).</div>'
        : decision === 'nocumplio' ? '<div class="aviso ok">⚠ Anotado: no cumplió la condición.</div>'
        : decision === 'cerrar'
        ? '<div class="aviso ok">✅ Cerrado: ' + esc(x.contratista) + '.</div>'
        : '<div class="aviso alerta">↩ Se le pidió repetir' + (r.correo ? ' (correo a ' + esc(r.correo) + ')' : '') + '.' +
          (r.whatsapp ? ' <a class="boton chico" target="_blank" rel="noopener" href="https://wa.me/' + esc(r.whatsapp) + '?text=' + encodeURIComponent(r.mensaje) + '">📲 Avisar por WhatsApp</a>' : '') + '</div>';
      await cargar();
    } catch (e) { $('msg').innerHTML = '<div class="aviso error">⚠ ' + esc(e.message) + '</div>'; b.disabled = false; }
  }
})();
