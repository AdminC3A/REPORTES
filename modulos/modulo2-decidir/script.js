// Referencias a elementos del DOM
const cargarFotoArchivoBtn = document.getElementById("cargarFotoArchivoBtn");
const cargarFotoCamaraBtn = document.getElementById("cargarFotoCamaraBtn");
const fotoContainer = document.getElementById("fotoContainer");
const riesgoOpciones = document.getElementById("riesgoOpciones");
const clasificacionFieldset = document.getElementById("clasificacionFieldset");
const nextButton = document.getElementById("next");
const detalleRiesgoInput = document.getElementById("detalle-riesgo");
const detalleClasificacionInput = document.getElementById("detalle-otra-clasificacion");
let imagenSeleccionada = null;

// Función para guardar datos en Local Storage
function guardarEnLocalStorage(modulo, datos) {
    let reporte = JSON.parse(localStorage.getItem("reporte")) || {};
    reporte[modulo] = { ...reporte[modulo], ...datos };
    localStorage.setItem("reporte", JSON.stringify(reporte));
    console.log(`Datos del ${modulo} guardados:`, datos);
}

// Función para mostrar opciones de riesgos después de cargar una foto
function mostrarOpciones() {
    fotoContainer.style.display = "block";
    riesgoOpciones.style.display = "block";
    riesgoOpciones.scrollIntoView({ behavior: "smooth" });
}

/**
 * Cargar foto desde archivo
 */
cargarFotoArchivoBtn.addEventListener("click", () => {
    const imagenInput = document.createElement("input");
    imagenInput.type = "file";
    imagenInput.accept = "image/*";
    imagenInput.click();

    imagenInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    imagenSeleccionada = img;
                    guardarEnLocalStorage("modulo2", { imagen: e.target.result });

                    const ctxFoto = fotoContainer.getContext("2d");
                    ctxFoto.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctxFoto.drawImage(img, 0, 0, fotoContainer.width, fotoContainer.height);
                    mostrarOpciones();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

/**
 * Cargar foto desde cámara
 */
cargarFotoCamaraBtn.addEventListener("click", () => {
    const cameraInput = document.createElement("input");
    cameraInput.type = "file";
    cameraInput.accept = "image/*";
    cameraInput.capture = "environment";

    document.body.appendChild(cameraInput);
    cameraInput.click();

    cameraInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    imagenSeleccionada = img;
                    guardarEnLocalStorage("modulo2", { imagen: e.target.result });

                    const ctxFoto = fotoContainer.getContext("2d");
                    ctxFoto.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctxFoto.drawImage(img, 0, 0, fotoContainer.width, fotoContainer.height);
                    mostrarOpciones();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    cameraInput.addEventListener("blur", () => {
        document.body.removeChild(cameraInput);
    });
});

// Guardar datos de riesgos y detalles
document.querySelectorAll('input[name="riesgo"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const riesgosSeleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
            (input) => input.value
        );

        // Validar si el riesgo "Otros" está seleccionado
        if (riesgosSeleccionados.includes("Otros") && !detalleRiesgoInput.value.trim()) {
            alert("Por favor proporciona detalles adicionales para 'Otros'.");
            return;
        }

        // Guardar riesgos seleccionados y detalle general
        guardarEnLocalStorage("modulo2", {
            riesgosSeleccionados,
            detalleRiesgo: detalleRiesgoInput.value.trim(),
        });

        // Mostrar clasificación si hay al menos un riesgo seleccionado
        if (riesgosSeleccionados.length > 0) {
            clasificacionFieldset.style.display = "block";
            clasificacionFieldset.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Guardar datos de clasificación y su detalle
document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        const clasificacionSeleccionada = document.querySelector('input[name="clasificacion"]:checked')?.value;

        // Validar si se seleccionó "Otra Clasificación" sin detalle
        if (clasificacionSeleccionada === "Otra Clasificación" && !detalleClasificacionInput.value.trim()) {
            alert("Por favor proporciona detalles para 'Otra Clasificación'.");
            return;
        }

        // Guardar clasificación seleccionada y su detalle
        guardarEnLocalStorage("modulo2", {
            clasificacionSeleccionada,
            detalleClasificacion: detalleClasificacionInput.value.trim(),
        });

        nextButton.style.display = "block";
        nextButton.scrollIntoView({ behavior: "smooth" });
    });
});

// Validar y continuar al siguiente módulo
nextButton.addEventListener("click", () => {
    const riesgosSeleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
        (input) => input.value
    );
    const clasificacionSeleccionada = document.querySelector('input[name="clasificacion"]:checked')?.value;

    // Validaciones antes de continuar
    if (!imagenSeleccionada) {
        alert("Por favor carga una imagen antes de continuar.");
        return;
    }

    if (riesgosSeleccionados.length === 0) {
        alert("Por favor selecciona al menos un riesgo antes de continuar.");
        return;
    }

    if (riesgosSeleccionados.includes("Otros") && !detalleRiesgoInput.value.trim()) {
        alert("Por favor proporciona detalles adicionales para 'Otros'.");
        return;
    }

    if (clasificacionSeleccionada === "Otra Clasificación" && !detalleClasificacionInput.value.trim()) {
        alert("Por favor proporciona detalles para 'Otra Clasificación'.");
        return;
    }

    // Guardar datos en Local Storage y redirigir
    guardarEnLocalStorage("modulo2", {
        imagen: imagenSeleccionada.src,
        riesgosSeleccionados,
        detalleRiesgo: detalleRiesgoInput.value.trim(),
        clasificacionSeleccionada,
        detalleClasificacion: clasificacionSeleccionada === "Otra Clasificación" ? detalleClasificacionInput.value.trim() : null,
    });

    window.location.href = "/modulos/modulo3-detener/index.html";
});

// Mejor interacción para tooltips
document.querySelectorAll(".tooltip").forEach((tooltip) => {
    tooltip.addEventListener("mouseenter", () => {
        const message = document.createElement("div");
        message.className = "tooltip-message";
        message.textContent = tooltip.getAttribute("data-tooltip");
        tooltip.appendChild(message);
    });

    tooltip.addEventListener("mouseleave", () => {
        tooltip.querySelector(".tooltip-message")?.remove();
    });
});
