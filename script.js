// Módulo 1: Escaneo de QR

// Variables globales
let lastCameraId = null;
let validCodes = [];
let lastScannedCode = null;
let isScanningPaused = false; // Bandera para pausar el escaneo

// Función para cargar la base de datos
async function loadDatabase() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv");
        const csvText = await response.text();

        // Procesar el contenido del archivo CSV
        validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code);
        document.getElementById("result").innerText = "Base de datos cargada correctamente.";
        console.log("Base de datos cargada:", validCodes);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

// Función para manejar el resultado del escaneo
function onScanSuccess(decodedText) {
    if (isScanningPaused) {
        console.log("Escaneo pausado. Esperando acción del usuario.");
        return;
    }

    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");

    // Pausar el escaneo
    isScanningPaused = true;

    // Validar el código QR
    if (validCodes.includes(decodedText.trim())) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Acceso Permitido<br>
            <button id="continueButton" style="font-size: 24px; padding: 20px 40px; margin-top: 10px;">Continuar</button>
        `;

        // Evento del botón para continuar al siguiente módulo
        document.getElementById("continueButton").addEventListener("click", () => {
            validationImage.style.display = "none"; // Ocultar imagen
            resultContainer.innerHTML = ""; // Limpiar mensaje
            proceedToNextModule(decodedText); // Llamar a la función para avanzar
        });
    } else {
        validationImage.src = "images/Alerta.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `Código detectado: ${decodedText} - ACCESO DENEGADO.`;
        setTimeout(() => {
            validationImage.style.display = "none";
