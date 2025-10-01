document.addEventListener("DOMContentLoaded", () => {
  const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
  const enviarCorreoBtn = document.getElementById("enviar-correo");
  const enviarAmbosBtn = document.getElementById("enviar-ambos");
  const finalizarBtn = document.getElementById("finalizar");

  // --- Configuración de EmailJS ---
  const SERVICE_ID = "service_m1kpjzd";
  const TEMPLATE_ID = "template_0vvcv8r";
  const PUBLIC_KEY = "AV0u6cTpjcpnjm3xKO";

  // --- Información de Contacto ---
  const DESTINATARIO_PRINCIPAL = "ctasupervisionnom031@gmail.com";
  const DESTINATARIO_COPIA = "supervision@casatresguas.com";
  const NUMERO_WHATSAPP = "526241161190";

  /**
   * COPIADO DE MÓDULO 4: Busca el nombre del portador de una llave.
   * @param {string} llave - La llave/ID a buscar.
   * @param {object} rolesData - El objeto JSON con todos los roles.
   * @returns {string|null} - El nombre del portador o null si no se encuentra.
   */
  function buscarPortadorPorLlave(llave, rolesData) {
    const llaveLimpia = llave.trim().toLowerCase();
    for (const categoria in rolesData) {
      const supervisores = rolesData[categoria].supervisores;
      for (const nombre in supervisores) {
        const llavesDelSupervisor = supervisores[nombre];
        if (Array.isArray(llavesDelSupervisor) && llavesDelSupervisor.length > 0) {
          const primeraLlave = llavesDelSupervisor[0];
          if (primeraLlave.trim().toLowerCase() === llaveLimpia) {
            return nombre;
          }
        }
      }
    }
    return null; // Devuelve null si no encuentra a nadie
  }

  function crearContenidoParaPDF(reporte) {
    // ... (Esta función no necesita cambios)
    const container = document.createElement("div");
    let html = `<h1>Reporte de Incidencias de Seguridad</h1><p><strong>Fecha de visualización:</strong> ${new Date().toLocaleString()}</p>`;
    if (reporte.modulo1?.codigoQR) { html += `<h3>📌 Código QR</h3><p>${reporte.modulo1.codigoQR}</p>`; }
    if (reporte.modulo2) { html += `<h3>⚠️ Riesgos Detectados</h3><p><strong>Riesgos:</strong> ${reporte.modulo2.riesgos?.join(", ") || "N/A"}</p>`; }
    if (reporte.modulo3) { html += `<h3>🧑‍💼 Rol de quien Reporta</h3><p><strong>Rol:</strong> ${reporte.modulo3.rolSeleccionado}</p>`; }
    const todasLasImagenes = reporte.modulo2?.imagenes || [];
    if (todasLasImagenes.length > 0) {
      html += `<h3>🖼️ Evidencia Fotográfica</h3><div style="display: flex; flex-wrap: wrap; gap: 10px;">`;
      todasLasImagenes.forEach(imgBase64 => { html += `<div style="width: 220px; height: 160px; border: 1px solid #ccc; padding: 5px; box-sizing: border-box;"><img src="${imgBase64}" style="max-width: 100%; max-height: 100%; object-fit: contain;" /></div>`; });
      html += `</div>`;
    }
    container.innerHTML = html;
    return container;
  }

  function setEstadoCarga(cargando) {
    const botones = [enviarWhatsAppBtn, enviarCorreoBtn, enviarAmbosBtn, finalizarBtn];
    if (cargando) {
      botones.forEach(btn => btn.disabled = true);
      enviarCorreoBtn.textContent = "Enviando...";
    } else {
      botones.forEach(btn => btn.disabled = false);
      enviarCorreoBtn.textContent = "Enviar por Correo";
    }
  }

  enviarWhatsAppBtn.addEventListener("click", () => {
    // ... (Esta función no necesita cambios)
  });

  // ✅ SECCIÓN CORREGIDA Y MEJORADA
  enviarCorreoBtn.addEventListener("click", async () => {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    if (!reporte) return alert("No hay reporte para enviar.");
    
    setEstadoCarga(true);

    try {
      // 1. Cargamos el archivo roles.json para poder buscar el nombre
      const response = await fetch('../../data/roles.json'); // Ajusta la ruta si es necesario
      if (!response.ok) throw new Error("No se pudo cargar el archivo de roles.");
      const rolesData = await response.json();

      // 2. Generamos el PDF
      const elementoPDF = crearContenidoParaPDF(reporte);
      const pdfBase64 = await html2pdf().from(elementoPDF).set({
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).output('datauristring');

      // 3. Determinamos QUIÉN reportó
      let nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
      if (reporte.modulo3?.llave) {
        const nombreEncontrado = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
        if (nombreEncontrado) {
          nombreDelReportante = nombreEncontrado; // ¡Usamos el nombre del portador!
        }
      }

      // 4. Construimos los parámetros para la plantilla
      const fechaActual = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
      const detallesParaMensaje = `Código QR: ${reporte.modulo1?.codigoQR || 'N/A'}\nRiesgos: ${reporte.modulo2?.riesgos?.join(", ") || "Ninguno"}`;
      
      const templateParams = {
        fecha: fechaActual,
        reportado_por: nombreDelReportante, // ✅ Usamos la variable con el nombre correcto
        message: detallesParaMensaje,
        to_email: DESTINATARIO_PRINCIPAL,
        cc_email: DESTINATARIO_COPIA,
        subject: `Reporte de Incidencias - ${reporte.modulo1?.codigoQR || ''}`,
        attachment: pdfBase64,
      };

      // 5. Enviamos el correo
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      alert("Correo enviado exitosamente ✅");

    } catch (error) {
      console.error("Error al enviar email:", error);
      alert("Error al enviar el correo. Revisa la consola para más detalles.");
    } finally {
      setEstadoCarga(false);
    }
  });

  enviarAmbosBtn.addEventListener("click", () => {
    enviarWhatsAppBtn.click();
    enviarCorreoBtn.click();
  });

  finalizarBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas finalizar? Se borrará el reporte actual.")) {
      localStorage.removeItem("reporte");
      window.location.href = "../modulo1-qr/";
    }
  });
});
