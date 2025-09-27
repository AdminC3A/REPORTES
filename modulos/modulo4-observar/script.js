document.addEventListener("DOMContentLoaded", () => {
    const reporteContainer = document.getElementById("reporte-container");
    const finalizarReporteBtn = document.getElementById("finalizar-reporte");
    const descargarPDFBtn = document.getElementById("descargar-pdf");

    // Función para cargar y mostrar el reporte
    function cargarReporte() {
        const reporte = JSON.parse(localStorage.getItem("reporte"));

        if (!reporte || Object.keys(reporte).length === 0) {
            reporteContainer.innerHTML = "<p>No se encontró información del reporte.</p>";
            return;
        }

        let contenidoHTML = "";

        for (const [modulo, datos] of Object.entries(reporte)) {
            contenidoHTML += `<div class="modulo"><h3>${modulo.toUpperCase()}</h3><ul>`;

            for (const [clave, valor] of Object.entries(datos)) {
                if (valor === null || valor === undefined || valor === "") continue;

                if (clave === "imagen" && valor.startsWith("data:image")) {
                    contenidoHTML += `<li><strong>${clave}:</strong><br><img src="${valor}" alt="Imagen cargada" class="imagen-reporte"></li>`;
                } else if (modulo === "modulo3" && clave === "llave") {
                    contenidoHTML += `<li><strong>${clave}:</strong> VALIDADA</li>`;
                } else {
                    contenidoHTML += `<li><strong>${clave}:</strong> ${Array.isArray(valor) ? valor.join(", ") : valor}</li>`;
                }
            }

            // Si no hay "llave" y el rol no es Externo
            if (
                modulo === "modulo3" &&
                !("llave" in datos) &&
                datos.rolSeleccionado !== "Externo"
            ) {
                contenidoHTML += `<li><strong>llave:</strong> NO VALIDADO</li>`;
            }

            contenidoHTML += "</ul></div>";
        }

        reporteContainer.innerHTML = contenidoHTML;
    }

    // Botón para finalizar el reporte
    finalizarReporteBtn.addEventListener("click", () => {
        const confirmar = confirm("¿Estás seguro de que quieres finalizar el reporte? Esto enviará el reporte para su tratamiento.");
        if (confirmar) {
            localStorage.removeItem("reporte");
            alert("Se procede a registrar.");
            window.location.href = "/";
        }
    });

    // Botón para descargar el PDF
    descargarPDFBtn.addEventListener("click", async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const reporte = JSON.parse(localStorage.getItem("reporte"));

        if (!reporte || Object.keys(reporte).length === 0) {
            alert("No hay información para generar el PDF.");
            return;
        }

        let y = 10;
        doc.setFontSize(14);
        doc.text("📋 Reporte de Seguridad - Bitácora", 10, y);
        y += 10;

        doc.setFontSize(10);

        for (const [modulo, datos] of Object.entries(reporte)) {
            doc.setFont(undefined, "bold");
            doc.text(`${modulo.toUpperCase()}`, 10, y);
            y += 7;

            doc.setFont(undefined, "normal");

            for (const [clave, valor] of Object.entries(datos)) {
                if (!valor) continue;

                if (clave === "imagen" && valor.startsWith("data:image")) {
                    try {
                        const imgProps = await new Promise((resolve) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement("canvas");
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext("2d");
                                ctx.drawImage(img, 0, 0);
                                const imgData = canvas.toDataURL("image/jpeg", 0.5);
                                resolve({ imgData });
                            };
                            img.src = valor;
                        });

                        doc.addImage(imgProps.imgData, "JPEG", 10, y, 50, 30);
                        y += 35;
                        continue;
                    } catch (err) {
                        console.warn("Error al procesar imagen para PDF:", err);
                        continue;
                    }
                }

                if (modulo === "modulo3" && clave === "llave") {
                    doc.text("llave: VALIDADA", 10, y);
                    y += 6;
                    continue;
                }

                const texto = `${clave}: ${Array.isArray(valor) ? valor.join(", ") : valor}`;
                doc.text(texto, 10, y);
                y += 6;

                if (y > 270) {
                    doc.addPage();
                    y = 10;
                }
            }

            if (
                modulo === "modulo3" &&
                !("llave" in datos) &&
                datos.rolSeleccionado !== "Externo"
            ) {
                doc.text("llave: NO VALIDADO", 10, y);
                y += 6;
            }

            y += 4;
        }

        doc.save("ReporteSeguridad_QR.pdf");
    });

    cargarReporte();
});
