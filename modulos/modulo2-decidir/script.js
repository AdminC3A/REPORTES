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

// Tooltips
const tooltipComments = document.createElement("div");
tooltipComments.className = "tooltip-comment";
document.body.appendChild(tooltipComments);

// Mostrar y ocultar comentarios flotantes
document.querySelectorAll(".tooltip").forEach((tooltip) => {
    tooltip.addEventListener("click", () => {
        tooltipComments.textContent = tooltip.getAttribute("data-tooltip");
        tooltipComments.classList.add("visible");
        setTimeout(() => tooltipComments.classList.remove("visible"), 3000);
    });
});

// Función para mostrar secciones dinámicamente
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
                    mostrarSeccion(riesgoOpciones);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Cargar Foto desde Cámara
cargarFotoCamaraBtn.addEventListener("click", async () => {
    try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const videoElement = document.createElement("video");
        videoElement.srcObject = videoStream;
        videoElement.autoplay = true;

        const captureCanvas = document.createElement("canvas");
        const captureContext = captureCanvas.getContext("2d");

        // Crear un botón para tomar la foto
        const captureButton = document.createElement("button");
        captureButton.textContent = "Tomar Foto";
        captureButton.style.display = "block";
        document.body.appendChild(videoElement);
        document.body.appendChild(captureButton);

        captureButton.addEventListener("click", () => {
            captureCanvas.width = videoElement.videoWidth;
            captureCanvas.height = videoElement.videoHeight;
            captureContext.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);

            const imgData = captureCanvas.toDataURL("image/png");
            guardarEnLocalStorage("modulo2", { imagen: imgData });

            const img = new Image();
            img.src = imgData;
            img.onload = () => {
                const ctxFoto = fotoContainer.getContext("2d");
                ctxFoto.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                ctxFoto.drawImage(img, 0, 0, fotoContainer.width, fotoContainer.height);
                fotoContainer.style.display = "block";

                videoStream.getTracks().forEach((track) => track.stop());
                videoElement.remove();
                captureButton.remove();
                mostrarSeccion(riesgoOpciones);
            };
        });
    } catch (error) {
        alert("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
    }
});

// Manejo de la sección de Riesgos
document.querySelectorAll('input[name="riesgo"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const seleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
            (input) => input.value
        );
        if (seleccionados.length > 0) {
            mostrarSeccion(clasificacionFieldset);
        }
    });
});

// Manejo de la sección de Clasificación
document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        nextButton.classList.remove("hidden");
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

    console.log("Redirigiendo al módulo 3...");
    window.location.href = "/modulos/modulo3-detener/index.html";
});

// Función para guardar en Local Storage
function guardarEnLocalStorage(modulo, datos) {
    const reporte = JSON.parse(localStorage.getItem("reporte")) || {};
    reporte[modulo] = { ...reporte[modulo], ...datos };
    localStorage.setItem("reporte", JSON.stringify(reporte));
    console.log(`Datos del ${modulo} guardados:`, datos);
}
