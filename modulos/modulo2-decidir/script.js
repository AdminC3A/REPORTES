const cargarFotoArchivoBtn = document.getElementById("cargarFotoArchivoBtn");
const cargarFotoCamaraBtn = document.getElementById("cargarFotoCamaraBtn");
const fotoContainer = document.getElementById("fotoContainer");
let imagenSeleccionada = null;

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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isMobile) {
        alert("Esta función solo está disponible en dispositivos móviles. Por favor, usa tu dispositivo móvil para acceder a esta funcionalidad.");
        return;
    }

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

                    alert("La imagen capturada ha reemplazado la imagen previamente cargada.");
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

// Navegar al siguiente módulo
document.getElementById("next").addEventListener("click", function () {
    window.location.href = "/modulos/modulo3-detener/index.html";
});
