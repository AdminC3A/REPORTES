// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// URL del Google Apps Script (reemplázalo con tu URL)
const postUrl = "https://script.google.com/macros/s/..."; // Completar con tu URL

// Variable para almacenar la base de datos cargada
let validCodes = [];

// Variable para evitar duplicados
let lastScannedCode = null;
let lastScanTime = 0;

// Función para cargar la base de datos desde el CSV
async function loadDatabase() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/..."); // Ruta a tu CSV
        const csvText = await response.text();

        // Procesar el contenido del archivo CSV
        validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code); // Filtrar valores vacíos
        document.getElementById("result").innerText = "Base de datos cargada correctamente.";
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

// Función para manejar el escaneo exitoso
function onScanSuccess(decodedText) {
    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");
    const currentTime = new Date().getTime();
    const timestamp = new Date().toISOString();

    // Evitar duplicados
    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
        console.log("Código duplicado detectado.");
        return;
    }

    // Actualizar el último código y la hora del escaneo
    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    if (validCodes.includes(decodedText.trim())) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            <p>Código detectado: ${decodedText} - Acceso Permitido</p>
            <button id="continueButton" class="btn btn-primary">Registrado > Seguir</button>
        `;

        document.getElementById("continueButton").addEventListener("click", () => {
            validationImage.style.display = "none";
            resultContainer.innerHTML = "";
            openModule2(decodedText); // Función para abrir el módulo 2
        });
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            <p>Código detectado: ${decodedText} - Acceso Denegado</p>
        `;
        setTimeout(() => restartScanner(), 5000);
    }
}

// Función para reiniciar el escáner
function restartScanner() {
    document.getElementById("result").innerText = "Escaneando...";
    document.getElementById("validation-image").style.display = "none";

    if (lastCameraId) {
        startScanner(lastCameraId);
    } else {
        getBackCameraId().then(startScanner).catch(console.error);
    }
}

// Función para iniciar el escáner QR
function startScanner(cameraId) {
    const html5Qrcode = new Html5Qrcode("reader");

    html5Qrcode
        .start(cameraId, { fps: 15, qrbox: { width: 125, height: 125 } }, onScanSuccess)
        .then(() => (lastCameraId = cameraId))
        .catch(console.error);
}

// Función para obtener la cámara trasera automáticamente
function getBackCameraId() {
    return Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length > 0) {
            const backCamera = cameras.find(camera => camera.label.toLowerCase().includes("back"));
            return backCamera ? backCamera.id : cameras[0].id;
        }
        throw new Error("No se encontraron cámaras disponibles.");
    });
}

// Inicializar la aplicación
loadDatabase().then(() => {
    getBackCameraId()
        .then(startScanner)
        .catch(error => {
            console.error("Error al iniciar la cámara:", error);
            document.getElementById("result").innerText = "Error al acceder a la cámara.";
        });
});
