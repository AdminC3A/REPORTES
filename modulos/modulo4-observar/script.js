document.addEventListener("DOMContentLoaded", () => {
  const reporteContainer = document.getElementById("reporte-container");
  const finalizarBtn = document.getElementById("finalizar-reporte");
  const descargarBtn = document.getElementById("descargar-pdf");
  const siguienteBtn = document.getElementById("siguiente-modulo");
  const agregarFotoBtn = document.getElementById("agregar-foto");

  function buscarPortadorPorLlave(llave, rolesData) {
    const llaveLimpia = llave.trim().toLowerCase();
    for (const categoria in rolesData) {
      const supervisores = rolesData[categoria].supervisores;
      for (const nombre in supervisores) {
        const llavesDelSupervisor = supervisores[nombre];
        if (Array.isArray(llavesDelSupervisor) && llavesDelSupervisor.length > 0) {
          const primeraLlave = llavesDelSupervisor[0];
          if (primeraLlave.trim().toLowerCase() === llaveLimpia) {
            return nombre;
          }
        }
      }
    }
    return "Portador no identificado";
  }

  /**
   * NUEVA FUNCIÓN: Construye el HTML del reporte a partir de los datos.
   * Esta función es ahora la única fuente de verdad para el contenido del reporte.
   * @param {object} reporte - El objeto del reporte desde localStorage.
   * @param {object} rolesData - El objeto JSON con todos los roles.
   * @returns {string} - El string HTML del contenido del reporte.
   */
  function generarHtmlDelReporte(reporte, rolesData) {
    if (!reporte || Object.keys(reporte).length === 0) {
      return "<p>No se encontró información del reporte.</p>";
    }

    let html = "";
    html += `<p><strong>Fecha de visualización:</strong> ${new Date().toLocaleString()}</p>`;
    if (reporte.modulo1?.codigoQR) {
      html += `<h3>📌 Código QR</h3><p>${reporte.modulo1.codigoQR}</p>`;
    }
    if (reporte.modulo2) {
      html += `<h3>⚠️ Riesgos Detectados</h3>`;
      html += `<p><strong>Riesgos:</strong> ${reporte.modulo2.riesgos?.join(", ") || "N/A"}</p>`;
    }
    if (reporte.modulo3) {
      html += `<h3>🧑‍💼 Rol de quien Reporta</h3>`;
      html += `<p><strong>Rol:</strong> ${reporte.modulo3.rolSeleccionado}</p>`;
      if (reporte.modulo3.llave) {
        html += `<p><strong>Llave:</strong> VALIDADA</p>`;
        const nombrePortador = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
        html += `<p><strong>Portador de la Llave:</strong> ${nombrePortador}</p>`;
      } else {
        html += `<p><strong>Llave:</strong> NO VALIDADO</p>`;
      }
    }
    const todasLasImagenes = reporte.modulo2?.imagenes || [];
    if (todasLasImagenes.length > 0) {
      html += `<h3>🖼️ Evidencia Fotográfica</h3>`;
      html += `<div class="fotos-galeria">`;
      todasLasImagenes.forEach((imgBase64, index) => {
        html += `<div class="imagen-wrapper"><img class="imagen-reporte" src="${imgBase64}" alt="Imagen ${index + 1}" /></div>`;
      });
      html += `</div>`;
    }
    return html;
  }

  async function cargarYRenderizarReporte() {
    try {
      const response = await fetch('/data/roles.json');
      if (!response.ok) {
        throw new Error(`Error al cargar roles.json: ${response.statusText}`);
      }
      const rolesData = await response.json();
      const reporte = JSON.parse(localStorage.getItem("reporte"));

      // Ahora esta función solo llama a la nueva función constructora
      reporteContainer.innerHTML = generarHtmlDelReporte(reporte, rolesData);

    } catch (error) {
      console.error("Error al cargar el reporte:", error);
      reporteContainer.innerHTML = "<p>Error al cargar la información del reporte. Verifique la consola.</p>";
    }
  }

  async function descargarPDF() {
    try {
        // Obtenemos los datos necesarios de nuevo para asegurar que estén actualizados
        const response = await fetch('/data/roles.json');
        if (!response.ok) throw new Error("No se pudo cargar el archivo de roles para el PDF.");
        const rolesData = await response.json();
        const reporte = JSON.parse(localStorage.getItem("reporte"));
        
        // Creamos el contenido del reporte usando la nueva función
        const contenidoHtml = generarHtmlDelReporte(reporte, rolesData);
        
        const pdfContainer = document.createElement("div");
        pdfContainer.style.width = "900px";
        
        const pdfHeader = document.createElement("h1");
        pdfHeader.textContent = "Reporte de Incidencias de Seguridad";
        pdfHeader.style.color = "#0056b3";
        pdfHeader.style.textAlign = "center";
        pdfHeader.style.borderBottom = "2px solid #e9ecef";
        pdfHeader.style.paddingBottom = "10px";
        pdfHeader.style.marginBottom = "20px";
        
        const contenidoDiv = document.createElement("div");
        contenidoDiv.innerHTML = contenidoHtml;

        pdfContainer.appendChild(pdfHeader);
        pdfContainer.appendChild(contenidoDiv);

        pdfContainer.style.position = "absolute";
        pdfContainer.style.left = "-9999px";
        document.body.appendChild(pdfContainer);

        const fecha = new Date().toISOString().split("T")[0];
        const hora = new Date().toLocaleTimeString("es-MX", { hour12: false }).replace(/:/g, "-");
        const nombreArchivo = `ReporteSeguridad_${fecha}_${hora}.pdf`;
        
        const opt = { margin: 15, filename: nombreArchivo, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };

        await html2pdf().from(pdfContainer).set(opt).save();
        document.body.removeChild(pdfContainer);

    } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("No se pudo generar el PDF. Revisa la consola.");
    }
  }

  // --- El resto de las funciones no cambian ---
  async function estandarizarImagenesIniciales() { /* ...código completo... */ }
  function redimensionarImagen(base64Src) { /* ...código completo... */ }
  async function agregarFotoAdicional() { /* ...código completo... */ }
  function limpiarReporte() { /* ...código completo... */ }
  function siguienteModulo() { /* ...código completo... */ }

  estandarizarImagenesIniciales();
  agregarFotoBtn.addEventListener("click", agregarFotoAdicional);
  descargarBtn.addEventListener("click", descargarPDF);
  finalizarBtn.addEventListener("click", limpiarReporte);
  siguienteBtn.addEventListener("click", siguienteModulo);
});
