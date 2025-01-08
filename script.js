// VARIABLES GLOBALES
let lastCameraId = null;
let lastScannedCode = null;
let lastScanTime = 0;
let validCodes = [];
let isScanningPaused = false;

// URL de la base de datos CSV
const databaseUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";

// MÓDULO 1: CARGAR BASE DE DATOS Y ESCANEAR QR
async function loadDatabase() {
    try {
        const response = await fetch(databaseUrl);
        const csvText = await response.text();
        validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code);
        console.log("Base de datos cargada:", validCodes);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
    }
}

function startScanner() {
    const html5Qrcode = new Html5Qrcode("reader");

    html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanError
    ).then(() => {
        console.log("Escáner iniciado.");
    }).catch(error => {
        console.error("Error al iniciar el escáner:", error);
    });
}

function stopScanner() {
    const html5Qrcode = new Html5Qrcode("reader");
    html5Qrcode.stop().then(() => {
        console.log("Escáner detenido.");
    }).catch(error => {
        console.error("Error al detener el escáner:", error);
    });
}

function onScanSuccess(decodedText) {
    if (isScanningPaused) return;

    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");
    const currentTime = new Date().getTime();

    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
        console.log("Código duplicado detectado. Ignorando.");
        return;
    }

    isScanningPaused = true;
    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    if (validCodes.includes(decodedText.trim())) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Continuar con Reporte<br>
            <button id="continueButton">Continuar con Reporte</button>
        `;

        document.getElementById("continueButton").addEventListener("click", () => {
            stopScanner();
            proceedToNextModule(decodedText);
        });
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - No válido
        `;

        setTimeout(() => {
            validationImage.style.display = "none";
            resultContainer.innerHTML = "Por favor, intente nuevamente.";
            isScanningPaused = false;
        }, 5000);
    }
}

function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

function proceedToNextModule(qrCode) {
    console.log(`QR válido detectado: ${qrCode}. Cargando módulo 2...`);
    window.location.href = "modulo2_decision.html"; // Redirigir a Módulo 2
}

// Inicializar la aplicación
loadDatabase().then(startScanner);
