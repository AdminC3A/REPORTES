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
  const DESTINATARIO_PRINCIPAL = "ctaseguridadnom031@gmail.com";
  const DESTINATARIO_COPIA = "supervision@casatresguas.com";
  const NUMERO_WHATSAPP = "525549616817";

  function buscarPortadorPorLlave(llave, rolesData) {
    const llaveLimpia = llave.trim().toLowerCase();
    for (const categoria in rolesData) {
      const supervisores = rolesData[categoria].supervisores;
      for (const nombre in supervisores) {
        const llavesDelSupervisor = supervisores[nombre];
        if (Array.isArray(llavesDelSupervisor) && llavesDelSupervisor.length > 0) {
          if (llavesDelSupervisor[0].trim().toLowerCase() === llaveLimpia) return nombre;
        }
      }
    }
    return null;
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
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    let mensajeTexto = "Se ha generado un nuevo reporte de seguridad.";
    if (reporte) {
      const qr = reporte.modulo1?.codigoQR || "N/A";
      const riesgos = reporte.modulo2?.riesgos?.join(', ') || "Ninguno";
      mensajeTexto = `*Reporte de Seguridad Generado*\n\n*Código QR:* ${qr}\n*Riesgos Detectados:* ${riesgos}\n\nEl PDF completo con imágenes fue enviado al correo de supervisión.`;
    }
    const mensaje = encodeURIComponent(mensajeTexto);
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
    window.open(url, "_blank");
  });

  enviarCorreoBtn.addEventListener("click", async () => {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    if (!reporte) {
      alert("No hay reporte para enviar. Por favor, genera un reporte completo primero.");
      return;
    }
    
    setEstadoCarga(true);

    try {
      // ✅ RUTA CORREGIDA
      const response = await fetch('/data/roles.json');
      if (!response.ok) throw new Error("No se pudo cargar el archivo de roles.");
      const rolesData = await response.json();

      // ✅ MÉTODO DE PDF ROBUSTO (jsPDF + AutoTable)
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor("#0056b3");
      doc.text("Reporte de Incidencias de Seguridad", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      const tableRows = [];
      tableRows.push(["Fecha", new Date().toLocaleDateString('es-MX')]);
      if (reporte.modulo1?.codigoQR) tableRows.push(["Código QR", reporte.modulo1.codigoQR]);
      if (reporte.modulo2?.riesgos) tableRows.push(["Riesgos", reporte.modulo2.riesgos.join(", ")]); // Corregido "Riosgos"
      let nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
      if (reporte.modulo3?.llave) {
        const nombreEncontrado = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
        if (nombreEncontrado) nombreDelReportante = nombreEncontrado;
      }
      tableRows.push(["Reportado Por", nombreDelReportante]);
      doc.autoTable({ startY: 30, head: [['Concepto', 'Información']], body: tableRows, theme: 'grid', headStyles: { fillColor: [0, 86, 179] } });
      const todasLasImagenes = reporte.modulo2?.imagenes || [];
      if (todasLasImagenes.length > 0) {
        let finalY = doc.lastAutoTable.finalY || 30;
        doc.setFontSize(14);
        doc.text("Evidencia Fotográfica", 14, finalY + 15);
        let y = finalY + 20;
        todasLasImagenes.forEach(imgData => { if (y + 65 > doc.internal.pageSize.getHeight()) { doc.addPage(); y = 20; } doc.addImage(imgData, 'JPEG', 14, y, 80, 60); y += 65; });
      }
      const pdfBase64 = doc.output('datauristring');
      
      const fechaActual = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
      const detallesParaMensaje = `Código QR: ${reporte.modulo1?.codigoQR || 'N/A'}\nRiesgos: ${reporte.modulo2?.riesgos?.join(", ") || "Ninguno"}`;
      
      const templateParams = {
        fecha: fechaActual,
        reportado_por: nombreDelReportante,
        message: detallesParaMensaje,
        to_email: DESTINATARIO_PRINCIPAL,
        cc_email: DESTINATARIO_COPIA,
        subject: `Reporte de Incidencias - ${reporte.modulo1?.codigoQR || ''}`,
        attachment: pdfBase64,
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      alert("Correo con PDF adjunto enviado exitosamente ✅");

    } catch (error) {
      console.error("Error al enviar email:", error);
      alert("Error al enviar el correo. Revisa la consola para más detalles.");
    } finally {
      setEstadoCarga(false);
    }
  });

  enviarAmbosBtn.addEventListener("click", () => {
    enviarCorreoBtn.click();
    setTimeout(() => {
        enviarWhatsAppBtn.click();
    }, 500);
  });

  finalizarBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas finalizar? Se borrará el reporte actual.")) {
      localStorage.removeItem("reporte");
      window.location.href = "../modulo1-qr/";
    }
  });
});
