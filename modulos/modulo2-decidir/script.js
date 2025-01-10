const cargarFotoArchivoBtn = document.getElementById("cargarFotoArchivoBtn");
const cargarFotoCamaraBtn = document.getElementById("cargarFotoCamaraBtn");
const fotoContainer = document.getElementById("fotoContainer");
const riesgoOpciones = document.getElementById("riesgoOpciones");
const clasificacionFieldset = document.getElementById("clasificacionFieldset");
const nextButton = document.getElementById("next");
const otrosDetalleInput = document.getElementById("otros-detalle");
let imagenSeleccionada = null;

// Función para guardar en Local Storage
function guardarEnLocalStorage(modulo, datos) {
    let reporte = JSON.parse(localStorage.getItem("reporte")) || {};
    reporte[modulo] = { ...reporte[modulo], ...datos };
    localStorage.setItem("reporte", JSON.stringify(reporte));
    console.log(`Datos del ${modulo} guardados:`, datos);
}

// Función para mostrar las opciones después de cargar la foto
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

// Mostrar clasificación después de seleccionar riesgos
document.querySelectorAll('input[name="riesgo"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const seleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
            (input) => input.value
        );

        guardarEnLocalStorage("modulo2", { riesgos: seleccionados });

        if (seleccionados.length > 0) {
            clasificacionFieldset.style.display = "block";
            clasificacionFieldset.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Mostrar botón "Siguiente" después de seleccionar clasificación
document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        const clasificacion = document.querySelector('input[name="clasificacion"]:checked')?.value;

        if (clasificacion) {
            guardarEnLocalStorage("modulo2", { clasificacionSeleccionada: clasificacion });
            nextButton.style.display = "block";
            nextButton.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Validar y continuar al siguiente módulo
nextButton.addEventListener("click", () => {
    const seleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
        (input) => input.value
    );
    const clasificacion = document.querySelector('input[name="clasificacion"]:checked')?.value;

    if (!imagenSeleccionada) {
        alert("Por favor carga una imagen antes de continuar.");
        return;
    }

    if (seleccionados.length === 0) {
        alert("Por favor selecciona al menos un riesgo antes de continuar.");
        return;
    }

    if (seleccionados.includes("Otros") && !otrosDetalleInput.value.trim()) {
        alert("Por favor proporciona detalles para la opción 'Otros'.");
        return;
    }

    if (!clasificacion) {
        alert("Por favor selecciona una clasificación antes de continuar.");
        return;
    }

    guardarEnLocalStorage("modulo2", {
        imagen: imagenSeleccionada.src,
        riesgos: seleccionados,
        detalleOtros: otrosDetalleInput.value.trim(),
        clasificacionSeleccionada: clasificacion,
    });

    window.location.href = "/modulos/modulo3-detener/index.html";
});

// Mostrar tooltips al hacer clic en "?"
document.querySelectorAll(".tooltip").forEach((tooltip) => {
    tooltip.addEventListener("click", () => {
        alert(tooltip.getAttribute("data-tooltip"));
    });
});
