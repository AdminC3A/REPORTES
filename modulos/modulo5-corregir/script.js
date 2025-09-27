document.addEventListener("DOMContentLoaded", () => {
  const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
  const enviarEmailBtn = document.getElementById("enviar-email");
  const enviarAmbosBtn = document.getElementById("enviar-ambos");
  const finalizarBtn = document.getElementById("finalizar");

  // ⚙️ Configura esto según tu cuenta de EmailJS
  const SERVICE_ID = "tu_service_id";
  const TEMPLATE_ID = "tu_template_id";
  const PUBLIC_KEY = "tu_public_key";

  // 📌 Reemplaza por el correo del destinatario o puedes pedirlo al usuario
  const DESTINATARIO = "destinatario@correo.com";

  // ✅ Enviar por WhatsApp
  enviarWhatsAppBtn.addEventListener("click", () => {
    const mensaje = encodeURIComponent("Hola, se ha generado un nuevo reporte de seguridad.");
    const telefono = "52XXXXXXXXXX"; // 📲 Reemplaza con tu número
    const url = `https://wa.me/${telefono}?text=${mensaje}`;
    window.open(url, "_blank");
  });

  // ✅ Enviar por Correo
  enviarEmailBtn.addEventListener("click", async () => {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    if (!reporte) return alert("No hay reporte para enviar.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;
    doc.setFontSize(16);
    doc.text("📋 Reporte de Seguridad", 10, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 10, y);
    y += 10;

    if (reporte.modulo1?.codigoQR) {
      doc.text(`QR: ${reporte.modulo1.codigoQR}`, 10, y);
      y += 6;
    }

    if (reporte.modulo2?.riesgos) {
      doc.text(`Riesgos: ${reporte.modulo2.riesgos.join(", ")}`, 10, y);
      y += 6;
    }

    if (reporte.modulo3?.rolSeleccionado) {
      doc.text(`Rol: ${reporte.modulo3.rolSeleccionado}`, 10, y);
      y += 6;
    }

    // 🔄 Convertir a Base64
    const pdfBase64 = doc.output("datauristring");

    // 📨 Enviar a EmailJS
    const templateParams = {
      to_email: DESTINATARIO,
      subject: "Nuevo Reporte de Seguridad QR",
      message: "Se adjunta el PDF del reporte generado.",
      attachment: pdfBase64,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
      alert("Correo enviado exitosamente ✅");
    } catch (error) {
      console.error("Error al enviar email:", error);
      alert("Error al enviar el correo ❌");
    }
  });

  // ✅ Ambos
  enviarAmbosBtn.addEventListener("click", () => {
    enviarWhatsAppBtn.click();
    setTimeout(() => enviarEmailBtn.click(), 1000); // delay
  });

  // ✅ Finalizar
  finalizarBtn.addEventListener("click", () => {
    localStorage.removeItem("reporte");
    window.location.href = "/modulos/modulo1-qr/";
  });
});
