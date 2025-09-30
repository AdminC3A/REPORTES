document.addEventListener("DOMContentLoaded", () => {
  const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
  const enviarCorreoBtn = document.getElementById("enviar-correo");
  const enviarAmbosBtn = document.getElementById("enviar-ambos");
  const finalizarBtn = document.getElementById("finalizar");

  // ⚙️ Configuración de EmailJS (¡COMPLETA!)
  const SERVICE_ID = "service_m1kpjzd";   // ✅ ¡ACTUALIZADO!
  const TEMPLATE_ID = "template_0vvcv8r";   // ✅ ¡ACTUALIZADO!
  const PUBLIC_KEY = "AV0u6cTpjcpnjm3xKO"; // ✅ ¡ACTUALIZADO!

  // ✅ Información de contacto
  const DESTINATARIO_PRINCIPAL = "ctasupervisionnom031@gmail.com";
  const DESTINATARIO_COPIA = "supervision@casatresaguas.com";
  const NUMERO_WHATSAPP = "526241161190";

  /**
   * Crea dinámicamente el HTML completo del reporte para usarlo en el PDF.
   * @param {object} reporte - El objeto del reporte desde localStorage.
   * @returns {HTMLElement} - Un elemento div con todo el contenido del reporte.
   */
  function crearContenidoParaPDF(reporte) {
    const container = document.createElement("div");

    let html = `<h1>Reporte de Incidencias de Seguridad</h1>`;
    html += `<p><strong>Fecha de visualización:</strong> ${new Date().toLocaleString()}</p>`;

    if (reporte.modulo1?.codigoQR) {
      html += `<h3>📌 Código QR</h3><p>${reporte.modulo1.codigoQR}</p>`;
    }
    if (reporte.modulo2) {
      html += `<h3>⚠️ Riesgos Detectados</h3>`;
      html += `<p><strong>Riesgos:</strong> ${reporte.modulo2.riesgos?.join(", ") || "N/A"}</p>`;
      if (reporte.modulo2.detalleOtros) html += `<p><strong>Detalle Otros:</strong> ${reporte.modulo2.detalleOtros}</p>`;
      html += `<p><strong>Clasificación:</strong> ${reporte.modulo2.clasificacionSeleccionada || "N/A"}</p>`;
      if (reporte.modulo2.detalleClasificacion) html += `<p><strong>Detalle Clasificación:</strong> ${reporte.modulo2.detalleClasificacion}</p>`;
    }
    if (reporte.modulo3) {
      html += `<h3>🧑‍💼 Rol de quien Reporta</h3><p><strong>Rol:</strong> ${reporte.modulo3.rolSeleccionado}</p>`;
    }

    const todasLasImagenes = reporte.modulo2?.imagenes || [];
    if (todasLasImagenes.length > 0) {
      html += `<h3>🖼️ Evidencia Fotográfica</h3>`;
      html += `<div style="display: flex; flex-wrap: wrap; gap: 10px;">`;
      todasLasImagenes.forEach(imgBase64 => {
        html += `
          <div style="width: 220px; height: 160px; border: 1px solid #ccc; padding: 5px; box-sizing: border-box;">
            <img src="${imgBase64}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          </div>`;
      });
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

  // Enviar por WhatsApp
  enviarWhatsAppBtn.addEventListener("click", () => {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    let mensajeTexto = "Hola, se ha generado un nuevo reporte de seguridad.";
    if (reporte) {
        const qr = reporte.modulo1?.codigoQR || "N/A";
        const riesgos = reporte.modulo2?.riesgos?.join(', ') || "Ninguno";
        mensajeTexto = `*Reporte de Seguridad*\n\n*Código QR:* ${qr}\n*Riesgos Detectados:* ${riesgos}\n\nSe ha generado un nuevo reporte.`;
    }
    const mensaje = encodeURIComponent(mensajeTexto);
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
    window.open(url, "_blank");
  });

  // Enviar por Correo
  enviarCorreoBtn.addEventListener("click", async () => {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    if (!reporte) return alert("No hay reporte para enviar.");
    
    setEstadoCarga(true);

    try {
      const elementoPDF = crearContenidoParaPDF(reporte);
      const pdfBase64 = await html2pdf().from(elementoPDF).set({
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).output('datauristring');

      const templateParams = {
        to_email: DESTINATARIO_PRINCIPAL,
        cc_email: DESTINATARIO_COPIA,
        subject: `Reporte de Seguridad - QR ${reporte.modulo1?.codigoQR || ''}`,
        message: "Se adjunta el PDF del reporte generado.",
        attachment: pdfBase64,
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      alert("Correo enviado exitosamente ✅");
    } catch (error) {
      console.error("Error al enviar email:", error);
      alert("Error al enviar el correo ❌");
    } finally {
      setEstadoCarga(false);
    }
  });

  // Ambos
  enviarAmbosBtn.addEventListener("click", () => {
    enviarWhatsAppBtn.click();
    enviarCorreoBtn.click();
  });

  // Finalizar
  finalizarBtn.addEventListener("click", () => {
    const confirmacion = confirm("¿Estás seguro de que deseas finalizar? Se borrará el reporte actual.");
    if (confirmacion) {
        localStorage.removeItem("reporte");
        window.location.href = "../modulo1-qr/";
    }
  });
});
