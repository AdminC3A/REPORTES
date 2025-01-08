// Módulo 1: Escaneo de QR

// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// Variable para almacenar la base de datos cargada
let validCodes = [];

// Función para cargar la base de datos desde el CSV
async function loadDatabase() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv");
        const csvText = await response.text();

        // Procesar el contenido del archivo CSV
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
    const resultContainer = document.getElementById("result");

    // Validar si el código escaneado está en la base de datos
    if (validCodes.includes(decodedText.trim())) {
        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Acceso Permitido<br>
            <button id="continueButton" style="font-size: 24px; padding: 20px 40px; margin-top: 10px;">Continuar con el reporte</button>
        `;

        // Agregar evento para avanzar al siguiente módulo
        document.getElementById("continueButton").addEventListener("click", () => {
            console.log("Pasando al siguiente módulo...");
            // Aquí puedes agregar la lógica para abrir el siguiente módulo
        });
    } else {
        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Acceso Denegado
        `;
    }
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


// Función para avanzar al siguiente módulo
function proceedToNextModule(decodedText) {
    console.log(`Pasando al siguiente módulo con el código: ${decodedText}`);
    // Aquí redirigimos al módulo de decisión o mostramos su contenido
}

// Inicializar la aplicación
loadDatabase().then(() => {
    getBackCameraId()
        .then(cameraId => {
            startScanner(cameraId);
        })
        .catch(error => {
            console.error("Error al obtener la cámara trasera:", error);
            document.getElementById("result").innerText = "Error al acceder a la cámara.";
        });
});
