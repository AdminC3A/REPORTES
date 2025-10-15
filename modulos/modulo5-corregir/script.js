document.addEventListener("DOMContentLoaded", async () => {
  // Referencias a los botones actualizadas
  const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
  const enviarCorreoBtn = document.getElementById("enviar-correo");
  const registrarBitacoraBtn = document.getElementById("registrar-bitacora");
  const finalizarBtn = document.getElementById("finalizar");
  const resumenContainer = document.getElementById("reporte-resumen");

  // --- CONFIGURACIÓN ---
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBspQT3_J4m3OFDeiQYCXcSrqt76ZSmTkTFuvOGyIC-7v0d80oGqzsAa5DPAAtzuOk/exec"; // 👈 PEGA TU URL DE APPS SCRIPT
  const SERVICE_ID = "service_m1kpjzd";
  const TEMPLATE_ID = "template_0vvcv8r";
  const PUBLIC_KEY = "AV0u6cTpjcpnjm3xKO";
  const DESTINATARIO_PRINCIPAL = "ctasupervisionnom031@gmail.com";
  const DESTINATARIO_COPIA = "supervision@casatresguas.com";
  const NUMERO_WHATSAPP = "5215549616817";

  // --- FUNCIONES AUXILIARES ---

  function setEstadoCarga(cargando, tipo) {
    const botones = [enviarWhatsAppBtn, enviarCorreoBtn, registrarBitacoraBtn, finalizarBtn];
    botones.forEach(btn => btn.disabled = cargando);

    if (cargando) {
      if (tipo === 'correo') {
        enviarCorreoBtn.textContent = "Enviando...";
      } else if (tipo === 'sheet') {
        registrarBitacoraBtn.textContent = "Registrando...";
      }
    } else {
      enviarCorreoBtn.textContent = "📧 Enviar por Correo";
      registrarBitacoraBtn.textContent = "📊 Registrar en Bitácora";
    }
  }
  
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
  
  // --- LÓGICA DE LOS BOTONES ---

  async function enviarCorreo() {
    setEstadoCarga(true, 'correo');
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");
      
      const response = await fetch('/data/roles.json');
      if (!response.ok) throw new Error("No se pudo cargar roles.json");
      const rolesData = await response.json();

      // Generar PDF con jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(20).setTextColor("#0056b3").text("Reporte de Incidencias", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      const tableRows = [];
      tableRows.push(["Fecha", new Date().toLocaleDateString('es-MX')]);
      // ... (resto de la lógica de creación de la tabla del PDF)
      let nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
      if (reporte.modulo3?.llave) {
        const nombreEncontrado = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
        if (nombreEncontrado) nombreDelReportante = nombreEncontrado;
      }
      tableRows.push(["Reportado Por", nombreDelReportante]);
      doc.autoTable({ startY: 30, head: [['Concepto', 'Información']], body: tableRows, theme: 'grid', headStyles: { fillColor: [0, 86, 179] } });
      const pdfBase64 = doc.output('datauristring');

      // Preparar y enviar correo
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

  async function enviarAGoogleSheet() {
    setEstadoCarga(true, 'sheet');
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");
      const response = await fetch('/data/roles.json');
      const rolesData = await response.json();
      let nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
      if (reporte.modulo3?.llave) {
        const nombreEncontrado = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
        if (nombreEncontrado) nombreDelReportante = nombreEncontrado;
      }
      const datosParaSheet = {
        codigoQR: reporte.modulo1?.codigoQR,
        riesgos: reporte.modulo2?.riesgos?.join(', '),
        clasificacion: reporte.modulo2?.clasificacionSeleccionada,
        reportadoPor: nombreDelReportante,
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

  function enviarWhatsApp() {
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
  }

  function finalizar() {
    if (confirm("¿Estás seguro de que deseas finalizar? Se borrará el reporte actual.")) {
      localStorage.removeItem("reporte");
      window.location.href = "../modulo1-qr/";
    }
  }

  // --- INICIALIZACIÓN Y EVENTOS ---
  cargarResumenVisual();
  registrarBitacoraBtn.addEventListener("click", enviarAGoogleSheet);
  enviarCorreoBtn.addEventListener("click", enviarCorreo);
  enviarWhatsAppBtn.addEventListener("click", enviarWhatsApp);
  finalizarBtn.addEventListener("click", finalizar);
});
