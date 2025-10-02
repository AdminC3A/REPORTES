document.addEventListener("DOMContentLoaded", async () => {
  // Se elimina la referencia al botón 'enviar-ambos'
  const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
  const enviarCorreoBtn = document.getElementById("enviar-correo");
  const finalizarBtn = document.getElementById("finalizar");
  const resumenContainer = document.getElementById("reporte-resumen");

  // ⬇️ ⚠️ IMPORTANTE: PEGA AQUÍ LA URL DE TU APPS SCRIPT
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbynSPgJHgf8oX7YEwhvH65vYfXc0wE1m7vCurwaYbkj4G2Y6tz-qdW0xe1_F4D4FMxg1g/exec";

  const SERVICE_ID = "service_m1kpjzd";
  const TEMPLATE_ID = "template_0vvcv8r";
  const PUBLIC_KEY = "AV0u6cTpjcpnjm3xKO";
  const DESTINATARIO_PRINCIPAL = "ctasupervisionnom031@gmail.com";
  const DESTINATARIO_COPIA = "supervision@casatresguas.com";
  const NUMERO_WHATSAPP = "5215549616817";

  function buscarPortadorPorLlave(llave, rolesData) { /* ...código sin cambios... */ }
  function cargarResumenVisual() { /* ...código sin cambios... */ }

  function setEstadoCarga(cargando, botonPresionado) {
    // Se simplifica la función de carga
    enviarWhatsAppBtn.disabled = cargando;
    enviarCorreoBtn.disabled = cargando;
    finalizarBtn.disabled = cargando;

    if (cargando) {
      if (botonPresionado === 'correo') {
        enviarCorreoBtn.textContent = "Enviando...";
      } else if (botonPresionado === 'whatsapp') {
        enviarWhatsAppBtn.textContent = "Procesando...";
      }
    } else {
      enviarCorreoBtn.textContent = "Enviar por Correo";
      enviarWhatsAppBtn.textContent = "Enviar por WhatsApp";
    }
  }

  async function enviarCorreoYGuardar() {
    setEstadoCarga(true, 'correo');
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");
      
      const response = await fetch('/data/roles.json');
      if (!response.ok) throw new Error("No se pudo cargar roles.json");
      const rolesData = await response.json();
      
      // Enviar a Google Sheets automáticamente
      await enviarAGoogleSheet(reporte, rolesData);

      // Generar PDF y enviar correo
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      // ... (resto de la lógica de creación de PDF con autoTable) ...
      const pdfBase64 = doc.output('datauristring');
      
      // ... (resto de la lógica de templateParams y emailjs.send) ...

      alert("Correo enviado y datos guardados en la hoja de cálculo.");
    } catch (error) {
      console.error("Error en el proceso de correo:", error);
      alert("Ocurrió un error. Revisa la consola.");
    } finally {
      setEstadoCarga(false);
    }
  }

  async function enviarWhatsAppYGuardar() {
    setEstadoCarga(true, 'whatsapp');
    try {
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      if (!reporte) throw new Error("No hay reporte para enviar.");
      
      const response = await fetch('/data/roles.json');
      const rolesData = await response.json();

      // Enviar a Google Sheets automáticamente
      await enviarAGoogleSheet(reporte, rolesData);
      
      // Abrir WhatsApp
      const qr = reporte.modulo1?.codigoQR || "N/A";
      const riesgos = reporte.modulo2?.riesgos?.join(', ') || "Ninguno";
      const mensaje = encodeURIComponent(`*Reporte Generado*\n*QR:* ${qr}\n*Riesgos:* ${riesgos}`);
      window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, "_blank");

    } catch (error) {
      console.error("Error en el proceso de WhatsApp:", error);
      alert("Ocurrió un error. Revisa la consola.");
    } finally {
      setEstadoCarga(false);
    }
  }

  async function enviarAGoogleSheet(reporte, rolesData) {
    // ... (lógica de enviar a Google Sheet sin cambios) ...
  }
  
  function finalizar() { /* ...código sin cambios... */ }

  // --- INICIALIZACIÓN Y EVENTOS (SIMPLIFICADOS) ---
  cargarResumenVisual();
  enviarCorreoBtn.addEventListener("click", enviarCorreoYGuardar);
  enviarWhatsAppBtn.addEventListener("click", enviarWhatsAppYGuardar);
  finalizarBtn.addEventListener("click", finalizar);
});
