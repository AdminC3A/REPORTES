// URL de la base de datos
const databaseUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";

// Variable global para almacenar la base de datos cargada
let validCodes = [];

// Variable para evitar duplicados
let lastScannedCode = null;
let lastScanTime = 0;

// Variable para la cámara seleccionada
let lastCameraId = null;

// Objeto para almacenar temporalmente los datos del reporte BOS
let reportData = {
    workerCode: null,
    sections: {}
};

/** Módulo 1: Cargar la base de datos y activar escáner QR */
async function loadDatabase() {
    try {
        const response = await fetch(databaseUrl);
        const csvText = await response.text();

        // Procesar el contenido del archivo CSV
        validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code);
        document.getElementById("result").innerText = "Base de datos cargada correctamente. Por favor, escanea un código QR...";
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

function onScanSuccess(decodedText) {
    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");
    const currentTime = new Date().getTime();

    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
        console.log("Código duplicado detectado. Ignorando.");
        return;
    }

    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    if (validCodes.includes(decodedText.trim())) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        openModule2(decodedText); // Ir al módulo 2
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        resultContainer.innerText = `Código detectado: ${decodedText} - Inválido`;
    }
}

function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

function startScanner(cameraId) {
    const html5Qrcode = new Html5Qrcode("reader");
    html5Qrcode.start(cameraId, { fps: 15, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanError)
        .then(() => {
            lastCameraId = cameraId;
        })
        .catch(error => {
            console.error("Error al iniciar el escáner:", error);
        });
}

function restartScanner() {
    document.getElementById("result").innerText = "Por favor, escanea un código QR...";
    document.getElementById("validation-image").style.display = "none";

    if (lastCameraId) {
        startScanner(lastCameraId);
    } else {
        getBackCameraId().then(startScanner).catch(console.error);
    }
}

function getBackCameraId() {
    return Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length > 0) {
            const backCamera = cameras.find(camera => camera.label.toLowerCase().includes("back"));
            return backCamera ? backCamera.id : cameras[0].id;
        } else {
            throw new Error("No se encontraron cámaras disponibles.");
        }
    });
}

/** Módulo 2: Ir al módulo de Decisión */
function openModule2(workerCode) {
    reportData.workerCode = workerCode; // Guardar el trabajador seleccionado

    document.getElementById("module1").style.display = "none";
    document.getElementById("module2").style.display = "block";
    document.getElementById("workerCode").innerText = `Trabajador: ${workerCode}`;
}

/** Módulo Final: Enviar el reporte BOS */
function sendReportToGoogleSheets() {
    const postUrl = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"; // Reemplaza con tu URL de Google Apps Script

    fetch(postUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
    })
    .then(() => {
        alert("Reporte enviado exitosamente.");
    })
    .catch((error) => {
        console.error("Error al enviar el reporte:", error);
    });
}

/** Inicializar la aplicación */
async function initializeApp() {
    await loadDatabase();
    const cameraId = await getBackCameraId();
    startScanner(cameraId);
}

document.addEventListener("DOMContentLoaded", initializeApp);
