// Variable global para almacenar los datos del trabajador
let trabajadorActual = null;

// Inicializar escáner QR
const scannerContainer = document.getElementById("reader");
const scanResult = document.getElementById("scan-result");
const nextButton = document.getElementById("next-button");

function startScanner() {
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            validarQR(decodedText, html5QrCode);
        },
        (errorMessage) => {
            console.error("Error de escaneo:", errorMessage);
        }
    );
}

// Validar QR contra la base de datos
function validarQR(qrCode, html5QrCode) {
    // Simulación de validación del QR en una base de datos
    const baseDeDatos = {
        "QR123": { nombre: "Juan Pérez", puesto: "Albañil" },
        "QR124": { nombre: "María López", puesto: "Ingeniera" },
    };

    if (baseDeDatos[qrCode]) {
        trabajadorActual = baseDeDatos[qrCode];
        scanResult.innerHTML = `Trabajador: ${trabajadorActual.nombre}, Puesto: ${trabajadorActual.puesto}`;
        nextButton.classList.remove("hidden");
        html5QrCode.stop(); // Detener el escáner
    } else {
        scanResult.innerHTML = "Código QR no válido. Por favor, inténtalo de nuevo.";
    }
}

// Manejar el botón "Siguiente"
nextButton.addEventListener("click", () => {
    if (trabajadorActual) {
        window.location.href = "seccion1.html"; // Redirigir a la siguiente pantalla
    }
});

// Iniciar el escáner al cargar la página
startScanner();
