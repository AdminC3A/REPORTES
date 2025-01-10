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
                    ctx.drawImage(img, 0, 0, fotoContainer.width, fotoContainer.height);
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
                    imagenSeleccionada = img;
                    guardarImagenEnLocalStorage(e.target.result);

                    const ctxFoto = fotoContainer.getContext("2d");
                    ctxFoto.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctxFoto.beginPath();
                    ctxFoto.arc(75, 75, 75, 0, Math.PI * 2, true);
                    ctxFoto.closePath();
                    ctxFoto.clip();
                    ctxFoto.drawImage(img, 0, 0, 150, 150);
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

// Validar y continuar al siguiente módulo
nextButton.addEventListener("click", () => {
    const seleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(input => input.value);
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
