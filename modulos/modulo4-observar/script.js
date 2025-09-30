document.addEventListener("DOMContentLoaded", () => {
  const reporteContainer = document.getElementById("reporte-container");
  const finalizarBtn = document.getElementById("finalizar-reporte");
  const descargarBtn = document.getElementById("descargar-pdf");
  const siguienteBtn = document.getElementById("siguiente-modulo");
  const agregarFotoBtn = document.getElementById("agregar-foto");

  function cargarReporte() {
    const reporte = JSON.parse(localStorage.getItem("reporte"));

    if (!reporte || Object.keys(reporte).length === 0) {
      reporteContainer.innerHTML = "<p>No se encontró información del reporte.</p>";
      return;
    }

    let html = "";

    const fechaActual = new Date();
    const fecha = fechaActual.toLocaleString();

    html += `<p><strong>Fecha:</strong> ${fecha}</p>`;

    if (reporte.modulo1?.codigoQR) {
      html += `<h3><strong>Código QR Escaneado</strong></h3>
               <p>QR: ${reporte.modulo1.codigoQR}</p>`;
    }

    if (reporte.modulo2) {
      html += `<h3><strong>Riesgos Detectados</strong></h3>`;
      if (reporte.modulo2.riesgos?.length) {
        html += `<p>Riesgos: ${reporte.modulo2.riesgos.join(", ")}</p>`;
      }
      if (reporte.modulo2.detalleOtros) {
        html += `<p>Detalle de Otros: ${reporte.modulo2.detalleOtros}</p>`;
      }
      if (reporte.modulo2.clasificacionSeleccionada) {
        html += `<p>Clasificación: ${reporte.modulo2.clasificacionSeleccionada}</p>`;
        if (reporte.modulo2.detalleClasificacion) {
          html += `<p>Detalle Clasificación: ${reporte.modulo2.detalleClasificacion}</p>`;
        }
      }
    }

    if (reporte.modulo3) {
      html += `<h3><strong>Información del Reportante</strong></h3>`;
      html += `<p>Rol: ${reporte.modulo3.rolSeleccionado}</p>`;
      if (reporte.modulo3.rolSeleccionado === "Externo") {
        html += `<p>Nombre: ${reporte.modulo3.nombreExterno || "N/A"}</p>`;
        html += `<p>Teléfono: ${reporte.modulo3.telefonoExterno || "N/A"}</p>`;
      } else {
        html += `<p>Llave: ${reporte.modulo3.llave ? "VALIDADA" : "NO VALIDADO"}</p>`;
      }
      if (reporte.modulo3.descripcion) {
        html += `<p>Descripción: ${reporte.modulo3.descripcion}</p>`;
      }
      if (reporte.modulo3.observacionesAdicionales) {
        html += `<p>Observaciones: ${reporte.modulo3.observacionesAdicionales}</p>`;
      }
    }

    const imagenes = reporte.modulo2?.imagenes || [];
    imagenes.forEach((img) => {
      html += `<img class="imagen-reporte" src="${img}" alt="Imagen">`;
    });

    reporteContainer.innerHTML = html;
  }

  function agregarFotoAdicional() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imagenBase64 = e.target.result;
        const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
        reporte.modulo2 = reporte.modulo2 || {};
        reporte.modulo2.imagenes = reporte.modulo2.imagenes || [];
        reporte.modulo2.imagenes.push(imagenBase64);
        localStorage.setItem("reporte", JSON.stringify(reporte));
        cargarReporte();
      };
      reader.readAsDataURL(file);
    });

    input.click();
  }

  function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const reporte = JSON.parse(localStorage.getItem("reporte"));

    let y = 15;
    doc.setFontSize(16);
    doc.text("📋 Reporte de Seguridad", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, y);
    y += 10;

    function addText(label, text) {
      doc.setFont(undefined, "bold");
      doc.text(label, 20, y);
      doc.setFont(undefined, "normal");
      doc.text(text, 60, y);
      y += 8;
    }

    if (reporte.modulo1?.codigoQR) {
      addText("QR:", reporte.modulo1.codigoQR);
    }

    if (reporte.modulo2) {
      addText("Riesgos:", (reporte.modulo2.riesgos || []).join(", "));
      if (reporte.modulo2.detalleOtros) addText("Detalle Otros:", reporte.modulo2.detalleOtros);
      addText("Clasificación:", reporte.modulo2.clasificacionSeleccionada || "");
      if (reporte.modulo2.detalleClasificacion) {
        addText("Detalle Clasificación:", reporte.modulo2.detalleClasificacion);
      }
    }

    if (reporte.modulo3) {
      addText("Rol:", reporte.modulo3.rolSeleccionado);
      if (reporte.modulo3.rolSeleccionado === "Externo") {
        addText("Nombre:", reporte.modulo3.nombreExterno || "N/A");
        addText("Teléfono:", reporte.modulo3.telefonoExterno || "N/A");
      } else {
        addText("Llave:", reporte.modulo3.llave ? "VALIDADA" : "NO VALIDADO");
      }
      if (reporte.modulo3.descripcion) {
        addText("Descripción:", reporte.modulo3.descripcion);
      }
      if (reporte.modulo3.observacionesAdicionales) {
        addText("Observaciones:", reporte.modulo3.observacionesAdicionales);
      }
    }

    const imagenes = reporte.modulo2?.imagenes || [];
    imagenes.forEach((img, index) => {
      doc.addPage();
      doc.addImage(img, "JPEG", 15, 20, 180, 160);
    });

    const hora = new Date().toLocaleTimeString().replace(/:/g, "-");
    const fecha = new Date().toISOString().split("T")[0];
    doc.save(`ReporteSeguridad_${fecha}_${hora}.pdf`);
  }

  function limpiarReporte() {
    localStorage.removeItem("reporte");
    window.location.href = "/modulos/modulo1-qr/";
  }

  function siguienteModulo() {
    window.location.href = "/modulos/modulo5-corregir/";
  }

  cargarReporte();
  agregarFotoBtn.addEventListener("click", agregarFotoAdicional);
  descargarBtn.addEventListener("click", generarPDF);
  finalizarBtn.addEventListener("click", limpiarReporte);
  siguienteBtn.addEventListener("click", siguienteModulo);
});
