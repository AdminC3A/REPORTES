// ============================================================================
//  Módulo: 🦺 Reporte de seguridad — SIN MAKE
//   1 QR del infractor (se revisa contra Autorizadas de NOMINAS 2027).
//     Si es el QR de quien reporta: «¿Se negó a darte su credencial?» y nombre a mano.
//   2 Fotos, riesgos y clasificación · 3 Infractor y observación · 4 Guardar
//  Al guardar, la hoja pone el renglón en la bitácora (pestaña del mes) y guarda el
//  PDF y las fotos en la carpeta de la app en Drive. Todo en un solo paso.
// ============================================================================
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = App.esc;
  const LLAVE_OBRA = 'rep_obra';
  const DESC_CLAS = {
    'Acto Inseguro': 'lo hizo la persona',
    'Condición Insegura': 'algo del lugar',
    'Falla Administrativa': 'papeles o permisos',
    'Otra Clasificación': 'escribe cuál'
  };
  let I = null;          /* datos de la hoja: obra, contratistas, riesgos… */
  let R = nuevo();       /* el reporte que se está llenando */
  let pausado = false, logoApp = '';

  function nuevo() {
    return { codigo: '', encontrado: false, negoCredencial: false, trabajador: '', empresa: '', fotos: [], riesgos: [], otros: '',
      clas: '', detalleClas: '', contratista: '', observacion: '' };
  }

  if (!App.exigirSesion()) return;
  $('salir').addEventListener('click', function () { if (confirm('¿Salir? Tendrás que volver a escribir tu usuario y código.')) { App.lector.detener(); App.salir(); } });
  cargar();
  imagenADato('../img/logo.png').then(function (d) { logoApp = d; });

  async function cargar(obra) {
    try {
      let guardada = ''; try { guardada = localStorage.getItem(LLAVE_OBRA) || ''; } catch (e) {}
      const r = await App.api('reporteInicio', { obra: obra || guardada });
      if (!r.ok) throw new Error(r.error);
      I = r;
      try { localStorage.setItem(LLAVE_OBRA, r.obra); } catch (e) {}
      App.pie(r.versionGs);
      $('quien').textContent = r.usuario + ' · ' + r.obra;
      $('logo-obra').hidden = !r.logoObra; if (r.logoObra) $('logo-obra').src = r.logoObra;
      $('obra').innerHTML = r.obras.map(function (o) { return '<option' + (o === r.obra ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('');
      $('caja-obra').hidden = r.obras.length < 2;
      $('contratista').innerHTML = '<option value="">— Elige —</option>' + r.contratistas.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '<option value="__otra">Otra…</option>';
      pintarRiesgos(); pintarClasificaciones();
      $('cargando').hidden = true; $('pasos').hidden = false;
      if (!r.escribe) { $('cargando').hidden = false; $('cargando').textContent = 'Tu usuario sólo puede consultar: no puede guardar reportes.'; }
      irPaso(1);
    } catch (e) { $('cargando').hidden = false; $('cargando').textContent = '⚠ ' + e.message; }
  }
  $('obra').addEventListener('change', function () { cargar($('obra').value); });

  // ------------------------------------------------------------------ pasos
  function irPaso(n) {
    for (let i = 1; i <= 6; i++) $('p' + i).hidden = i !== n;
    document.querySelectorAll('.pasos li').forEach(function (li) {
      const p = Number(li.getAttribute('data-p'));
      li.className = p < n ? 'hecho' : (p === n ? 'activo' : '');
    });
    window.scrollTo(0, 0);
    if (n === 1) abrirLector(); else App.lector.detener();
    if (n === 4) pintarResumen();
  }
  document.querySelectorAll('[data-ir]').forEach(function (b) { b.addEventListener('click', function () { irPaso(Number(b.getAttribute('data-ir'))); }); });

  // ------------------------------------------------------------ 1 · QR
  function abrirLector() {
    pausado = false;
    $('res-qr').hidden = true;
    $('estado-lector').textContent = 'Abriendo la cámara…';
    App.lector.iniciar('lector', alLeer).then(function () { $('estado-lector').textContent = 'Apunta al QR del gafete del infractor.'; })
      .catch(function (e) { $('estado-lector').textContent = '⚠ No se pudo abrir la cámara: ' + (e.message || e) + '. Revisa los permisos o escribe a mano.'; });
  }
  async function alLeer(texto) {
    const qr = String(texto || '').trim();
    if (pausado || !qr) return;
    pausado = true;
    if (navigator.vibrate) navigator.vibrate(60);
    $('estado-lector').textContent = 'Revisando ' + qr + '…';
    try {
      const r = await App.api('reporteQR', { qr: qr });
      if (!r.ok) throw new Error(r.error);
      if (r.propio) { App.lector.detener(); $('modal-nego').hidden = false; return; }
      R = Object.assign(nuevo(), { codigo: r.codigo, encontrado: r.encontrado, trabajador: r.nombre, empresa: r.empresa });
      mostrarQR(r);
    } catch (e) { $('estado-lector').textContent = '⚠ ' + e.message; pausado = false; }
  }
  function mostrarQR(r) {
    const caja = $('res-qr');
    const baja = r.encontrado && !/^activo$/i.test(r.estatus);
    caja.className = 'res-qr ' + (!r.encontrado ? 'mal' : (baja ? 'alerta' : 'ok'));
    caja.innerHTML = (r.encontrado
      ? '<p class="nom">' + esc(r.nombre) + '</p><p class="dato">' + esc([r.puesto, r.empresa].filter(Boolean).join(' · ')) + '</p><p class="dato">' + esc(r.codigo) +
        (baja ? ' · <b>⚠ Estatus: ' + esc(r.estatus || 'sin autorizar') + '</b>' : ' · ✅ Registrado') + '</p>'
      : '<p class="nom">⛔ Código ' + esc(r.codigo) + '</p><p class="dato"><b>No está registrado.</b> Anótalo y escribe su nombre en el paso 3.</p>') +
      '<div class="botones"><button class="boton secundario" type="button" id="otro-qr">↺ Escanear otro</button><button class="boton" type="button" id="seguir-qr">Continuar ▶</button></div>';
    caja.hidden = false;
    $('estado-lector').textContent = '';
    $('otro-qr').addEventListener('click', function () { pausado = false; caja.hidden = true; $('estado-lector').textContent = 'Apunta al QR del gafete del infractor.'; });
    $('seguir-qr').addEventListener('click', function () { irPaso(2); });
  }
  $('sin-qr').addEventListener('click', function () { R = nuevo(); irPaso(2); });
  $('nego-si').addEventListener('click', function () { R = Object.assign(nuevo(), { negoCredencial: true }); $('modal-nego').hidden = true; irPaso(2); });
  $('nego-no').addEventListener('click', function () { R = nuevo(); $('modal-nego').hidden = true; irPaso(2); });

  // ------------------------------------------------- 2 · fotos, riesgos, clasificación
  $('foto-camara').addEventListener('click', function () { $('in-camara').value = ''; $('in-camara').click(); });
  $('foto-galeria').addEventListener('click', function () { $('in-galeria').value = ''; $('in-galeria').click(); });
  $('in-camara').addEventListener('change', function () { agregarFotos(this.files); });
  $('in-galeria').addEventListener('change', function () { agregarFotos(this.files); });
  async function agregarFotos(lista) {
    for (const f of Array.from(lista || [])) {
      if (R.fotos.length >= 6) { alert('Máximo 6 fotos por reporte.'); break; }
      try { R.fotos.push(await reducir(f)); } catch (e) {}
    }
    pintarFotos();
  }
  function pintarFotos() {
    $('fotos').innerHTML = R.fotos.length ? R.fotos.map(function (f, i) {
      return '<div class="foto"><img src="' + f.url + '" alt=""><button type="button" data-quitar="' + i + '" aria-label="Quitar foto">✕</button></div>';
    }).join('') : '<p class="vacio">Todavía no hay fotos. Toma al menos una.</p>';
    $('fotos').querySelectorAll('[data-quitar]').forEach(function (b) {
      b.addEventListener('click', function () { R.fotos.splice(Number(b.getAttribute('data-quitar')), 1); pintarFotos(); });
    });
  }
  function reducir(file) {
    return new Promise(function (ok, mal) {
      const lector = new FileReader();
      lector.onload = function () {
        const img = new Image();
        img.onload = function () {
          const k = Math.min(1, 1280 / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          ok({ url: c.toDataURL('image/jpeg', 0.75), w: c.width, h: c.height });
        };
        img.onerror = mal;
        img.src = lector.result;
      };
      lector.onerror = mal;
      lector.readAsDataURL(file);
    });
  }
  function pintarRiesgos() {
    $('riesgos').innerHTML = I.riesgos.map(function (r) { return '<button type="button" class="chip' + (R.riesgos.indexOf(r) !== -1 ? ' si' : '') + '" data-r="' + esc(r) + '">' + esc(r) + '</button>'; }).join('');
    $('riesgos').querySelectorAll('[data-r]').forEach(function (b) {
      b.addEventListener('click', function () {
        const r = b.getAttribute('data-r'), i = R.riesgos.indexOf(r);
        if (i === -1) R.riesgos.push(r); else R.riesgos.splice(i, 1);
        b.classList.toggle('si', i === -1);
        $('detalle-otros').hidden = R.riesgos.indexOf('Otros') === -1;
      });
    });
    $('detalle-otros').hidden = R.riesgos.indexOf('Otros') === -1;
  }
  function pintarClasificaciones() {
    $('clasificaciones').innerHTML = I.clasificaciones.map(function (c) {
      return '<button type="button" class="opcion' + (R.clas === c ? ' si' : '') + '" data-c="' + esc(c) + '">' + esc(c) + '<small>' + esc(DESC_CLAS[c] || '') + '</small></button>';
    }).join('');
    $('clasificaciones').querySelectorAll('[data-c]').forEach(function (b) {
      b.addEventListener('click', function () {
        R.clas = b.getAttribute('data-c');
        $('clasificaciones').querySelectorAll('.opcion').forEach(function (x) { x.classList.toggle('si', x === b); });
        $('detalle-clas').hidden = R.clas !== 'Otra Clasificación';
      });
    });
    $('detalle-clas').hidden = R.clas !== 'Otra Clasificación';
  }
  $('a3').addEventListener('click', function () {
    R.otros = $('detalle-otros').value.trim(); R.detalleClas = $('detalle-clas').value.trim();
    if (!R.fotos.length) return alert('Falta al menos una foto de evidencia.');
    if (!R.riesgos.length) return alert('Elige al menos un riesgo.');
    if (R.riesgos.indexOf('Otros') !== -1 && !R.otros) return alert('Escribe cuáles «Otros» riesgos.');
    if (!R.clas) return alert('Elige la clasificación.');
    if (R.clas === 'Otra Clasificación' && !R.detalleClas) return alert('Escribe cuál clasificación.');
    $('trabajador').value = R.trabajador || '';
    const sel = $('contratista');
    const hay = Array.from(sel.options).some(function (o) { return o.value === R.empresa; });
    sel.value = R.empresa ? (hay ? R.empresa : '__otra') : '';
    $('contratista-otra').value = R.empresa && !hay ? R.empresa : '';
    $('contratista-otra').hidden = sel.value !== '__otra';
    irPaso(3);
  });

  // ------------------------------------------------------------ 3 · infractor
  $('contratista').addEventListener('change', function () { $('contratista-otra').hidden = this.value !== '__otra'; });
  $('a4').addEventListener('click', function () {
    R.trabajador = $('trabajador').value.trim();
    R.contratista = $('contratista').value === '__otra' ? $('contratista-otra').value.trim() : $('contratista').value;
    R.observacion = $('observacion').value.trim();
    if (!R.trabajador) return alert('Escribe el nombre del trabajador.');
    if (!R.contratista) return alert('Elige la contratista.');
    irPaso(4);
  });

  // ------------------------------------------------------------ 4 · resumen y guardar
  function filas() {
    const f = [
      ['Obra', I.obra],
      ['Fecha', new Date().toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })],
      ['Código QR', R.codigo || (R.negoCredencial ? 'Se negó a dar su credencial' : 'Sin QR')],
      ['Trabajador', R.trabajador],
      ['Contratista', R.contratista],
      ['Clasificación', R.clas + (R.detalleClas ? ' · ' + R.detalleClas : '')],
      ['Riesgos', R.riesgos.join(', ') + (R.otros ? ' · ' + R.otros : '')],
      ['Reporta', I.usuario + ' (' + I.rolTexto + ')']
    ];
    if (R.observacion) f.push(['Observación', R.observacion]);
    return f;
  }
  function pintarResumen() {
    $('msg-guardar').innerHTML = '';
    $('resumen').innerHTML = '<h2>Revisa antes de guardar</h2><table class="resumen-tabla">' +
      filas().map(function (x) { return '<tr><th>' + esc(x[0]) + '</th><td>' + esc(x[1]) + '</td></tr>'; }).join('') + '</table>' +
      (R.negoCredencial ? '<div class="aviso alerta">⚠ Se anotará que <b>se negó a dar su credencial</b>.</div>' : '') +
      '<div class="mini-fotos">' + R.fotos.map(function (f) { return '<img src="' + f.url + '" alt="">'; }).join('') + '</div>';
  }
  let resultado = null;
  $('guardar').addEventListener('click', async function () {
    const b = this;
    b.disabled = true; b.textContent = 'Guardando…';
    $('msg-guardar').innerHTML = '<div class="aviso alerta">⏳ Armando el PDF y guardando en la bitácora… no cierres la app.</div>';
    try {
      const pdf = armarPDF();
      const r = await App.api('guardarReporte', {
        obra: I.obra, codigo: R.codigo, negoCredencial: R.negoCredencial, trabajador: R.trabajador, contratista: R.contratista,
        clasificacion: R.clas, detalleClasificacion: R.detalleClas, riesgos: R.riesgos, detalleOtros: R.otros, observacion: R.observacion,
        fotos: R.fotos.map(function (f) { return f.url; }), pdf: pdf
      });
      if (!r.ok) throw new Error(r.error);
      resultado = r;
      $('listo-texto').textContent = 'Quedó en la bitácora de seguridad de ' + I.obra + ' (pestaña ' + r.id.replace('!', ', renglón ') + ') y el PDF en la carpeta de la app en Drive.';
      $('ver-pdf').href = r.pdf;
      prepararPonche();
      irPaso(5);
    } catch (e) {
      $('msg-guardar').innerHTML = '<div class="aviso error">⚠ No se guardó: ' + esc(e.message) + '. Tus datos siguen aquí; vuelve a tocar «Guardar».</div>';
    } finally { b.disabled = false; b.textContent = '💾 Guardar reporte'; }
  });
  $('compartir').addEventListener('click', function () {
    if (!resultado) return;
    const t = '🦺 Reporte de seguridad · ' + I.obra + '\n' + R.trabajador + ' (' + R.contratista + ')\n' + R.clas + ' · ' + R.riesgos.join(', ') + '\n📄 ' + resultado.pdf;
    window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank');
  });
  $('nuevo').addEventListener('click', function () {
    R = nuevo(); resultado = null; P = null;
    ['pon-lugar', 'pon-actividad', 'pon-descripcion', 'pon-norma', 'pon-medidas', 'pon-recom'].forEach(function (id) { $(id).value = ''; delete $(id).dataset.editado; });
    $('observacion').value = ''; $('detalle-otros').value = ''; $('detalle-clas').value = '';
    pintarFotos(); pintarRiesgos(); pintarClasificaciones();
    irPaso(1);
  });
  pintarFotos();

  // ------------------------------------------------------------ 5 · ¿Amerita ponche?
  /* La clasificación sugiere la respuesta (⚙ Configuración › Seguridad); el supervisor decide.
   * Con permiso del coordinador (o si es ADMIN / coordinador) el ponche queda firme;
   * sin permiso queda «por autorizar» en la bandeja del coordinador. */
  const ORDINAL = { 1: '1er', 2: '2º', 3: '3er' };
  let P = null;   /* datos del ponche: guía, medidas, ponches anteriores, permiso */
  function prepararSeguimiento() {
    $('seg-si').classList.remove('si'); $('seg-no').classList.remove('si');
    $('seg-form').hidden = true; $('seg-res').innerHTML = ''; $('seg-caja').hidden = false;
    const c = (I.contactos || {})[R.contratista] || {};
    $('seg-asunto').value = R.clas + ': ' + R.riesgos.join(', ') + (R.otros ? ' (' + R.otros + ')' : '') + (R.observacion ? '. ' + R.observacion : '');
    $('seg-resp').value = c.responsable || ''; $('seg-correo').value = c.correo || ''; $('seg-wa').value = c.whatsapp ? c.whatsapp.replace(/^52/, '') : '';
    $('seg-nota').textContent = c.correo || c.whatsapp ? 'Datos de ⚙ Empresas. Los puedes cambiar sólo para este envío.' : '⚠ ' + R.contratista + ' no tiene correo ni WhatsApp en ⚙ Empresas: escríbelos aquí o copia la liga para mandarla a mano.';
  }
  $('seg-no').addEventListener('click', function () { $('seg-no').classList.add('si'); $('seg-si').classList.remove('si'); $('seg-form').hidden = true; $('seg-res').innerHTML = '<div class="aviso alerta">Sin seguimiento.</div>'; });
  $('seg-si').addEventListener('click', function () { $('seg-si').classList.add('si'); $('seg-no').classList.remove('si'); $('seg-form').hidden = false; $('seg-res').innerHTML = ''; });
  $('seg-enviar').addEventListener('click', async function () {
    const b = this;
    if (!$('seg-asunto').value.trim()) return alert('Escribe qué tiene que corregir.');
    b.disabled = true; b.textContent = 'Enviando…';
    try {
      const r = await App.api('crearSeguimiento', { obra: I.obra, reporte: resultado.id, asunto: $('seg-asunto').value.trim(),
        responsable: $('seg-resp').value.trim(), correo: $('seg-correo').value.trim(), whatsapp: $('seg-wa').value.trim() });
      if (!r.ok) throw new Error(r.error);
      $('seg-form').hidden = true;
      $('seg-res').innerHTML = '<div class="aviso ok">✅ Seguimiento enviado' + (r.correo ? ': le llegó un correo a ' + esc(r.correo) : '') + '.</div>' +
        '<div class="botones col">' + (r.whatsapp ? '<a class="boton" target="_blank" rel="noopener" href="https://wa.me/' + esc(r.whatsapp) + '?text=' + encodeURIComponent(r.mensaje) + '">📲 Mandar por WhatsApp</a>' : '') +
        '<button class="boton secundario" type="button" id="seg-copiar">📋 Copiar la liga</button></div>';
      $('seg-copiar').addEventListener('click', function () {
        const t = r.mensaje;
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { $('seg-copiar').textContent = '✅ Copiado'; })
          .catch(function () { prompt('Copia el mensaje:', r.liga); });
      });
      if (!r.correo && !r.whatsapp) $('seg-res').insertAdjacentHTML('afterbegin', '<div class="aviso alerta">⚠ No hay correo ni WhatsApp: copia la liga y mándala a mano.</div>');
    } catch (e) { $('seg-res').innerHTML = '<div class="aviso error">⚠ ' + esc(e.message) + '</div>'; }
    finally { b.disabled = false; b.textContent = '📨 Enviar seguimiento'; }
  });

  function prepararPonche() {
    const sugiere = (I.ponchePorClas || []).indexOf(R.clas) !== -1;
    $('pon-si').classList.toggle('si', sugiere);
    $('pon-no').classList.toggle('si', !sugiere);
    $('pon-sugerencia').textContent = 'Por ser «' + R.clas + '», la app sugiere: ' + (sugiere ? 'SÍ amerita ponche.' : 'NO amerita ponche.') + ' Tú decides.';
    $('pon-form').hidden = true;
    $('listo-ponche').innerHTML = ''; $('ver-a2').hidden = true;
  }
  $('pon-no').addEventListener('click', function () {
    $('listo-ponche').innerHTML = '<div class="aviso alerta">Sin ponche: queda sólo el reporte.</div>';
    prepararSeguimiento();
    irPaso(6);
  });
  $('pon-si').addEventListener('click', async function () {
    $('pon-si').classList.add('si'); $('pon-no').classList.remove('si');
    $('pon-form').hidden = false;
    $('pon-permiso').innerHTML = '<p class="sub">Cargando la guía…</p>';
    try {
      const r = await App.api('datosPoncheReporte', { obra: I.obra, codigo: R.codigo, nombre: R.trabajador });
      if (!r.ok) throw new Error(r.error);
      P = r;
      pintarPonche();
    } catch (e) { $('pon-permiso').innerHTML = '<div class="aviso error">⚠ ' + esc(e.message) + '</div>'; }
  });
  function pintarPonche() {
    const pm = P.permiso;
    $('pon-permiso').innerHTML = pm.directo
      ? '<div class="aviso ok">✅ ' + (pm.siempre ? 'Puedes ponchar directo.' : 'Tienes permiso del coordinador hasta el ' + esc(fechaCorta(pm.hasta)) + '.') + ' El ponche queda firme al guardar.</div>'
      : '<div class="aviso alerta">⏳ No tienes permiso para ponchar sin autorización: el ponche le llega al coordinador para que lo autorice. Mientras, no cuenta en la puerta.</div>';
    const prev = P.previos.filter(function (x) { return !/por autorizar/i.test(x.estatus); });
    $('pon-historial').innerHTML = '<div class="aviso ' + (prev.length >= 2 ? 'error' : prev.length ? 'alerta' : 'ok') + ' historial"><b>' + esc(R.trabajador) + '</b>: ' +
      prev.length + (prev.length === 1 ? ' ponche' : ' ponches') + ' antes en esta obra.' +
      (P.previos.length ? '<br>' + P.previos.map(function (x) { return esc((ORDINAL[x.numero] || x.numero) + ' · ' + fechaCorta(x.fecha) + ' · ' + x.infraccion + (/por autorizar/i.test(x.estatus) ? ' (por autorizar)' : '')); }).join('<br>') : '') + '</div>';
    const grupos = ['Leve', 'Grave', 'Muy grave'];
    $('pon-falta').innerHTML = '<option value="">Elige la falta…</option>' + grupos.map(function (g) {
      const items = P.infracciones.filter(function (x) { return x.nivel.toLowerCase() === g.toLowerCase(); });
      return items.length ? '<optgroup label="' + g + '">' + items.map(function (x) { return '<option value="' + esc(x.texto) + '" data-nivel="' + g + '">' + esc(x.texto) + '</option>'; }).join('') + '</optgroup>' : '';
    }).join('');
    P.numero = 0;
    pintarNumero();
    if (!$('pon-descripcion').value) $('pon-descripcion').value = [R.riesgos.join(', ') + (R.otros ? ' (' + R.otros + ')' : ''), R.observacion].filter(Boolean).join('. ');
  }
  function nivel() { const o = $('pon-falta').selectedOptions[0]; return o ? o.getAttribute('data-nivel') || '' : ''; }
  function pintarNumero() {
    $('pon-numero').innerHTML = [1, 2, 3].map(function (n) {
      return '<button type="button" class="opcion nivel-' + n + (P.numero === n ? ' si' : '') + '" data-num="' + n + '">' + ORDINAL[n] + '<small>' + esc((P.medidas[n] || '').replace(/\s*\(.*\)$/, '')) + '</small></button>';
    }).join('');
    $('pon-numero').querySelectorAll('[data-num]').forEach(function (b) {
      b.addEventListener('click', function () { P.numero = Number(b.getAttribute('data-num')); P.tocoNumero = true; pintarNumero(); ponerMedida(); });
    });
  }
  function ponerMedida() { if (!$('pon-medidas').dataset.editado) $('pon-medidas').value = P.medidas[P.numero] || ''; }
  $('pon-medidas').addEventListener('input', function () { this.dataset.editado = '1'; });
  $('pon-falta').addEventListener('change', function () {
    const nv = nivel();
    if (!nv) { $('pon-recomienda').textContent = ''; return; }
    const porFalta = { 'leve': 1, 'grave': 2, 'muy grave': 3 }[nv.toLowerCase()] || 1;
    const prev = P.previos.filter(function (x) { return !/por autorizar/i.test(x.estatus); }).length;
    const sug = Math.min(3, Math.max(porFalta, prev + 1));
    $('pon-recomienda').innerHTML = 'Se recomienda: <b>' + ORDINAL[sug] + ' ponche</b> (falta ' + esc(nv.toLowerCase()) + (sug > porFalta ? ' y por reincidencia' : '') + ').';
    if (!P.tocoNumero) { P.numero = sug; pintarNumero(); ponerMedida(); }
  });
  $('pon-guardar').addEventListener('click', async function () {
    const b = this;
    if (!$('pon-falta').value) return alert('Elige la falta de la guía.');
    if (!P.numero) return alert('Elige el número de ponche.');
    const datos = {
      obra: I.obra, reporte: resultado.id, codigo: R.codigo, nombre: R.trabajador, empresa: R.contratista,
      infraccion: $('pon-falta').value, clasificacion: nivel(), numero: P.numero,
      lugar: $('pon-lugar').value.trim(), tipoActividad: $('pon-actividad').value.trim(), descripcion: $('pon-descripcion').value.trim(),
      norma: $('pon-norma').value.trim(), medidas: $('pon-medidas').value.trim(), recomendaciones: $('pon-recom').value.trim()
    };
    b.disabled = true; b.textContent = 'Guardando…';
    $('msg-ponche').innerHTML = '<div class="aviso alerta">⏳ Armando el Formato A2 y guardando…</div>';
    try {
      datos.pdf = armarA2(datos);
      const r = await App.api('poncheDesdeReporte', datos);
      if (!r.ok) throw new Error(r.error);
      $('listo-ponche').innerHTML = r.estatus === 'Vigente'
        ? '<div class="aviso ok">🔨 ' + ORDINAL[P.numero] + ' ponche a <b>' + esc(R.trabajador) + '</b> (' + esc(r.folio) + '). Ya cuenta en la puerta y se avisó al coordinador.</div>'
        : '<div class="aviso alerta">⏳ ' + ORDINAL[P.numero] + ' ponche a <b>' + esc(R.trabajador) + '</b> (' + esc(r.folio) + ') <b>por autorizar</b>: le llegó al coordinador.</div>';
      $('ver-a2').hidden = !r.a2; if (r.a2) $('ver-a2').href = r.a2;
      $('msg-ponche').innerHTML = '';
      prepararSeguimiento();
      irPaso(6);
    } catch (e) {
      $('msg-ponche').innerHTML = '<div class="aviso error">⚠ No se guardó el ponche: ' + esc(e.message) + '. Vuelve a intentar.</div>';
    } finally { b.disabled = false; b.textContent = '🔨 Guardar ponche'; }
  });
  function fechaCorta(iso) { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(iso || ''); }

  /* Formato A2 (Anexo A2) en PDF, para firmas: supervisor, trabajador y contratista */
  function armarA2(x) {
    const jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) throw new Error('No cargó el armador de PDF (revisa tu internet)');
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const logo = I.logoObra || logoApp;
    if (logo) { try { const p = doc.getImageProperties(logo); doc.addImage(logo, 14, 10, Math.min(40, 16 * p.width / p.height), 16); } catch (e) {} }
    doc.setTextColor('#16325c').setFontSize(14).text('Formato de reporte de incidentes y ponchado', W - 14, 15, { align: 'right' });
    doc.setFontSize(9).setTextColor('#4b5563').text('Anexo A2 · Obra ' + I.obra + ' · Reporte ' + resultado.id, W - 14, 21, { align: 'right' });
    const linea = function (t) { return t || '_______________________________________________'; };
    const marca = function (si, t) { return (si ? '[X] ' : '[  ] ') + t; };
    const nv = String(x.clasificacion || '').toLowerCase();
    const tabla = function (titulo, filas, y) {
      doc.autoTable({ startY: y, head: [[titulo, '']], body: filas, theme: 'grid', headStyles: { fillColor: [22, 50, 92] },
        columnStyles: { 0: { cellWidth: 62, fontStyle: 'bold' } }, styles: { fontSize: 9, cellPadding: 2 } });
      return doc.lastAutoTable.finalY + 4;
    };
    let y = 30;
    y = tabla('Datos generales', [
      ['Fecha y hora del incidente', new Date().toLocaleString('es-MX')],
      ['Lugar / frente de trabajo', linea(x.lugar)],
      ['Nombre del trabajador', x.nombre],
      ['Número de gafete o credencial', x.codigo || linea('')],
      ['Empresa o contratista', x.empresa]
    ], y);
    y = tabla('Descripción de la incidencia', [
      ['Tipo de actividad', linea(x.tipoActividad)],
      ['Descripción de los hechos', x.descripcion || linea('')],
      ['Clasificación del reporte', R.clas + ' · Riesgos: ' + R.riesgos.join(', ')],
      ['Falta según la guía (Anexo A4)', x.infraccion],
      ['Norma o procedimiento infringido', linea(x.norma)],
      ['Clasificación de la falta', [marca(nv === 'leve', 'Leve'), marca(nv === 'grave', 'Grave'), marca(nv === 'muy grave', 'Muy grave')].join('    ')],
      ['Número de perforación aplicada', [1, 2, 3].map(function (n) { return marca(x.numero === n, ORDINAL[n]); }).join('    ') + '   ' + (P.medidas[x.numero] || '')]
    ], y);
    y = tabla('Medidas inmediatas y correctivas', [
      ['Acciones tomadas en el momento', x.medidas || linea('')],
      ['Recomendaciones o medidas preventivas', x.recomendaciones || linea('')]
    ], y);
    if (R.fotos[0]) {
      const f = R.fotos[0], h = Math.min(34, 70 * f.h / f.w), w = h * f.w / f.h;
      if (y + h + 62 > H) { doc.addPage(); y = 16; }
      doc.setFontSize(10).setTextColor('#16325c').text('Evidencia fotográfica', 14, y + 3);
      doc.addImage(f.url, 'JPEG', 14, y + 5, w, h); y += h + 10;
    }
    if (y > H - 52) { doc.addPage(); y = 16; }
    doc.setFontSize(10).setTextColor('#16325c').text('Descargo del trabajador', 14, y + 3);
    doc.setDrawColor('#9aa3af');
    for (let i = 0; i < 2; i++) doc.line(14, y + 11 + i * 7, W - 14, y + 11 + i * 7);
    y += 34;
    const col = (W - 28) / 3;
    [['Supervisor(a) de Seguridad', I.usuario], ['Trabajador afectado', x.nombre], ['Representante del contratista', x.empresa]].forEach(function (f, i) {
      const cx = 14 + i * col;
      doc.line(cx + 4, y, cx + col - 4, y);
      doc.setFontSize(8).setTextColor('#111827').text(f[0], cx + col / 2, y + 4, { align: 'center' });
      doc.setTextColor('#4b5563').text(String(f[1] || ''), cx + col / 2, y + 8, { align: 'center', maxWidth: col - 6 });
    });
    doc.setFontSize(8).setTextColor('#9aa3af').text('Este documento debe archivarse y remitirse al contratista y a la Comisión de Seguridad para su seguimiento.', 14, H - 8);
    return 'data:application/pdf;base64,' + doc.output('datauristring').split(',')[1];
  }

  // ------------------------------------------------------------ PDF
  function armarPDF() {
    const jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) throw new Error('No cargó el armador de PDF (revisa tu internet)');
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    let x = 14;
    [logoApp, I.logoObra].forEach(function (l) {
      if (!l) return;
      try { const p = doc.getImageProperties(l); const h = 14, w = Math.min(40, h * p.width / p.height); doc.addImage(l, x, 10, w, h); x += w + 4; } catch (e) {}
    });
    doc.setTextColor('#16325c').setFontSize(15).text('Reporte de seguridad e higiene', W - 14, 16, { align: 'right' });
    doc.setFontSize(10).setTextColor('#4b5563').text(I.obra + ' · ' + new Date().toLocaleString('es-MX'), W - 14, 22, { align: 'right' });
    doc.autoTable({ startY: 30, head: [['Concepto', 'Información']], body: filas(), theme: 'grid',
      headStyles: { fillColor: [22, 50, 92] }, columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } }, styles: { fontSize: 10 } });
    let y = (doc.lastAutoTable.finalY || 30) + 10;
    doc.setFontSize(12).setTextColor('#16325c').text('Evidencia fotográfica', 14, y); y += 4;
    const ancho = (W - 28 - 6) / 2;
    let col = 0, altoFila = 0;
    R.fotos.forEach(function (f) {
      const h = Math.min(ancho * f.h / f.w, 95);
      const w = h * f.w / f.h;
      if (y + h > H - 12) { doc.addPage(); y = 14; col = 0; altoFila = 0; }
      doc.addImage(f.url, 'JPEG', 14 + col * (ancho + 6), y, w, h);
      altoFila = Math.max(altoFila, h);
      col++;
      if (col === 2) { col = 0; y += altoFila + 6; altoFila = 0; }
    });
    doc.setFontSize(8).setTextColor('#9aa3af').text('Generado con la app de reportes · ' + I.nombreSistema, 14, H - 6);
    return 'data:application/pdf;base64,' + doc.output('datauristring').split(',')[1];
  }
  function imagenADato(src) {
    return new Promise(function (ok) {
      const img = new Image();
      img.onload = function () { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); try { ok(c.toDataURL('image/png')); } catch (e) { ok(''); } };
      img.onerror = function () { ok(''); };
      img.src = src;
    });
  }
})();
