document.addEventListener("DOMContentLoaded", () => {
  const reporteContainer = document.getElementById("reporte-container");
  const finalizarBtn = document.getElementById("finalizar-reporte");
  const descargarBtn = document.getElementById("descargar-pdf");
  const siguienteBtn = document.getElementById("siguiente-modulo");
  const agregarFotoBtn = document.getElementById("agregar-foto");

  /**
   * Carga y muestra los datos del reporte desde localStorage.
   */
  function cargarYRenderizarReporte() {
    const reporte = JSON.parse(localStorage.getItem("reporte"));

    if (!reporte || Object.keys(reporte).length === 0) {
      reporteContainer.innerHTML = "<p>No se encontró información del reporte.</p>";
      return;
    }

    let html = "";
    html += `<p><strong>Fecha de visualización:</strong> ${new Date().toLocaleString()}</p>`;

    // --- Muestra los datos de los módulos ---
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

    // --- Lógica para mostrar las imágenes ---
    let todasLasImagenes = [];
    if (reporte.modulo2?.imagenes) {
      todasLasImagenes = reporte.modulo2.imagenes;
    }

    if (todasLasImagenes.length > 0) {
      html += `<h3>🖼️ Evidencia Fotográfica</h3>`;
      html += `<div class="fotos-galeria">`; // Contenedor flex para la galería
      todasLasImagenes.forEach((imgBase64, index) => {
        // Cada imagen ahora va dentro de un .imagen-wrapper
        html += `
          <div class="imagen-wrapper">
            <img class="imagen-reporte" src="${imgBase64}" alt="Imagen ${index + 1}" />
          </div>`;
      });
      html += `</div>`; // Cierra .fotos-galeria
    }

    reporteContainer.innerHTML = html;
  }

  /**
   * Redimensiona una imagen a un tamaño máximo manteniendo la proporción.
   * @param {string} base64Src - La imagen en formato base64.
   * @returns {Promise<string>} Una promesa que se resuelve con la nueva imagen en base64.
   */
  function redimensionarImagen(base64Src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 800; // Ancho máximo deseado
        const MAX_HEIGHT = 600; // Alto máximo deseado

        let width = img.width;
        let height = img.height;

        // Calcula las nuevas dimensiones manteniendo la proporción
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

        // Convierte el canvas a base64 con calidad optimizada
        resolve(canvas.toDataURL("image/jpeg", 0.8)); // Calidad 80% para jpeg
      };
      img.src = base64Src;
    });
  }

  /**
   * Abre el selector de archivos para agregar una nueva foto, la redimensiona y la guarda.
   */
  async function agregarFotoAdicional() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Prioriza la cámara trasera en móviles

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

  /**
   * Genera y descarga un PDF del contenido del reporte.
   */
  function descargarPDF() {
    const element = document.getElementById("reporte");
    const fecha = new Date().toISOString().split("T")[0];
    const hora = new Date().toLocaleTimeString("es-MX", { hour12: false }).replace(/:/g, "-");
    const nombreArchivo = `ReporteSeguridad_${fecha}_${hora}.pdf`;
    
    // Opciones para html2pdf ajustadas para mejor calidad y compatibilidad
    const opt = {
      margin: 10,
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 }, // Calidad más alta para la imagen en el PDF
      html2canvas: { 
        scale: 2, // Aumenta la resolución de la captura
        useCORS: true, 
        scrollY: 0 // Asegura que se renderiza desde el inicio del elemento
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        // Opcional: añadir un encabezado y pie de página simple en jsPDF
        // Si necesitas algo más complejo, habría que integrar directamente con jsPDF
        // para dibujar texto y líneas en cada página.
      }
    };

    html2pdf().set(opt).from(element).save();
  }

  /**
   * Limpia el reporte de localStorage y redirige al primer módulo.
   */
  function limpiarReporte() {
    const confirmacion = confirm("¿Estás seguro de que deseas finalizar y borrar este reporte?");
    if (confirmacion) {
        localStorage.removeItem("reporte");
        // Asegúrate de que esta URL sea la correcta para el primer módulo
        window.location.href = "../modulo1-qr/"; 
    }
  }

  /**
   * Redirige al siguiente módulo del flujo.
   */
  function siguienteModulo() {
    // Asegúrate de que esta URL sea la correcta para el siguiente módulo
    window.location.href = "../modulo5-corregir/"; 
  }
  
  /**
   * Procesa las imágenes iniciales (si vienen de un módulo anterior) para asegurar
   * que estén redimensionadas y almacenadas en el formato unificado (array 'imagenes').
   * Esto se ejecuta una sola vez al cargar la página.
   */
  async function estandarizarImagenesIniciales() {
    const reporte = JSON.parse(localStorage.getItem("reporte")) || {};

    if (reporte.modulo2) {
      // Si aún existe la imagen 'suelta' original de modulo2.imagen
      if (reporte.modulo2.imagen) {
        const imgRedimensionada = await redimensionarImagen(reporte.modulo2.imagen);
        
        // Inicializa el array si no existe
        if (!Array.isArray(reporte.modulo2.imagenes)) {
          reporte.modulo2.imagenes = [];
        }
        // Agrega la imagen redimensionada al principio del array
        reporte.modulo2.imagenes.unshift(imgRedimensionada); 
        
        // Elimina la propiedad antigua para evitar duplicados y mantener el formato unificado
        delete reporte.modulo2.imagen; 
        
        localStorage.setItem("reporte", JSON.stringify(reporte));
      }
    }
    // Después de estandarizar, o si no había nada que estandarizar, renderiza el reporte
    cargarYRenderizarReporte();
  }


  // --- Inicialización y Eventos ---
  // Llama a la función que corrige el formato de las imágenes iniciales y luego renderiza
  estandarizarImagenesIniciales(); 
  
  agregarFotoBtn.addEventListener("click", agregarFotoAdicional);
  descargarBtn.addEventListener("click", descargarPDF);
  finalizarBtn.addEventListener("click", limpiarReporte);
  siguienteBtn.addEventListener("click", siguienteModulo);
});
