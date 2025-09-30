

        if (reporte.fotosAdicionales && Array.isArray(reporte.fotosAdicionales)) {
            reporte.fotosAdicionales.forEach((img, i) => {
                contenidoHTML += `<img src="${img}" alt="Foto adicional ${i + 1}" class="imagen-reporte" />`;
            });
        }

        reporteContainer.innerHTML = contenidoHTML;
    }

    // Agregar foto adicional
    agregarFotoBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.click();

        input.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
                    if (!reporte.fotosAdicionales) {
                        reporte.fotosAdicionales = [];
                    }
                    reporte.fotosAdicionales.push(e.target.result);
                    localStorage.setItem("reporte", JSON.stringify(reporte));
                    cargarReporte();
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Descargar PDF
    descargarPDFBtn.addEventListener("click", async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const reporte = JSON.parse(localStorage.getItem("reporte"));
        if (!reporte) return;

        let y = 10;
        doc.setFontSize(16);
        doc.text("📋 Reporte de Seguridad", 10, y);
        y += 10;

        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 10, y);
        y += 10;

        if (reporte.modulo1?.codigoQR) {
            doc.setFont(undefined, "bold");
            doc.text("Código QR Escaneado", 10, y);
            y += 6;
            doc.setFont(undefined, "normal");
            doc.text(`QR: ${reporte.modulo1.codigoQR}`, 10, y);
            y += 6;
        }

        if (reporte.modulo2) {
            doc.setFont(undefined, "bold");
            doc.text("Riesgos Detectados", 10, y);
            y += 6;
            doc.setFont(undefined, "normal");
            if (reporte.modulo2.riesgos) {
                doc.text(`Riesgos: ${reporte.modulo2.riesgos.join(", ")}`, 10, y);
                y += 6;
            }
            if (reporte.modulo2.detalleOtros) {
                doc.text(`Detalle de "Otros": ${reporte.modulo2.detalleOtros}`, 10, y);
                y += 6;
            }
            if (reporte.modulo2.clasificacionSeleccionada) {
                doc.text(`Clasificación: ${reporte.modulo2.clasificacionSeleccionada}`, 10, y);
                y += 6;
            }
        }

        if (reporte.modulo3) {
            doc.setFont(undefined, "bold");
            doc.text("Información del Reportante", 10, y);
            y += 6;
            doc.setFont(undefined, "normal");
            doc.text(`Rol: ${reporte.modulo3.rolSeleccionado}`, 10, y);
            y += 6;
            if (reporte.modulo3.rolSeleccionado !== "Externo") {
                doc.text(`Llave: ${"llave" in reporte.modulo3 ? "VALIDADA" : "NO VALIDADO"}`, 10, y);
                y += 6;
            }
            if (reporte.modulo3.descripcion) {
                doc.text(`Descripción: ${reporte.modulo3.descripcion}`, 10, y);
                y += 6;
            }
            if (reporte.modulo3.observacionesAdicionales) {
                doc.text(`Observaciones: ${reporte.modulo3.observacionesAdicionales}`, 10, y);
                y += 6;
            }
        }

        const imagenesM2 = Array.isArray(reporte.modulo2?.imagenes)
            ? reporte.modulo2.imagenes
            : reporte.modulo2?.imagen
            ? [reporte.modulo2.imagen]
            : [];

        const imagenesExtras = reporte.fotosAdicionales || [];
        const todas = [...imagenesM2, ...imagenesExtras];

        for (const img of todas) {
            const image = new Image();
            image.src = img;
            await new Promise((res) => (image.onload = res));
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            const resized = canvas.toDataURL("image/jpeg", 0.5);
            doc.addImage(resized, "JPEG", 10, y, 60, 40);
            y += 45;
            if (y > 270) {
                doc.addPage();
                y = 10;
            }
        }

        doc.save("ReporteSeguridad_QR.pdf");
    });

    // Finalizar y reiniciar
    finalizarReporteBtn.addEventListener("click", () => {
        localStorage.removeItem("reporte");
        alert("Reporte finalizado.");
        window.location.href = "/modulos/modulo1-qr/";
    });

    // Iniciar
    cargarReporte();
});
