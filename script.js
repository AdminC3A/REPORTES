// VARIABLES GLOBALES
let lastCameraId = null;
let lastScannedCode = null;
let lastScanTime = 0;
let validCodes = [];
let isScanningPaused = false;

// URL de la base de datos CSV y Google Apps Script
const databaseUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";
const postUrl = "https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_URL/exec";

// MÓDULO 1: ESCANEO DE QR
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

    const currentTime = new Date().getTime();
    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) return;

    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");

    if (validCodes.includes(decodedText.trim())) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        isScanningPaused = true;

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Salida Permitida<br>
            <button id="continueButton" style="font-size: 24px; padding: 20px 40px; margin-top: 10px;">Continuar con reporte</button>
        `;

        sendToGoogleSheets(decodedText, "Registrada", new Date().toISOString());

        document.getElementById("continueButton").addEventListener("click", () => {
            stopScanner();
            openModule2(decodedText);
        });
    } else {
        validationImage.src = "images/Alerta.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - ACCESO ILEGAL<br>
            Escaneando de nuevo en 11 segundos...
        `;

        sendToGoogleSheets(decodedText, "Acceso Ilegal", new Date().toISOString());

        setTimeout(() => {
            lastScannedCode = null;
            lastScanTime = 0;
            validationImage.style.display = "none";
            resultContainer.innerHTML = "";
            isScanningPaused = false;
            startScanner();
        }, 11000);
    }
}

function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

function sendToGoogleSheets(qrCode, result, timestamp) {
    fetch(postUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "entrada", qrCode, result, timestamp }),
    }).then(() => {
        console.log("Datos enviados a Google Sheets.");
    }).catch(error => {
        console.error("Error al enviar los datos:", error);
    });
}

// MÓDULO 2: DECISIÓN
function openModule2(workerId) {
    document.getElementById("result").innerHTML = `
        <h2>Sección 1: Reporte BOS</h2>
        <p>Trabajador identificado: ${workerId}</p>
        <button id="nextSectionButton" style="font-size: 18px; padding: 10px 20px;">Siguiente</button>
    `;

    document.getElementById("nextSectionButton").addEventListener("click", () => {
        openModule3(workerId);
    });
}

// INICIALIZAR
document.addEventListener("DOMContentLoaded", () => {
    loadDatabase().then(startScanner);
});
