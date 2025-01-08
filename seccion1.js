const nextButton = document.getElementById("next-button");

nextButton.addEventListener("click", () => {
    const riesgo = document.getElementById("riesgo").value;
    const detalleRiesgo = document.getElementById("detalle-riesgo").value;

    if (!riesgo) {
        alert("Por favor, seleccione un riesgo antes de continuar.");
        return;
    }

    // Guardar los datos en localStorage para su uso posterior
    const seccion1Data = {
        riesgo: riesgo,
        detalle: detalleRiesgo,
    };
    localStorage.setItem("seccion1", JSON.stringify(seccion1Data));

    // Ir a la siguiente sección
    window.location.href = "seccion2.html";
});
