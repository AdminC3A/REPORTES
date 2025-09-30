document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("reporte-container");
  const btnDescargar = document.getElementById("descargar-pdf");
  const btnFinalizar = document.getElementById("finalizar-reporte");
  const btnAgregarFoto = document.getElementById("agregar-foto");
  const btnSiguiente = document.getElementById("siguiente-modulo");

  const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
  if (!reporte || Object.keys(reporte).length === 0) {
    container.innerHTML = "<p>No se encontró información del reporte.</p>";
    return;
  }

  let html = "";

  // Módulo 1
  if (reporte.modulo1) {
    html += `<div class="modulo"><h3>Código QR Escaneado</h3><ul>`;
    html += `<li><strong>QR:</strong> ${reporte.modulo1.codigoQR}</li>`;
    html += `</ul></div>`;
  }

  // Módulo 2
  if (reporte.modulo2) {
    html += `<div class="modulo"><h3>Riesgos Detectados</h3><ul>`;
    if (reporte.modulo2.riesgos) {
      html += `<li><strong>Riesgos:</strong> ${reporte.modulo2.riesgos.join(", ")}</li>`;
    }
    if (reporte.modulo2.detalleOtros) {
      html += `<li><strong>Detalle Otros:</strong> ${reporte.modulo2.detalleOtros}</li>`;
    }
    if (reporte.modulo2.clasificacionSeleccionada) {
      html += `<li><strong>Clasificación:</strong> ${reporte.modulo2.clasificacionSeleccionada}</li>`;
    }
    if (reporte.modulo2.detalleClasificacion) {
      html += `<li><strong>Otra Clasificación:</strong> ${reporte.modulo2.detalleClasificacion}</li>`;
    }
    html += `</ul>`;
    if (reporte.modulo2.imagen) {
      html += `<img src="${reporte.modulo2.imagen}" class="imagen-reporte" />`;
    }
    if (reporte.modulo2.fotosAdicionales) {
      reporte.modulo2.fotosAdicionales.forEach(src => {
        html += `<img src="${src}" class="imagen-reporte" />`;
      });
    }
    html += `</div>`;
  }

  // Módulo 3
  if (reporte.modulo3) {
    html += `<div class="modulo"><h3>Información del Reportante</h3><ul>`;
    if (reporte.modulo3.rolSeleccionado) {
      html += `<li><strong>Rol:</strong> ${reporte.modulo3.rolSeleccionado}</li>`;
    }
    if (reporte.modulo3.llave) {
      html += `<li><strong>Llave:</strong> VALIDADA</li>`;
    } else if (reporte.modulo3.rolSeleccionado !== "Externo") {
      html += `<li><strong>Llave:</strong> NO VALIDADA</li>`;
    }
    if (reporte.modulo3.nombreExterno) {
      html += `<li><strong>Nombre:</strong> ${reporte.modulo3.nombreExterno}</li>`;
    }
    if (reporte.modulo3.telefonoExterno) {
      html += `<li><strong>Teléfono:</strong> ${reporte.modulo3.telefonoExterno}</li>`;
    }
    if (reporte.modulo3.descripcion) {
      html += `<li><strong>Descripción:</strong> ${reporte.modulo3.descripcion}</li>`;
    }
    if (reporte.modulo3.observacionesAdicionales) {
      html += `<li><strong>Observaciones:</strong> ${reporte.modulo3.observacionesAdicionales}</li>`;
    }
    html += `</ul></div>`;
  }

  container.innerHTML = html;

  // Descargar PDF
  btnDescargar.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const marginLeft = 15;
    let y = 20;

    doc.setFontSize(14);
    doc.text("📋 Reporte de Seguridad", marginLeft, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, marginLeft, y);
    y += 10;

    const addSection = (title, data) => {
      doc.setFont(undefined, "bold");
      doc.text(title, marginLeft, y);
      y += 6;
      doc.setFont(undefined, "normal");
      data.forEach(line => {
        doc.text(line, marginLeft, y);
        y += 6;
      });
    };

    const mod1 = reporte.modulo1 || {};
    const mod2 = reporte.modulo2 || {};
    const mod3 = reporte.modulo3 || {};

    if (mod1.codigoQR) {
      addSection("Código QR Escaneado", [`QR: ${mod1.codigoQR}`]);
    }

    if (mod2.riesgos || mod2.clasificacionSeleccionada) {
      let riesgoLines = [];
      if (mod2.riesgos) riesgoLines.push(`Riesgos: ${mod2.riesgos.join(", ")}`);
      if (mod2.detalleOtros) riesgoLines.push(`Detalle Otros: ${mod2.detalleOtros}`);
      if (mod2.clasificacionSeleccionada) riesgoLines.push(`Clasificación: ${mod2.clasificacionSeleccionada}`);
      if (mod2.detalleClasificacion) riesgoLines.push(`Otra Clasificación: ${mod2.detalleClasificacion}`);
      addSection("Riesgos Detectados", riesgoLines);
    }

    if (mod3.rolSeleccionado) {
      let infoLines = [`Rol: ${mod3.rolSeleccionado}`];
      if (mod3.llave) {
        infoLines.push("Llave: VALIDADA");
      } else if (mod3.rolSeleccionado !== "Externo") {
        infoLines.push("Llave: NO VALIDADA");
      }
      if (mod3.nombreExterno) infoLines.push(`Nombre: ${mod3.nombreExterno}`);
      if (mod3.telefonoExterno) infoLines.push(`Teléfono: ${mod3.telefonoExterno}`);
      if (mod3.descripcion) infoLines.push(`Descripción: ${mod3.descripcion}`);
      if (mod3.observacionesAdicionales) infoLines.push(`Observaciones: ${mod3.observacionesAdicionales}`);
      addSection("Información del Reportante", infoLines);
    }

    // Imágenes
    const addImage = async (src) => {
      const img = new Image();
      img.src = src;
      await new Promise(resolve => img.onload = resolve);
      const width = 180;
      const ratio = img.height / img.width;
      const height = width * ratio;
      if (y + height > 270) {
        doc.addPage();
        y = 20;
      }
      doc.addImage(img, 'JPEG', marginLeft, y, width, height);
      y += height + 10;
    };

    if (mod2.imagen) await addImage(mod2.imagen);
    if (mod2.fotosAdicionales) {
      for (const src of mod2.fotosAdicionales) {
        await addImage(src);
      }
    }

    const now = new Date();
    const filename = `ReporteSeguridad_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}.pdf`;
    doc.save(filename);
  });

  // Agregar foto adicional
  btnAgregarFoto.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "imagen-reporte";
        container.appendChild(img);

        const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
        reporte.modulo2 = reporte.modulo2 || {};
        reporte.modulo2.fotosAdicionales = reporte.modulo2.fotosAdicionales || [];
        reporte.modulo2.fotosAdicionales.push(e.target.result);
        localStorage.setItem("reporte", JSON.stringify(reporte));
      };

      reader.readAsDataURL(file);
    });
  });

  // Finalizar reporte (volver al módulo 1)
  btnFinalizar.addEventListener("click", () => {
    if (confirm("¿Finalizar reporte y volver al inicio?")) {
      localStorage.removeItem("reporte");
      window.location.href = "/modulos/modulo1-escanear/";
    }
  });

  // Siguiente módulo
  btnSiguiente.addEventListener("click", () => {
    window.location.href = "/modulos/modulo6-enviar/";
  });
});
