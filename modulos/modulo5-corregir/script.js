document.addEventListener("DOMContentLoaded", async () => {
  const enviarGoogleSheetBtn = document.getElementById("enviar-google-sheet");
  const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
  const enviarCorreoBtn = document.getElementById("enviar-correo");
  const finalizarBtn = document.getElementById("finalizar");
  const resumenContainer = document.getElementById("reporte-resumen");

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyh0dZzDxEfbcW0teG9rZ8kTIF4gGxhUb1XvRwbpRRjY3pzC4RnVqCOLcf-gIxgz35gyA/exec"; // 👈 PEGA TU URL DE APPS SCRIPT
  const SERVICE_ID = "service_m1kpjzd";
  const TEMPLATE_ID = "template_0vvcv8r";
  const PUBLIC_KEY = "AV0u6cTpjcpnjm3xKO";
  const DESTINATARIO_PRINCIPAL = "ctasupervisionnom031@gmail.com";
  const DESTINATARIO_COPIA = "supervision@casatresguas.com";
  const NUMERO_WHATSAPP = "5215549616817";

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

  function cargarResumenVisual() {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    if (!reporte) {
      resumenContainer.innerHTML = "<h3>No se encontró reporte.</h3>";
      return;
    }
    let html = `
      <h3>Resumen del Reporte</h3>
      <p><strong>QR:</strong> ${reporte.modulo1?.codigoQR || 'N/A'}</p>
      <p><strong>Riesgos:</strong> ${reporte.modulo2?.riesgos?.join(', ') || 'N/A'}</p>
      <p><strong>Clasificación:</strong> ${reporte.modulo2?.clasificacionSeleccionada || 'N/A'}</p>
      <p><strong>Rol:</strong> ${reporte.modulo3?.rolSeleccionado || 'N/A'}</p>
    `;
    resumenContainer.innerHTML = html;
  }

  function setEstadoCarga(cargando, tipo) {
    const botones = [enviarGoogleSheetBtn, enviarWhatsAppBtn, enviarCorreoBtn, finalizarBtn];
    botones.forEach(btn => btn.disabled = cargando);
    if (tipo === 'correo') {
      enviarCorreoBtn.textContent = cargando ? "Enviando Correo..." : "Enviar por Correo";
    } else if (tipo === 'sheet') {
      enviarGoogleSheetBtn.textContent = cargando ? "Registrando..." : "📊 Registrar en Bitácora";
    }
  }

  async function enviarAGoogleSheet() {
    setEstadoCarga(true, 'sheet');
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");

      const response = await fetch('/data/roles.json');
      const rolesData = await response.json();

      let reportadoPorTexto;
      // ✅ LÓGICA ACTUALIZADA PARA LA COLUMNA "REPORTA"
      if (reporte.modulo3?.rolSeleccionado === "Externo") {
        const nombre = reporte.modulo3.nombreExterno || "Externo";
        const telefono = reporte.modulo3.telefonoExterno || "Sin teléfono";
        reportadoPorTexto = `${nombre} (${telefono})`;
      } else {
        // Lógica para roles internos
        let nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
        if (reporte.modulo3?.llave) {
          const nombreEncontrado = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
          if (nombreEncontrado) nombreDelReportante = nombreEncontrado;
        }
        reportadoPorTexto = nombreDelReportante;
      }

      const datosParaSheet = {
        codigoQR: reporte.modulo1?.codigoQR,
        riesgos: reporte.modulo2?.riesgos?.join(', '),
        detalleOtros: reporte.modulo2?.detalleOtros,
        clasificacion: reporte.modulo2?.clasificacionSeleccionada,
        detalleClasificacion: reporte.modulo2?.detalleClasificacion,
        reportadoPor: reportadoPorTexto, // Se usa la nueva variable
        infractor: reporte.modulo3?.infractor || "N/A",
        compania: reporte.modulo3?.compania || "N/A",
        numImagenes: reporte.modulo2?.imagenes?.length || 0
      };

      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaSheet)
      });
      
      alert("Reporte registrado en la bitácora ✅");

    } catch (error) {
      console.error("Error al enviar a Google Sheet:", error);
      alert("Error al registrar en la bitácora.");
    } finally {
      setEstadoCarga(false, 'sheet');
    }
  }

  async function enviarCorreo() {
    setEstadoCarga(true, 'correo');
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");
      
      const response = await fetch('/data/roles.json');
      if (!response.ok) throw new Error("No se pudo cargar roles.json");
      const rolesData = await response.json();

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(20).setTextColor("#0056b3").text("Reporte de Incidencias", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      const tableRows = [];
      tableRows.push(["Fecha", new Date().toLocaleDateString('es-MX')]);
      
      let nombreDelReportante;
      if (reporte.modulo3?.rolSeleccionado === "Externo") {
        const nombre = reporte.modulo3.nombreExterno || "Externo";
        const telefono = reporte.modulo3.telefonoExterno || "Sin teléfono";
        nombreDelReportante = `${nombre} (${telefono})`;
      } else {
        nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
        if (reporte.modulo3?.llave) {
          const nombreEncontrado = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
          if (nombreEncontrado) nombreDelReportante = nombreEncontrado;
        }
      }
      tableRows.push(["Reportado Por", nombreDelReportante]);
      
      doc.autoTable({ startY: 30, head: [['Concepto', 'Información']], body: tableRows, theme: 'grid', headStyles: { fillColor: [0, 86, 179] } });
      const pdfBase64 = doc.output('datauristring');

      const templateParams = {
        fecha: new Date().toLocaleDateString('es-MX'),
        reportado_por: nombreDelReportante,
        message: `QR: ${reporte.modulo1?.codigoQR}`,
        to_email: DESTINATARIO_PRINCIPAL,
        cc_email: DESTINATARIO_COPIA,
        subject: `Reporte de Incidencias - ${reporte.modulo1?.codigoQR || ''}`,
        attachment: pdfBase64,
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      alert("Correo con PDF adjunto enviado exitosamente ✅");

    } catch (error) {
      console.error("Error al enviar email:", error);
      alert("Error al enviar el correo. Revisa la consola.");
    } finally {
      setEstadoCarga(false, 'correo');
    }
  }

  function enviarWhatsApp() {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    let mensajeTexto = "Se ha generado un nuevo reporte de seguridad.";
    if (reporte) {
      const qr = reporte.modulo1?.codigoQR || "N/A";
      const riesgos = reporte.modulo2?.riesgos?.join(', ') || "Ninguno";
      mensajeTexto = `*Reporte Generado*\n*QR:* ${qr}\n*Riesgos:* ${riesgos}`;
    }
    const mensaje = encodeURIComponent(mensajeTexto);
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
    window.open(url, "_blank");
  }

  function finalizar() {
    if (confirm("¿Estás seguro de que deseas finalizar? Se borrará el reporte actual.")) {
      localStorage.removeItem("reporte");
      window.location.href = "../modulo1-qr/";
    }
  }

  cargarResumenVisual();
  enviarGoogleSheetBtn.addEventListener("click", enviarAGoogleSheet);
  enviarCorreoBtn.addEventListener("click", enviarCorreo);
  enviarWhatsAppBtn.addEventListener("click", enviarWhatsApp);
  finalizarBtn.addEventListener("click", finalizar);
});
