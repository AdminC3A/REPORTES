document.addEventListener("DOMContentLoaded", () => {
  const reporteContainer = document.getElementById("reporte-container");
  const finalizarBtn = document.getElementById("finalizar-reporte");
  const descargarBtn = document.getElementById("descargar-pdf");
  const siguienteBtn = document.getElementById("siguiente-modulo");
  const agregarFotoBtn = document.getElementById("agregar-foto");

  /**
   * Busca en los datos de roles el nombre del portador de una llave.
   * @param {string} llave - La llave/ID a buscar (ej. "Gary", "2509").
   * @param {object} rolesData - El objeto JSON con todos los roles y supervisores.
   * @returns {string} - El nombre del portador o un mensaje si no se encuentra.
   */
  function buscarPortadorPorLlave(llave, rolesData) {
    for (const categoria in rolesData) {
      const supervisores = rolesData[categoria].supervisores;
      for (const nombre in supervisores) {
        if (supervisores[nombre] === llave) {
          return nombre;
        }
      }
    }
    return "Portador no identificado";
  }

  /**
   * Carga y muestra los datos del reporte.
   */
  async function cargarYRenderizarReporte() {
    try {
      // ✅ RUTA CORREGIDA
      const response = await fetch('../../data/roles.json');
      if (!response.ok) {
        throw new Error(`Error al cargar roles.json: ${response.statusText}`);
      }
      const rolesData = await response.json();

      const reporte = JSON.parse(localStorage.getItem("reporte"));

      if (!reporte || Object.keys(reporte).length === 0) {
        reporteContainer.innerHTML = "<p>No se encontró información del reporte.</p>";
        return;
      }

      let html = "";
      html += `<p><strong>Fecha de visualización:</strong> ${new Date().toLocaleString()}</p>`;

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
             if (reporte.modulo3.llave) {
                html += `<p><strong>Llave:</strong> VALIDADA</p>`;
                const nombrePortador = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
                html += `<p><strong>Portador de la Llave:</strong> ${nombrePortador}</p>`;
            } else {
                html += `<p><strong>Llave:</strong> NO VALIDADO</p>`;
            }
        }
        if (reporte.modulo3.descripcion) {
            html += `<p><strong>Descripción:</strong> ${reporte.modulo3.descripcion}</p>`;
        }
        if (reporte.modulo3.observacionesAdicionales) {
            html += `<p><strong>Observaciones:</strong> ${reporte.modulo3.observacionesAdicionales}</p>`;
        }
      }

      const todasLasImagenes = reporte.modulo2?.imagenes || [];
      if (todasLasImagenes.length > 0) {
        html += `<h3>🖼️ Evidencia Fotográfica</h3>`;
        html += `<div class="fotos-galeria">`;
        todasLasImagenes.forEach((imgBase64, index) => {
          html += `
            <div class="imagen-wrapper">
              <img class="imagen-reporte" src="${imgBase64}" alt="Imagen ${index + 1}" />
            </div>`;
        });
        html += `</div>`;
      }

      reporteContainer.innerHTML = html;

    } catch (error) {
      console.error("Error al cargar el reporte:", error);
      reporteContainer.innerHTML = "<p>Error al cargar la información del reporte. Verifique la consola.</p>";
    }
  }

  function redimensionarImagen(base64Src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = base64Src;
    });
  }

  async function agregarFotoAdicional() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Original = e.target.result;
        const base64Redimensionada = await redimensionarImagen(base64Original);
        const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
        reporte.modulo2 = reporte.modulo2 || {};
        if (!Array.isArray(reporte.modulo2.imagenes)) {
          reporte.modulo2.imagenes = [];
        }
        reporte.modulo2.imagenes.push(base64Redimensionada);
        localStorage.setItem("reporte", JSON.stringify(reporte));
        cargarYRenderizarReporte();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function descargarPDF() {
    const reportElement = document.getElementById("reporte");
    const pdfContainer = document.createElement("div");
    const pdfHeader = document.createElement("h1");
    pdfHeader.textContent = "Reporte de Incidencias de Seguridad";
    pdfHeader.style.textAlign = "center";
    pdfHeader.style.color = "#0056b3";
    pdfHeader.style.fontSize = "24px";
    pdfHeader.style.marginBottom = "25px";
    pdfHeader.style.borderBottom = "2px solid #dee2e6";
    pdfHeader.style.paddingBottom = "10px";
    pdfContainer.appendChild(pdfHeader);
    pdfContainer.appendChild(reportElement.cloneNode(true));
    const fecha = new Date().toISOString().split("T")[0];
    const hora = new Date().toLocaleTimeString("es-MX", { hour12: false }).replace(/:/g, "-");
    const nombreArchivo = `ReporteSeguridad_${fecha}_${hora}.pdf`;
    const opt = {
      margin: [15, 10, 15, 10],
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(pdfContainer).save();
  }

  function limpiarReporte() {
    const confirmacion = confirm("¿Estás seguro de que deseas finalizar y borrar este reporte?");
    if (confirmacion) {
        localStorage.removeItem("reporte");
        window.location.href = "../modulo1-qr/"; 
    }
  }
  
  function siguienteModulo() {
    window.location.href = "../modulo5-corregir/";
  }
  
  async function estandarizarImagenesIniciales() {
    const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
    if (reporte.modulo2 && reporte.modulo2.imagen) {
      const imgRedimensionada = await redimensionarImagen(reporte.modulo2.imagen);
      if (!Array.isArray(reporte.modulo2.imagenes)) {
        reporte.modulo2.imagenes = [];
      }
      reporte.modulo2.imagenes.unshift(imgRedimensionada);
      delete reporte.modulo2.imagen; 
      localStorage.setItem("reporte", JSON.stringify(reporte));
    }
    await cargarYRenderizarReporte();
  }

  estandarizarImagenesIniciales();
  
  agregarFotoBtn.addEventListener("click", agregarFotoAdicional);
  descargarBtn.addEventListener("click", descargarPDF);
  finalizarBtn.addEventListener("click", limpiarReporte);
  siguienteBtn.addEventListener("click", siguienteModulo);
});
