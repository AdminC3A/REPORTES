document.addEventListener("DOMContentLoaded", () => {
  const reporteContainer = document.getElementById("reporte-container");
  const descargarBtn = document.getElementById("descargar-pdf");
  const agregarFotoBtn = document.getElementById("agregar-foto");
  const siguienteBtn = document.getElementById("siguiente-modulo");
  const finalizarBtn = document.getElementById("finalizar-reporte");

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
    return "Portador no identificado";
  }

  async function cargarYRenderizarReporte() {
    try {
      const response = await fetch('/data/roles.json');
      if (!response.ok) throw new Error("Error al cargar roles.json");
      const rolesData = await response.json();
      const reporte = JSON.parse(localStorage.getItem("reporte"));

      if (!reporte) {
        reporteContainer.innerHTML = "<p>No se encontró información del reporte.</p>";
        return;
      }

      let html = "";
      html += `<p><strong>Fecha de visualización:</strong> ${new Date().toLocaleString()}</p>`;
      if (reporte.modulo1?.codigoQR) html += `<h3>📌 Código QR</h3><p>${reporte.modulo1.codigoQR}</p>`;
      if (reporte.modulo2) {
        html += `<h3>⚠️ Riesgos Detectados</h3><p><strong>Riesgos:</strong> ${reporte.modulo2.riesgos?.join(", ") || "N/A"}</p>`;
        if (reporte.modulo2.clasificacionSeleccionada) html += `<p><strong>Clasificación:</strong> ${reporte.modulo2.clasificacionSeleccionada}</p>`;
        if (reporte.modulo2.detalleClasificacion) html += `<p><strong>Detalle Clasificación:</strong> ${reporte.modulo2.detalleClasificacion}</p>`;
      }
      if (reporte.modulo3) {
        html += `<h3>🧑‍💼 Rol de quien Reporta</h3><p><strong>Rol:</strong> ${reporte.modulo3.rolSeleccionado}</p>`;
        if (reporte.modulo3.llave) {
          html += `<p><strong>Llave:</strong> VALIDADA</p>`;
          const nombrePortador = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
          html += `<p><strong>Portador de la Llave:</strong> ${nombrePortador}</p>`;
        }
      }
      const todasLasImagenes = reporte.modulo2?.imagenes || [];
      if (todasLasImagenes.length > 0) {
        html += `<h3>🖼️ Evidencia Fotográfica</h3><div class="fotos-galeria">`;
        todasLasImagenes.forEach(img => html += `<div class="imagen-wrapper"><img class="imagen-reporte" src="${img}" /></div>`);
        html += `</div>`;
      }
      reporteContainer.innerHTML = html;
    } catch (error) {
      console.error("Error al cargar el reporte:", error);
      reporteContainer.innerHTML = "<p>Error al cargar la información. Verifique la consola.</p>";
    }
  }

  // ==================================================================
  // == FUNCIÓN DESCARGAR PDF (REESCRITA CON jspdf y jspdf-autotable) ==
  // ==================================================================
  async function descargarPDF() {
    setEstadoCarga(true);
    try {
      const response = await fetch('/data/roles.json');
      if (!response.ok) throw new Error("No se pudo cargar roles.json para el PDF.");
      const rolesData = await response.json();
      const reporte = JSON.parse(localStorage.getItem("reporte"));
      
      if (!reporte) {
        alert("No hay reporte para generar el PDF.");
        setEstadoCarga(false);
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // --- 1. TÍTULO ---
      doc.setFontSize(20);
      doc.setTextColor("#0056b3");
      doc.text("Reporte de Incidencias de Seguridad", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      // --- 2. TABLA DE DATOS ---
      const tableRows = [];
      tableRows.push(["Fecha", new Date().toLocaleDateString('es-MX')]);
      if (reporte.modulo1?.codigoQR) tableRows.push(["Código QR", reporte.modulo1.codigoQR]);
      if (reporte.modulo2?.riesgos) tableRows.push(["Riesgos", reporte.modulo2.riesgos.join(", ")]);
      if (reporte.modulo2?.clasificacionSeleccionada) tableRows.push(["Clasificación", reporte.modulo2.clasificacionSeleccionada]);
      if (reporte.modulo3?.rolSeleccionado) tableRows.push(["Rol Reporta", reporte.modulo3.rolSeleccionado]);
      if (reporte.modulo3?.llave) {
        const nombrePortador = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
        tableRows.push(["Portador de Llave", nombrePortador]);
      }

      doc.autoTable({
        startY: 30,
        head: [['Concepto', 'Información']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 86, 179] } // Color azul del encabezado
      });

      // --- 3. IMÁGENES ---
      const todasLasImagenes = reporte.modulo2?.imagenes || [];
      if (todasLasImagenes.length > 0) {
        let finalY = doc.lastAutoTable.finalY || 30; // Posición después de la tabla
        doc.setFontSize(14);
        doc.text("Evidencia Fotográfica", 14, finalY + 15);
        
        let y = finalY + 20;
        const margin = 14;
        const imgWidth = 80; // Ancho fijo para las imágenes
        const pageHeight = doc.internal.pageSize.getHeight();

        todasLasImagenes.forEach(imgData => {
            if (y + 65 > pageHeight) { // Si la imagen no cabe, crea una nueva página
                doc.addPage();
                y = 20; // Reinicia la posición Y en la nueva página
            }
            doc.addImage(imgData, 'JPEG', margin, y, imgWidth, 60); // x, y, ancho, alto
            y += 65; // Mueve la posición para la siguiente imagen
        });
      }

      // --- 4. GUARDAR ---
      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `ReporteSeguridad_${fecha}.pdf`;
      doc.save(nombreArchivo);

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Ocurrió un error al crear el PDF.");
    } finally {
      setEstadoCarga(false);
    }
  }

  function setEstadoCarga(cargando) { /* ... (función sin cambios) ... */ }
  async function estandarizarImagenesIniciales() { /* ... (función sin cambios) ... */ }
  function redimensionarImagen(base64Src) { /* ... (función sin cambios) ... */ }
  async function agregarFotoAdicional() { /* ... (función sin cambios) ... */ }
  function limpiarReporte() { /* ... (función sin cambios) ... */ }
  function siguienteModulo() { /* ... (función sin cambios) ... */ }

  cargarYRenderizarReporte();
  agregarFotoBtn.addEventListener("click", agregarFotoAdicional);
  descargarBtn.addEventListener("click", descargarPDF);
  finalizarBtn.addEventListener("click", limpiarReporte);
  siguienteBtn.addEventListener("click", siguienteModulo);
});
