// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// Variable para almacenar la base de datos cargada
let validCodes = [];

// Variable para evitar duplicados
let lastScannedCode = null;
let lastScanTime = 0;

// Función para cargar la base de datos desde el CSV
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

// Manejar el resultado exitoso del escaneo
let isScanningPaused = false; // Bandera para pausar el escaneo

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

    isScanningPaused = true; // Pausar el escaneo
    lastScannedCode = decodedText; // Actualizar el último código
    lastScanTime = currentTime;

    // Normalizar valores para evitar problemas de formato
    const normalizedText = decodedText.trim();
    const normalizedValidCodes = validCodes.map(code => code.trim());

    if (normalizedValidCodes.includes(normalizedText)) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Codigo Registrado<br>
            <button id="continueButton" style="font-size: 24px; padding: 20px 40px; margin-top: 10px;">Continuar con Reporte</button>
        `;

        document.getElementById("continueButton").addEventListener("click", () => {
            const action = confirm("¿Continuamos con el reporte?\nAceptar para continuar con el siguiente módulo.");
            if (action) {
                window.location.href = "next-module.html"; // Redirigir al siguiente módulo
            } else {
                resetScanner();
            }
        });
    } else {
        validationImage.src = "images/Alerta.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - ANOTAR, EXPULSAR Y MULTAR.
        `;

        setTimeout(() => {
            resetScanner();
        }, 5000);
    }
}

// Función para reiniciar el escáner
function resetScanner() {
    lastScannedCode = null;
    lastScanTime = 0;
    document.getElementById("validation-image").style.display = "none";
    document.getElementById("result").innerHTML = "Por favor, escanea un código QR...";
    isScanningPaused = false;
    restartScanner();
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
