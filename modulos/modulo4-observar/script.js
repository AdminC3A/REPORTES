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

  async function cargarYRenderizarReporte() {
    try {
      const response = await fetch('/data/roles.json');
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
      reporteContainer.innerHTML = html;

    } catch (error) {
      console.error("Error al cargar el reporte:", error);
      reporteContainer.innerHTML = "<p>Error al cargar la información del reporte. Verifique la consola.</p>";
    }
  }
  
  // ==================================================================
  // == FUNCIÓN DESCARGAR PDF (ESTRATEGIA FINAL CON IFRAME AISLADO) ==
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

      // 1. Construir el HTML completo del reporte para el iframe
      let reporteHtml = `
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          h1 { color: #0056b3; text-align: center; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
          h3 { color: #0056b3; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .fotos-galeria { display: flex; flex-wrap: wrap; gap: 10px; page-break-inside: avoid; }
          .imagen-wrapper { width: 250px; height: 180px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; overflow: hidden; page-break-inside: avoid; }
          .imagen-reporte { max-width: 100%; max-height: 100%; }
        </style>
        <h1>Reporte de Incidencias de Seguridad</h1>
      `;
      reporteHtml += generarHtmlDelReporte(reporte, rolesData); // Usamos la función que ya teníamos

      // 2. Crear un iframe invisible
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      // 3. Escribir el HTML en el iframe y esperar a que cargue
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(reporteHtml);
      iframeDoc.close();

      await new Promise(resolve => {
        iframe.onload = () => resolve();
      });

      // 4. Configurar y generar el PDF desde el iframe
      const fecha = new Date().toISOString().split("T")[0];
      const hora = new Date().toLocaleTimeString("es-MX", { hour12: false }).replace(/:/g, "-");
      const nombreArchivo = `ReporteSeguridad_${fecha}_${hora}.pdf`;
      
      const opt = { 
          margin: 15, 
          filename: nombreArchivo, 
          image: { type: 'jpeg', quality: 0.98 }, 
          html2canvas: { scale: 2, useCORS: true, logging: false }, 
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
      };

      await html2pdf().from(iframe.contentWindow.document.body).set(opt).save();
      
      // 5. Limpiar: remover el iframe
      document.body.removeChild(iframe);

    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Ocurrió un error al crear el PDF. Revisa la consola.");
    } finally {
      setEstadoCarga(false);
    }
  }

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
