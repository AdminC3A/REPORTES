document.addEventListener("DOMContentLoaded", () => {
    const reporteContainer = document.getElementById("reporte-container");
    const finalizarReporteBtn = document.getElementById("finalizar-reporte");

  // Función para enmascarar completamente la llave
function enmascararLlave(llave) {
    if (!llave) return "No disponible";
    return llave.replace(/./g, "*"); // Reemplazar cada carácter con un asterisco
}

    // Función para cargar y mostrar el reporte
    function cargarReporte() {
        const reporte = JSON.parse(localStorage.getItem("reporte"));

        if (!reporte) {
            reporteContainer.innerHTML = "<p>No se encontró información del reporte.</p>";
            return;
        }

        let contenidoHTML = "";

        // Iterar sobre los módulos del reporte
        for (const [modulo, datos] of Object.entries(reporte)) {
            contenidoHTML += `<div class="modulo"><h3>${modulo.toUpperCase()}</h3><ul>`;
            for (const [clave, valor] of Object.entries(datos)) {
                if (valor === null || valor === undefined || valor === "") continue; // Omitir valores nulos o vacíos

                if (clave === "llave") {
                    contenidoHTML += `<li><strong>${clave}:</strong> ${enmascararLlave(valor)}</li>`;
                } else if (clave === "imagen" && valor.startsWith("data:image")) {
                    contenidoHTML += `<li><strong>${clave}:</strong><br><img src="${valor}" alt="Imagen cargada" class="imagen-reporte"></li>`;
                } else {
                    contenidoHTML += `<li><strong>${clave}:</strong> ${Array.isArray(valor) ? valor.join(", ") : valor}</li>`;
                }
            }
            contenidoHTML += "</ul></div>";
        }

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

    // Inicializar el módulo
    cargarReporte();
});
