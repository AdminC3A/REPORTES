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
    const fechaActual = new Date().toLocaleString();
    html += `<p><strong>Fecha:</strong> ${fechaActual}</p>`;

    if (reporte.modulo1?.codigoQR) {
      html += `<h3>📌 Código QR</h3><p>${reporte.modulo1.codigoQR}</p>`;
    }

    if (reporte.modulo2) {
      html += `<h3>⚠️ Riesgos Detectados</h3>`;
      html += `<p><strong>Riesgos:</strong> ${reporte.modulo2.riesgos?.join(", ") || "N/A"}</p>`;
      if (reporte.modulo2.detalleOtros) {
        html += `<p><strong>Detalle Otros:</strong> ${reporte.modulo2.detalleOtros}</p>`;
      }
      html += `<p><strong>Clasificación:</strong> ${reporte.modulo2.clasificacionSeleccionada || "N/A"}</p>`;
      if (reporte.modulo2.detalleClasificacion) {
        html += `<p><strong>Detalle Clasificación:</strong> ${reporte.modulo2.detalleClasificacion}</p>`;
      }
    }

    if (reporte.modulo3) {
      html += `<h3>🧑‍💼 Rol de quien Reporta</h3>`;
      html += `<p><strong>Rol:</strong> ${reporte.modulo3.rolSeleccionado}</p>`;

      if (reporte.modulo3.rolSeleccionado === "Externo") {
        html += `<p><strong>Nombre:</strong> ${reporte.modulo3.nombreExterno || "N/A"}</p>`;
        html += `<p><strong>Teléfono:</strong> ${reporte.modulo3.telefonoExterno || "N/A"}</p>`;
      } else {
        html += `<p><strong>Llave:</strong> ${reporte.modulo3.llave ? "VALIDADA" : "NO VALIDADO"}</p>`;
      }

      if (reporte.modulo3.descripcion) {
        html += `<p><strong>Descripción:</strong> ${reporte.modulo3.descripcion}</p>`;
      }
      if (reporte.modulo3.observacionesAdicionales) {
        html += `<p><strong>Observaciones:</strong> ${reporte.modulo3.observacionesAdicionales}</p>`;
      }
    }

    // Mostrar imágenes (inicial + adicionales si existen)
    let imagenes = [];

    if (reporte.modulo2) {
      if (reporte.modulo2.imagen) {
        imagenes.push(reporte.modulo2.imagen); // Imagen inicial
      }

      if (Array.isArray(reporte.modulo2.imagenes)) {
        imagenes = imagenes.concat(reporte.modulo2.imagenes); // Agregar adicionales
      }

      if (imagenes.length > 0) {
        html += `<h3>🖼️ Evidencia Fotográfica</h3>`;
        imagenes.forEach((img, i) => {
          html += `<img class="imagen-reporte" src="${img}" alt="Imagen ${i + 1}" />`;
        });
      }
    }

    // ✅ Renderizar el HTML al final
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
        const imgBase64 = e.target.result;
        const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
        reporte.modulo2 = reporte.modulo2 || {};

        if (!Array.isArray(reporte.modulo2.imagenes)) {
          const imagenInicial = reporte.modulo2.imagen;
          reporte.modulo2.imagenes = imagenInicial ? [imagenInicial] : [];
          delete reporte.modulo2.imagen;
        }

        reporte.modulo2.imagenes.push(imgBase64);
        localStorage.setItem("reporte", JSON.stringify(reporte));
        cargarReporte();
      };
      reader.readAsDataURL(file);
    });

    input.click();
  }

  function descargarPDF() {
  const element = document.getElementById("reporte");
  const fecha = new Date().toISOString().split("T")[0];
  const hora = new Date().toLocaleTimeString().replace(/:/g, "-");
  const nombreArchivo = `ReporteSeguridad_${fecha}_${hora}.pdf`;

  // Redimensionar imágenes SOLO para el PDF
  const imgs = element.querySelectorAll(".imagen-reporte");
  imgs.forEach(img => {
    img.style.maxWidth = "300px";
    img.style.height = "auto";
  });

  html2pdf()
    .set({
      margin: 10,
      filename: nombreArchivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
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
  descargarBtn.addEventListener("click", descargarPDF);
  finalizarBtn.addEventListener("click", limpiarReporte);
  siguienteBtn.addEventListener("click", siguienteModulo);
});
