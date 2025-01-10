// Referencias al DOM
const cargarFotoArchivoBtn = document.getElementById("cargarFotoArchivoBtn");
const cargarFotoCamaraBtn = document.getElementById("cargarFotoCamaraBtn");
const fotoContainer = document.getElementById("fotoContainer");
const riesgoOpciones = document.getElementById("riesgoOpciones");
const clasificacionFieldset = document.getElementById("clasificacionFieldset");
const nextButton = document.getElementById("next");
const otrosDetalleInput = document.getElementById("otros-detalle");
const detalleClasificacionInput = document.getElementById("detalle-otra-clasificacion");
let imagenSeleccionada = null;

// Función para guardar en Local Storage
function guardarEnLocalStorage(modulo, datos) {
    const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
    reporte[modulo] = { ...reporte[modulo], ...datos };
    localStorage.setItem("reporte", JSON.stringify(reporte));
}

// Función para mostrar las opciones después de cargar la foto
function mostrarOpciones() {
    fotoContainer.style.display = "block";
    riesgoOpciones.style.display = "block";
    riesgoOpciones.scrollIntoView({ behavior: "smooth" });
}

// Función para guardar la imagen en Local Storage
function guardarImagenEnLocalStorage(imagenData) {
    guardarEnLocalStorage("modulo2", { imagen: imagenData });
}

// Cargar Foto desde Archivo
cargarFotoArchivoBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const ctx = fotoContainer.getContext("2d");
                    ctx.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctx.drawImage(
                        img,
                        0, 0,
                        fotoContainer.width, fotoContainer.height
                    ); // Imagen centrada en forma de cuadro
                    fotoContainer.style.display = "block";
                    imagenSeleccionada = img;
                    guardarImagenEnLocalStorage(e.target.result);
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
    cameraInput.capture = "environment"; // Solicita cámara trasera
    cameraInput.style.display = "none";

    document.body.appendChild(cameraInput);
    cameraInput.click();

    cameraInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const ctxFoto = fotoContainer.getContext("2d");
                    ctxFoto.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctxFoto.drawImage(
                        img,
                        0, 0,
                        fotoContainer.width, fotoContainer.height
                    ); // Imagen centrada en forma de cuadro
                    fotoContainer.style.display = "block";
                    imagenSeleccionada = img;
                    guardarImagenEnLocalStorage(e.target.result);
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

// Manejo de selección de riesgos
document.querySelectorAll('input[name="riesgo"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const seleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
            (input) => input.value
        );

        if (seleccionados.includes("Otros")) {
            otrosDetalleInput.style.display = "block";
        } else {
            otrosDetalleInput.style.display = "none";
        }

        // Mostrar clasificación si hay al menos un riesgo seleccionado
        if (seleccionados.length > 0) {
            clasificacionFieldset.style.display = "block";
            clasificacionFieldset.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Manejo de selección de clasificación
document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        const clasificacionSeleccionada = document.querySelector('input[name="clasificacion"]:checked')?.value;
        if (clasificacionSeleccionada === "Otra Clasificación") {
            detalleClasificacionInput.style.display = "block";
        } else {
            detalleClasificacionInput.style.display = "none";
        }
        nextButton.style.display = "block";
        nextButton.scrollIntoView({ behavior: "smooth" });
    });
});

// Validar y continuar al siguiente módulo
nextButton.addEventListener("click", () => {
    const seleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
        (input) => input.value
    );
    const clasificacionSeleccionada = document.querySelector('input[name="clasificacion"]:checked')?.value;

    if (!imagenSeleccionada) {
        alert("Por favor carga una imagen antes de continuar.");
        return;
    }

    if (seleccionados.length === 0) {
        alert("Por favor selecciona al menos un riesgo antes de continuar.");
        return;
    }

    if (seleccionados.includes("Otros") && !otrosDetalleInput.value.trim()) {
        alert("Por favor proporciona detalles para 'Otros'.");
        return;
    }

    if (clasificacionSeleccionada === "Otra Clasificación" && !detalleClasificacionInput.value.trim()) {
        alert("Por favor proporciona detalles para 'Otra Clasificación'.");
        return;
    }

    guardarEnLocalStorage("modulo2", {
        imagen: imagenSeleccionada.src,
        riesgos: seleccionados,
        detalleOtros: otrosDetalleInput.value.trim(),
        clasificacionSeleccionada,
        detalleClasificacion: clasificacionSeleccionada === "Otra Clasificación" ? detalleClasificacionInput.value.trim() : null,
    });

    window.location.href = "/modulos/modulo3-detener/index.html";
});
