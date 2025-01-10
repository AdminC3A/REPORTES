document.addEventListener("DOMContentLoaded", () => {
    const reporteContainer = document.getElementById("reporte-container");
    const finalizarReporteBtn = document.getElementById("finalizar-reporte");

    // Función para cargar y mostrar el reporte
    function cargarReporte() {
        // Obtener el reporte almacenado en Local Storage
        const reporte = JSON.parse(localStorage.getItem("reporte"));

        // Validar si no hay datos en el reporte
        if (!reporte || Object.keys(reporte).length === 0) {
            reporteContainer.innerHTML = "<p>No se encontró información del reporte.</p>";
            return;
        }

        let contenidoHTML = "";

        // Iterar sobre los módulos y mostrar datos
        for (const [modulo, datos] of Object.entries(reporte)) {
            contenidoHTML += `<div class="modulo"><h3>${modulo.toUpperCase()}</h3><ul>`;
            for (const [clave, valor] of Object.entries(datos)) {
                if (valor === null || valor === undefined || valor === "") continue; // Omitir valores vacíos
                if (clave === "imagen" && valor.startsWith("data:image")) {
                    // Renderizar imágenes correctamente
                    contenidoHTML += `<li><strong>${clave}:</strong><br><img src="${valor}" alt="Imagen cargada" class="imagen-reporte"></li>`;
                } else {
                    // Mostrar texto u otros valores
                    contenidoHTML += `<li><strong>${clave}:</strong> ${Array.isArray(valor) ? valor.join(", ") : valor}</li>`;
                }
            }
            contenidoHTML += "</ul></div>";
        }

        // Mostrar el contenido en el contenedor
        reporteContainer.innerHTML = contenidoHTML;
    }

    // Manejo del botón para finalizar el reporte
    finalizarReporteBtn.addEventListener("click", () => {
        const confirmar = confirm("¿Estás seguro de que quieres finalizar el reporte? Esto borrará los datos almacenados.");
        if (confirmar) {
            localStorage.removeItem("reporte");
            alert("Reporte finalizado y datos eliminados.");
            window.location.href = "/"; // Redirigir a la página inicial
        }
    });

    // Cargar el reporte al iniciar el módulo
    cargarReporte();
});
