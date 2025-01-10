document.addEventListener("DOMContentLoaded", () => {
    const reporteContainer = document.getElementById("reporte-container");
    const finalizarReporteBtn = document.getElementById("finalizar-reporte");

    // Cargar datos desde Local Storage
    function cargarReporte() {
        const reporte = JSON.parse(localStorage.getItem("reporte"));

        if (!reporte) {
            reporteContainer.innerHTML = "<p>No se encontró información del reporte.</p>";
            return;
        }

        // Generar contenido del reporte
        let contenidoHTML = "<ul>";
        for (const [modulo, datos] of Object.entries(reporte)) {
            contenidoHTML += `<li><h3>${modulo.toUpperCase()}</h3><ul>`;
            for (const [clave, valor] of Object.entries(datos)) {
                if (typeof valor === "object") {
                    contenidoHTML += `<li>${clave}: ${JSON.stringify(valor)}</li>`;
                } else {
                    contenidoHTML += `<li>${clave}: ${valor}</li>`;
                }
            }
            contenidoHTML += "</ul></li>";
        }
        contenidoHTML += "</ul>";

        reporteContainer.innerHTML = contenidoHTML;
    }

    // Finalizar reporte y limpiar datos
    finalizarReporteBtn.addEventListener("click", () => {
        const confirmar = confirm("¿Estás seguro de que quieres finalizar el reporte? Esto borrará los datos almacenados.");
        if (confirmar) {
            localStorage.removeItem("reporte");
            alert("Reporte finalizado y datos eliminados.");
            window.location.href = "/"; // Redirigir a la página de inicio
        }
    });

    // Inicializar el módulo cargando el reporte
    cargarReporte();
});
