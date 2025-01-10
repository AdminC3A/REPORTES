document.addEventListener("DOMContentLoaded", () => {
    const infoContenido = document.getElementById("info-contenido");
    const nextButton = document.getElementById("next");

    // Función para cargar y mostrar información acumulada
    function cargarInformacion() {
        const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
        let contenidoHTML = "";

        // Verificar si hay datos del módulo 1
        if (reporte.modulo1) {
            contenidoHTML += `
                <h3>Módulo 1: Información Inicial</h3>
                <p><strong>Datos del QR:</strong> ${JSON.stringify(reporte.modulo1)}</p>
            `;
        }

        // Verificar si hay datos del módulo 2
        if (reporte.modulo2) {
            contenidoHTML += `
                <h3>Módulo 2: Decisión de Riesgos</h3>
                <p><strong>Imagen:</strong></p>
                <img src="${reporte.modulo2.imagen}" alt="Imagen cargada" style="max-width: 100%; height: auto;">
                <p><strong>Riesgos seleccionados:</strong> ${reporte.modulo2.riesgos.join(", ")}</p>
                ${
                    reporte.modulo2.detalleOtros
                        ? `<p><strong>Detalles de "Otros":</strong> ${reporte.modulo2.detalleOtros}</p>`
                        : ""
                }
            `;
        }

        // Verificar si hay datos del módulo 3
        if (reporte.modulo3) {
            contenidoHTML += `
                <h3>Módulo 3: Validación</h3>
                <p><strong>Rol seleccionado:</strong> ${reporte.modulo3.rolSeleccionado}</p>
                ${
                    reporte.modulo3.nombreExterno
                        ? `<p><strong>Nombre Externo:</strong> ${reporte.modulo3.nombreExterno}</p>`
                        : ""
                }
                ${
                    reporte.modulo3.telefonoExterno
                        ? `<p><strong>Teléfono Externo:</strong> ${reporte.modulo3.telefonoExterno}</p>`
                        : ""
                }
                ${
                    reporte.modulo3.clasificacionSeleccionada
                        ? `<p><strong>Clasificación seleccionada:</strong> ${reporte.modulo3.clasificacionSeleccionada}</p>`
                        : ""
                }
                ${
                    reporte.modulo3.descripcion
                        ? `<p><strong>Descripción:</strong> ${reporte.modulo3.descripcion}</p>`
                        : ""
                }
                ${
                    reporte.modulo3.observacionesAdicionales
                        ? `<p><strong>Observaciones Adicionales:</strong> ${reporte.modulo3.observacionesAdicionales}</p>`
                        : ""
                }
            `;
        }

        // Si no hay datos, mostrar un mensaje
        if (contenidoHTML === "") {
            contenidoHTML = "<p>No se ha recopilado información hasta ahora.</p>";
        }

        // Insertar contenido en la página
        infoContenido.innerHTML = contenidoHTML;
    }

    // Cargar información al cargar la página
    cargarInformacion();

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        window.location.href = "/modulos/modulo5-correcciones/index.html";
    });
});
