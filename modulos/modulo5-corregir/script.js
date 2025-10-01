document.addEventListener("DOMContentLoaded", async () => {
  const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
  const enviarCorreoBtn = document.getElementById("enviar-correo");
  const enviarAmbosBtn = document.getElementById("enviar-ambos");
  const finalizarBtn = document.getElementById("finalizar");
  const resumenContainer = document.getElementById("reporte-resumen");

  // --- CONFIGURACIÓN ---
  const APPS_SCRIPT_URL = "URL_DE_TU_APPS_SCRIPT_AQUI"; // 👈 PEGA TU URL DE APPS SCRIPT
  const SERVICE_ID = "service_m1kpjzd";
  const TEMPLATE_ID = "template_0vvcv8r";
  const PUBLIC_KEY = "AV0u6cTpjcpnjm3xKO";
  const DESTINATARIO_PRINCIPAL = "ctasupervisionnom031@gmail.com";
  const DESTINATARIO_COPIA = "supervision@casatresguas.com";
  const NUMERO_WHATSAPP = "5215549616817";

  // --- FUNCIONES AUXILIARES ---

  function setEstadoCarga(cargando) {
    const botones = [enviarWhatsAppBtn, enviarCorreoBtn, enviarAmbosBtn, finalizarBtn];
    botones.forEach(btn => btn.disabled = cargando);
    if (cargando) {
      enviarCorreoBtn.textContent = "Enviando...";
      enviarAmbosBtn.textContent = "Enviando...";
    } else {
      enviarCorreoBtn.textContent = "Enviar por Correo";
      enviarAmbosBtn.textContent = "Enviar por Ambos";
    }
  }
  
  function buscarPortadorPorLlave(llave, rolesData) { /* ... (código sin cambios) ... */ }
  function cargarResumenVisual() { /* ... (código sin cambios) ... */ }
  
  // --- FUNCIONES PRINCIPALES DE ENVÍO ---

  async function enviarCorreo(reporte, rolesData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20).setTextColor("#0056b3").text("Reporte de Incidencias", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    const tableRows = [];
    tableRows.push(["Fecha", new Date().toLocaleDateString('es-MX')]);
    if (reporte.modulo1?.codigoQR) tableRows.push(["Código QR", reporte.modulo1.codigoQR]);
    let nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
    if (reporte.modulo3?.llave) {
      const nombreEncontrado = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
      if (nombreEncontrado) nombreDelReportante = nombreEncontrado;
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
  }

  async function enviarAGoogleSheet(reporte, rolesData) {
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
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosParaSheet)
    });
  }

  function enviarWhatsApp(reporte) {
    const qr = reporte.modulo1?.codigoQR || "N/A";
    const riesgos = reporte.modulo2?.riesgos?.join(', ') || "Ninguno";
    const mensaje = encodeURIComponent(`*Reporte Generado*\n*QR:* ${qr}\n*Riesgos:* ${riesgos}`);
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, "_blank");
  }

  function finalizar() { /* ... (código sin cambios) ... */ }
  
  // --- INICIALIZACIÓN Y EVENTOS ---
  cargarResumenVisual();

  enviarCorreoBtn.addEventListener("click", async () => {
    setEstadoCarga(true);
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");
      const response = await fetch('/data/roles.json');
      const rolesData = await response.json();

      await enviarAGoogleSheet(reporte, rolesData); // Envío automático a Sheet
      await enviarCorreo(reporte, rolesData);       // Envío de correo
      
      alert("Correo enviado y datos guardados en la hoja de cálculo.");
    } catch (error) {
      console.error("Error en el proceso:", error);
      alert("Ocurrió un error. Revisa la consola.");
    } finally {
      setEstadoCarga(false);
    }
  });

  enviarWhatsAppBtn.addEventListener("click", async () => {
    setEstadoCarga(true);
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");
      const response = await fetch('/data/roles.json');
      const rolesData = await response.json();
      
      await enviarAGoogleSheet(reporte, rolesData); // Envío automático a Sheet
      enviarWhatsApp(reporte);                      // Envío de WhatsApp
      
      alert("Datos guardados en la hoja de cálculo.");
    } catch (error) {
      console.error("Error en el proceso:", error);
      alert("Ocurrió un error. Revisa la consola.");
    } finally {
      setEstadoCarga(false);
    }
  });

  enviarAmbosBtn.addEventListener("click", async () => {
    setEstadoCarga(true);
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");
      const response = await fetch('/data/roles.json');
      const rolesData = await response.json();
      
      await enviarAGoogleSheet(reporte, rolesData); // Envío automático a Sheet (SOLO UNA VEZ)
      await enviarCorreo(reporte, rolesData);       // Envío de correo
      enviarWhatsApp(reporte);                      // Envío de WhatsApp
      
      alert("Correo enviado, WhatsApp abierto y datos guardados.");
    } catch (error) {
      console.error("Error en el proceso:", error);
      alert("Ocurrió un error. Revisa la consola.");
    } finally {
      setEstadoCarga(false);
    }
  });
  
  finalizarBtn.addEventListener("click", finalizar);
});
