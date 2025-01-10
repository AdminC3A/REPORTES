document.addEventListener("DOMContentLoaded", () => {
    // Obtener los datos actuales del reporte
    const reporte = JSON.parse(localStorage.getItem("reporte")) || {};

    // Eliminar datos residuales específicos del módulo 2
    if (reporte.modulo2) {
        delete reporte.modulo2; // Eliminar los datos del módulo 2
        localStorage.setItem("reporte", JSON.stringify(reporte)); // Guardar el reporte actualizado
        console.log("Datos del módulo 2 eliminados.");
    }
// Referencias al DOM
const cargarFotoArchivoBtn = document.getElementById("cargarFotoArchivoBtn");
const cargarFotoCamaraBtn = document.getElementById("cargarFotoCamaraBtn");
const fotoContainer = document.getElementById("fotoContainer");
const riesgoOpciones = document.getElementById("riesgoOpciones");
const clasificacionFieldset = document.getElementById("clasificacionFieldset");
const nextButton = document.getElementById("next");
const detalleRiesgoInput = document.getElementById("detalle-riesgo");
const detalleClasificacionInput = document.getElementById("detalle-otra-clasificacion");
let imagenSeleccionada = null;

// Función para guardar en Local Storage
function guardarEnLocalStorage(modulo, datos) {
    const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
    reporte[modulo] = { ...reporte[modulo], ...datos };
    localStorage.setItem("reporte", JSON.stringify(reporte));
}

// Función para mostrar una sección
function mostrarSeccion(seccion) {
    seccion.classList.remove("hidden");
    seccion.scrollIntoView({ behavior: "smooth" });
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
                    guardarEnLocalStorage("modulo2", { imagen: e.target.result });
                    mostrarSeccion(riesgoOpciones);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Cargar Foto desde Cámara
cargarFotoCamaraBtn.addEventListener("click", () => {
    const cameraInput = document.createElement("input");
    cameraInput.type = "file";
    cameraInput.accept = "image/*";
    cameraInput.capture = "environment";
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
                    const ctx = fotoContainer.getContext("2d");
                    ctx.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctx.drawImage(img, 0, 0, fotoContainer.width, fotoContainer.height);
                    fotoContainer.style.display = "block";
                    imagenSeleccionada = img;
                    guardarEnLocalStorage("modulo2", { imagen: e.target.result });
                    mostrarSeccion(riesgoOpciones);
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
            detalleRiesgoInput.style.display = "block";
        } else {
            detalleRiesgoInput.style.display = "none";
        }

        if (seleccionados.length > 0) {
            mostrarSeccion(clasificacionFieldset);
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
        mostrarSeccion(nextButton);
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

    if (seleccionados.includes("Otros") && !detalleRiesgoInput.value.trim()) {
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
        detalleOtros: detalleRiesgoInput.value.trim(),
        clasificacionSeleccionada,
        detalleClasificacion: clasificacionSeleccionada === "Otra Clasificación" ? detalleClasificacionInput.value.trim() : null,
    });

    window.location.href = "/modulos/modulo3-detener/index.html";
});
