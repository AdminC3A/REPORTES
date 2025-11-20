document.addEventListener("DOMContentLoaded", async () => {

  const subirDriveBtn = document.getElementById("subir-drive");
  const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
  const finalizarBtn = document.getElementById("finalizar");
  const resumenContainer = document.getElementById("reporte-resumen");
  const inputArchivo = document.getElementById("archivo");

  // CONFIGURACIÓN
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxJmeDXcMCmjkT0NaArjaK3c_fXVMw_y7qDNYXDvcqvtIS63hmqIPEEHy9IGSatXdV1/exec";
  const NUMERO_WHATSAPP = "5215549616817";

  // MOSTRAR RESUMEN
  function cargarResumenVisual() {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    if (!reporte) {
      resumenContainer.innerHTML = "<h3>No se encontró reporte.</h3>";
      return;
    }

    resumenContainer.innerHTML = `
      <h3>Resumen del Reporte</h3>
      <p><strong>QR:</strong> ${reporte.modulo1?.codigoQR || 'N/A'}</p>
      <p><strong>Riesgos:</strong> ${reporte.modulo2?.riesgos?.join(', ') || 'N/A'}</p>
      <p><strong>Clasificación:</strong> ${reporte.modulo2?.clasificacionSeleccionada || 'N/A'}</p>
      <p><strong>Rol:</strong> ${reporte.modulo3?.rolSeleccionado || 'N/A'}</p>
    `;
  }

  cargarResumenVisual();


  // ---------------------------------------------------------------------------
  // 1. SUBIR A DRIVE
  // ---------------------------------------------------------------------------
  subirDriveBtn.addEventListener("click", () => inputArchivo.click());

  inputArchivo.addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = async function () {
      const base64 = lector.result.split(",")[1];

      const payload = {
        fileName: archivo.name || `Reporte_${Date.now()}.pdf`,
        mimeType: archivo.type || "application/pdf",
        base64Data: base64
      };

      try {
        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        alert("PDF subido correctamente a Drive.");

        // OCULTAR EL BOTÓN DE SUBIR A DRIVE
        subirDriveBtn.style.display = "none";

      } catch (error) {
        alert("Error al subir archivo a Drive.");
      }
    };

    lector.readAsDataURL(archivo);
  });


  // ---------------------------------------------------------------------------
  // 2. ENVIAR WHATSAPP
  // ---------------------------------------------------------------------------
  enviarWhatsAppBtn.addEventListener("click", () => {
    const reporte = JSON.parse(localStorage.getItem("reporte"));
    const qr = reporte?.modulo1?.codigoQR || "N/A";
    const riesgos = reporte?.modulo2?.riesgos?.join(", ") || "Ninguno";

    const txt = encodeURIComponent(
      `Reporte generado:\nQR: ${qr}\nRiesgos: ${riesgos}\nEl PDF está en Drive.`
    );

    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${txt}`, "_blank");
  });


  // ---------------------------------------------------------------------------
  // 3. FINALIZAR (SE RESPETA TAL CUAL ESTABA)
  // ---------------------------------------------------------------------------
  finalizarBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas finalizar? Se borrará el reporte actual.")) {
      localStorage.removeItem("reporte");
      window.location.href = "../modulo1-qr/"; // NO SE TOCA
    }
  });

});
