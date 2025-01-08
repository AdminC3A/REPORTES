// URL de la base de datos
const databaseUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";

// Variable global para almacenar la base de datos cargada
let validCodes = [];

// Variable para evitar duplicados
let lastScannedCode = null;
let lastScanTime = 0;

// Variable para la cámara seleccionada
let lastCameraId = null;

// Cargar la base de datos desde el archivo CSV
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

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    const validationImage = document.getElementById("validation-image");
    const currentTime = new Date().getTime();

    // Evitar duplicados
    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
        console.log("Código duplicado detectado. Ignorando.");
        return;
    }

    // Actualizar último código y hora
    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    // Validar el código
    if (validCodes.includes(decodedText.trim())) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        openStage1(decodedText);
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = `Código detectado: ${decodedText} - Inválido`;
    }
}

// Abrir Etapa 1: Decidir
function openStage1(workerCode) {
    document.getElementById("scannerContainer").style.display = "none";
    document.getElementById("stage1Container").style.display = "block";
    document.getElementById("workerCodeStage1").innerText = `Trabajador: ${workerCode}`;
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

// Iniciar el escaneo con una cámara específica
function startScanner(cameraId) {
    const html5Qrcode = new Html5Qrcode("reader");

    html5Qrcode
        .start(cameraId, { fps: 15, qrbox: { width: 125, height: 125 } }, onScanSuccess, onScanError)
        .then(() => {
            lastCameraId = cameraId;
        })
        .catch((error) => {
            console.error("Error al iniciar el escaneo:", error);
        });
}

// Reiniciar el escáner
function restartScanner() {
    document.getElementById("result").innerText = "Por favor, escanea un código QR...";
    document.getElementById("validation-image").style.display = "none";

    if (lastCameraId) {
        startScanner(lastCameraId);
    } else {
        getBackCameraId().then(startScanner).catch(error => console.error(error));
    }
}

// Obtener la cámara trasera automáticamente
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

// Manejar "Siguiente" en la Etapa 1
document.getElementById("nextToStage2").addEventListener("click", () => {
    const decision = document.getElementById("decidir").value;

    if (!decision) {
        alert("Por favor, selecciona una acción.");
        return;
    }

    localStorage.setItem("BOS_decision", decision);
    console.log("Decisión guardada:", decision);
});

// Inicializar la aplicación
loadDatabase().then(() => {
    getBackCameraId().then(cameraId => startScanner(cameraId));
});
