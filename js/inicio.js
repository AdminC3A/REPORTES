// Entrada: mismas llaves de NOMINAS 2027. Si ya hay sesión en este teléfono, pasa directo al reporte.
(function () {
  const $ = function (id) { return document.getElementById(id); };
  if (App.sesion()) { location.href = 'reporte/index.html'; return; }
  async function entrar() {
    const acceso = $('acceso').value.trim(), codigo = $('codigo').value.trim();
    if (!acceso || !codigo) { aviso('Escribe tu usuario y tu código.'); return; }
    $('entrar').disabled = true; $('entrar').textContent = 'Entrando…';
    try {
      const r = await App.api('login', { acceso: acceso, codigo: codigo });
      if (!r.ok) throw new Error(r.error);
      if (!(r.modulos || []).some(function (m) { return m.id === 'reportes'; })) throw new Error('Tu usuario no tiene permiso para Reportes de seguridad. Pídelo al administrador (⚙ Configuración › Permisos).');
      App.guardarSesion(r.token, r.sesion);
      location.href = 'reporte/index.html';
    } catch (e) { aviso(e.message); $('entrar').disabled = false; $('entrar').textContent = 'Entrar'; }
  }
  function aviso(t) { $('msg').innerHTML = '<div class="aviso error">' + App.esc(t) + '</div>'; }
  $('entrar').addEventListener('click', entrar);
  $('codigo').addEventListener('keydown', function (e) { if (e.key === 'Enter') entrar(); });
})();
