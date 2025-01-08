// Variables globales
let lastScannedCode = null;

// Módulo 1: Escaneo de QR
async function initializeScanner() {
    const html5QrCode = new Html5Qrcode("reader");
    const cameraId = await Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
            return cameras[0].id; // Seleccionar la primera cámara disponible
        } else {
            throw new Error("No se encontraron cámaras disponibles.");
        }
    });

    html5QrCode
        .start(
            cameraId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onScanSuccess,
            onScanError
        )
        .catch(error => {
            console.error("Error al iniciar el escaneo:", error);
        });
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    lastScannedCode = decodedText.trim();
    document.getElementById("validation-message").innerHTML = `
        Código detectado: ${lastScannedCode}<br>
        <button id="proceed-to-module2" style="font-size: 16px;">Continuar</button>
    `;

    // Detener el escaneo y proceder
    Html5Qrcode.stop();
    document.getElementById("proceed-to-module2").addEventListener("click", () => {
        document.getElementById("module1").classList.add("hidden");
        document.getElementById("module2").classList.remove("hidden");
    });
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

// Módulo 2: Captura de Datos
function initializeModule2() {
    document.getElementById("proceed-button").addEventListener("click", () => {
        const decision = document.getElementById("decision").value;
        const comments = document.getElementById("comments").value;
        console.log("Datos capturados:", { decision, comments });
        // Proceder al siguiente módulo o almacenar datos
    });
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
    initializeScanner();
    initializeModule2();
});
