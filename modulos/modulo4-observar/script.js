document.addEventListener("DOMContentLoaded", () => {
  const reporteContainer = document.getElementById("reporte-container");
  const descargarBtn = document.getElementById("descargar-pdf");
  const agregarFotoBtn = document.getElementById("agregar-foto");
  const siguienteBtn = document.getElementById("siguiente-modulo");
  const finalizarBtn = document.getElementById("finalizar-reporte");
  const infractorInput = document.getElementById("infractor-input");
  const trabajadorInput = document.getElementById("trabajador-input"); // ✅ Referencia al nuevo campo

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
        if (reporte.modulo2.detalleOtros) html += `<p><strong>Detalle Otros Riesgos:</strong> ${reporte.modulo2.detalleOtros}</p>`;
        if (reporte.modulo2.clasificacionSeleccionada) html += `<p><strong>Clasificación:</strong> ${reporte.modulo2.clasificacionSeleccionada}</p>`;
        if (reporte.modulo2.detalleClasificacion) html += `<p><strong>Detalle Clasificación:</strong> ${reporte.modulo2.detalleClasificacion}</p>`;
      }
      if (reporte.modulo3) {
        html += `<h3>🧑‍💼 Rol de quien Reporta</h3><p><strong>Rol:</strong> ${reporte.modulo3.rolSeleccionado}</p>`;
        if (reporte.modulo3.rolSeleccionado === "Externo") {
            html += `<p><strong>Nombre:</strong> ${reporte.modulo3.nombreExterno || "N/A"}</p>`;
            html += `<p><strong>Teléfono:</strong> ${reporte.modulo3.telefonoExterno || "N/A"}</p>`;
        } else if (reporte.modulo3.llave) {
            html += `<p><strong>Llave:</strong> VALIDADA</p>`;
            const nombrePortador = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
            html += `<p><strong>Portador de la Llave:</strong> ${nombrePortador}</p>`;
        }
        if (reporte.modulo3.descripcion) html += `<p><strong>Descripción:</strong> ${reporte.modulo3.descripcion}</p>`;
        if (reporte.modulo3.observacionesAdicionales) html += `<p><strong>Observaciones:</strong> ${reporte.modulo3.observacionesAdicionales}</p>`;
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
      const infractor = infractorInput.value.trim();
      const trabajador = trabajadorInput.value.trim(); // ✅ Leer el valor del nuevo campo

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(18).setTextColor("#0056b3").text("CTA-EAI Reportes de incidencias en seguridad e higiene", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      const tableRows = [];
      tableRows.push(["Fecha", new Date().toLocaleDateString('es-MX')]);
      if (reporte.modulo1?.codigoQR) tableRows.push(["Código QR", reporte.modulo1.codigoQR]);
      if (reporte.modulo2?.riesgos) tableRows.push(["Riesgos", reporte.modulo2.riesgos.join(", ")]);
      if (reporte.modulo2?.detalleOtros) tableRows.push(["Detalle Otros Riesgos", reporte.modulo2.detalleOtros]);
      if (reporte.modulo2?.clasificacionSeleccionada) tableRows.push(["Clasificación", reporte.modulo2.clasificacionSeleccionada]);
      if (reporte.modulo2?.detalleClasificacion) tableRows.push(["Detalle Clasificación", reporte.modulo2.detalleClasificacion]);
      if (reporte.modulo3?.rolSeleccionado) tableRows.push(["Rol Reporta", reporte.modulo3.rolSeleccionado]);
      if (reporte.modulo3?.rolSeleccionado === "Externo") {
          tableRows.push(["Nombre Externo", reporte.modulo3.nombreExterno || "N/A"]);
          tableRows.push(["Teléfono Externo", reporte.modulo3.telefonoExterno || "N/A"]);
      } else if (reporte.modulo3?.llave) {
        const nombrePortador = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
        tableRows.push(["Portador de Llave", nombrePortador]);
      }
      if (reporte.modulo3?.descripcion) tableRows.push(["Descripción", reporte.modulo3.descripcion]);
      if (reporte.modulo3?.observacionesAdicionales) tableRows.push(["Observaciones", reporte.modulo3.observacionesAdicionales]);
      if (infractor) {
        tableRows.push(["Contratista Infractor", infractor]);
      }
      if (trabajador) {
        tableRows.push(["Nombre del Trabajador", trabajador]); // ✅ Añadir fila a la tabla del PDF
      }
      doc.autoTable({ startY: 30, head: [['Concepto', 'Información']], body: tableRows, theme: 'grid', headStyles: { fillColor: [0, 86, 179] } });
      const todasLasImagenes = reporte.modulo2?.imagenes || [];
      if (todasLasImagenes.length > 0) {
        let finalY = doc.lastAutoTable.finalY || 30;
        doc.setFontSize(14).text("Evidencia Fotográfica", 14, finalY + 15);
        let y = finalY + 20;
        todasLasImagenes.forEach(imgData => { if (y + 65 > doc.internal.pageSize.getHeight()) { doc.addPage(); y = 20; } doc.addImage(imgData, 'JPEG', 14, y, 80, 60); y += 65; });
      }
      const fecha = new Date().toISOString().split("T")[0];
      const hora = new Date().toLocaleTimeString('es-MX', { hour12: false }).replace(/:/g, '-');
      const nombreArchivo = `ReporteSeguridad_${fecha}_${hora}.pdf`;
      doc.save(nombreArchivo);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Ocurrió un error al crear el PDF.");
    } finally {
      setEstadoCarga(false);
    }
  }

  function setEstadoCarga(cargando) {
    const botones = [agregarFotoBtn, descargarBtn, siguienteBtn, finalizarBtn];
    if (cargando) {
      descargarBtn.textContent = "Generando PDF...";
      botones.forEach(btn => btn.disabled = true);
    } else {
      descargarBtn.textContent = "📄 Descargar PDF";
      botones.forEach(btn => btn.disabled = false);
    }
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
          if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
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
        const base64Redimensionada = await redimensionarImagen(e.target.result);
        const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
        reporte.modulo2 = reporte.modulo2 || {};
        if (!Array.isArray(reporte.modulo2.imagenes)) { reporte.modulo2.imagenes = []; }
        reporte.modulo2.imagenes.push(base64Redimensionada);
        localStorage.setItem("reporte", JSON.stringify(reporte));
        cargarYRenderizarReporte();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function limpiarReporte() {
    if (confirm("¿Estás seguro de que deseas finalizar y borrar este reporte?")) {
      localStorage.removeItem("reporte");
      window.location.href = "../modulo1-qr/";
    }
  }

  function siguienteModulo() {
    window.location.href = "../modulo5-corregir/";
  }

  estandarizarImagenesIniciales();
  agregarFotoBtn.addEventListener("click", agregarFotoAdicional);
  descargarBtn.addEventListener("click", descargarPDF);
  finalizarBtn.addEventListener("click", limpiarReporte);
  siguienteBtn.addEventListener("click", siguienteModulo);
});
