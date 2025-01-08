const cargarFotoArchivoBtn = document.getElementById("cargarFotoArchivoBtn");
const cargarFotoCamaraBtn = document.getElementById("cargarFotoCamaraBtn");
const fotoContainer = document.getElementById("fotoContainer");
const riesgoOpciones = document.getElementById("riesgoOpciones");
const nextButton = document.getElementById("next");
let imagenSeleccionada = null;

// Función para mostrar las opciones después de cargar la foto
function mostrarOpciones() {
    fotoContainer.style.display = "block"; // Mostrar previsualización
    riesgoOpciones.style.display = "block"; // Mostrar opciones de selección
    nextButton.style.display = "block"; // Mostrar botón "Continuar"
}

/**
 * Módulo 2: Cargar foto desde archivo
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
                    imagenSeleccionada = img; // Guardar la imagen
                    const ctxFoto = fotoContainer.getContext("2d");
                    ctxFoto.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctxFoto.beginPath();
                    ctxFoto.arc(75, 75, 75, 0, Math.PI * 2, true); // Círculo
                    ctxFoto.closePath();
                    ctxFoto.clip();
                    ctxFoto.drawImage(img, 0, 0, 150, 150); // Dibujar previsualización circular
                    mostrarOpciones();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

/**
 * Módulo 3: Cargar foto desde cámara
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

// Mostrar campo adicional si se selecciona "Otros"
document.getElementById("otros").addEventListener("change", function () {
    const otrosDetalle = document.getElementById("otros-detalle");
    if (this.checked) {
        otrosDetalle.style.display = "block";
    } else {
        otrosDetalle.style.display = "none";
    }
});

// Navegar al siguiente módulo
nextButton.addEventListener("click", function () {
    window.location.href = "/modulos/modulo3-detener/index.html";
});
