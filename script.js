// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// URL del Google Apps Script
const postUrl = "https://script.google.com/macros/s/AKfycbwZYrGzmWUQCjT7MCSmemPm5eXu_HYPTnFvxIDKOhyyao9GW6zAUvnbRsp7Y0VluQ0/exec";

// Variable para almacenar la base de datos cargada
let validCodes = [];

// Variable para evitar duplicados
let lastScannedCode = null;
let lastScanTime = 0;

// Bandera para pausar el escaneo
let isScanningPaused = false;

// Función para cargar la base de datos desde el CSV
async function loadDatabase() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv");
        const csvText = await response.text();

        validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code); // Filtrar valores vacíos
        document.getElementById("result").innerText = "Base de datos cargada correctamente.";
        console.log("Base de datos cargada:", validCodes);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    if (isScanningPaused) {
        console.log("Escaneo pausado. Esperando acción del usuario.");
        return;
    }

    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");
    const currentTime = new Date().getTime();

    // Evitar duplicados
    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
        console.log("Código duplicado detectado. Ignorando.");
        return;
    }

    // Pausar el escaneo
    isScanningPaused = true;

    // Actualizar el último código y la hora del escaneo
    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    const normalizedText = decodedText.trim();
    const normalizedValidCodes = validCodes.map(code => code.trim());

    if (normalizedValidCodes.includes(normalizedText)) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Validado<br>
            <button id="continueButton" style="font-size: 24px; padding: 20px 40px; margin-top: 10px;">Continuar a Reporte</button>
        `;

        document.getElementById("continueButton").addEventListener("click", () => {
            goToReportModule(decodedText);
        });
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Denegado<br>
        `;

        setTimeout(() => {
            restartScanner();
            isScanningPaused = false;
        }, 5000);
    }
}

// Ir al módulo de reporte BOS
function goToReportModule(decodedText) {
    document.getElementById("scanner-container").style.display = "none";
    document.getElementById("report-container").style.display = "block";
    document.getElementById("worker-id").value = decodedText; // Asignar el ID del trabajador
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

// Función para iniciar el escaneo con una cámara específica
function startScanner(cameraId) {
    const html5Qrcode = new Html5Qrcode("reader");

    html5Qrcode
        .start(
            cameraId,
            { fps: 15, qrbox: { width: 125, height: 125 } },
            onScanSuccess,
            onScanError
        )
        .then(() => {
            lastCameraId = cameraId;
        })
        .catch((error) => {
            console.error("Error al iniciar el escaneo:", error);
        });
}

// Función para reiniciar el escáner QR
function restartScanner() {
    document.getElementById("result").innerText = "Por favor, escanea un código QR...";
    document.getElementById("validation-image").style.display = "none";

    if (lastCameraId) {
        startScanner(lastCameraId);
    } else {
        getBackCameraId().then(startScanner).catch((error) => {
            console.error("Error al obtener la cámara trasera:", error);
        });
    }
}

// Función para obtener la cámara trasera automáticamente
function getBackCameraId() {
    return Html5Qrcode.getCameras().then((cameras) => {
        if (cameras && cameras.length > 0) {
            const backCamera = cameras.find((camera) =>
                camera.label.toLowerCase().includes("back")
            );
            return backCamera ? backCamera.id : cameras[0].id;
        } else {
            throw new Error("No se encontraron cámaras disponibles.");
        }
    });
}

// Inicializar la aplicación
loadDatabase().then(() => {
    getBackCameraId()
        .then((cameraId) => {
            startScanner(cameraId);
        })
        .catch((error) => {
            console.error("Error al obtener la cámara trasera:", error);
            document.getElementById("result").innerText =
                "Error al acceder a la cámara. Verifica los permisos.";
        });
});

// Enviar reporte BOS (a implementar en el módulo correspondiente)
document.getElementById("submit-report").addEventListener("click", () => {
    const workerId = document.getElementById("worker-id").value;
    const decision = document.getElementById("decision").value;
    const observations = document.getElementById("observations").value;

    if (!decision) {
        alert("Por favor, selecciona una decisión.");
        return;
    }

    // Enviar datos a Google Sheets (por implementar)
    console.log("Enviar reporte BOS:", { workerId, decision, observations });
});
