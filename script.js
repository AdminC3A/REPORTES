// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// URL de Google Sheets (por ahora usamos validación local con una base de datos)
const validCodes = ["DEM00068", "AGGC0005", "BGAD0066"]; // Simula códigos válidos

// Variable para evitar duplicados
let lastScannedCode = null;
let lastScanTime = 0;

// Función para manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");
    const currentTime = new Date().getTime();

    // Evitar duplicados: Verificar si el código ya fue escaneado recientemente
    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
        console.log("Código duplicado detectado. Ignorando.");
        return;
    }

    // Actualizar el último código y la hora del escaneo
    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    // Validar el código
    if (validCodes.includes(decodedText.trim())) {
        // Mostrar imagen de acceso permitido
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";

        // Pasar a la Etapa 1: Decidir
        openStage1(decodedText);
    } else {
        // Mostrar imagen de acceso denegado
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            <p>Código detectado: ${decodedText} - Inválido</p>
        `;
    }
}

// Función para abrir la pantalla de la Etapa 1: Decidir
function openStage1(workerCode) {
    // Ocultar escáner y mostrar Etapa 1
    document.getElementById("scannerContainer").style.display = "none";
    document.getElementById("stage1Container").style.display = "block";

    // Mostrar el código del trabajador en la pantalla
    document.getElementById("workerCodeStage1").innerText = `Trabajador: ${workerCode}`;
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

// Manejar el botón de "Siguiente" en la Etapa 1
document.getElementById("nextToStage2").addEventListener("click", () => {
    const decision = document.getElementById("decidir").value;

    if (!decision) {
        alert("Por favor, selecciona una acción.");
        return;
    }

    // Guardar decisión y pasar a la siguiente etapa
    localStorage.setItem("BOS_decision", decision); // Almacenar temporalmente
    openStage2();
});

// Función para abrir la Etapa 2: Detener
function openStage2() {
    // Ocultar Etapa 1 y mostrar Etapa 2
    document.getElementById("stage1Container").style.display = "none";
    document.getElementById("stage2Container").style.display = "block";
}

// Inicializar la aplicación
getBackCameraId().then((cameraId) => startScanner(cameraId));
