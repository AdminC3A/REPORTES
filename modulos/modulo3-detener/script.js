document.addEventListener("DOMContentLoaded", () => {
    let validCodes = []; // Base de datos de QR cargada
    let qrReaderActive = false; // Control del lector QR

    // Cargar la base de datos de QR desde Local Storage
    function loadDatabaseFromCache() {
        const cachedData = localStorage.getItem("baseDeDatosQR");
        if (cachedData) {
            validCodes = JSON.parse(cachedData);
            console.log("Base de datos cargada:", validCodes);
        } else {
            alert("No se encontró la base de datos. Asegúrate de haberla cargado en el Módulo 1.");
        }
    }

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionQRFieldset = document.getElementById("validacion-qr");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const validarLlaveButton = document.getElementById("validar-llave");
    const qrReaderContainer = document.getElementById("qr-reader");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const otrosDetalle = document.getElementById("otros-detalle");
    const nextButton = document.getElementById("next");

    // Mostrar campo según rol
    rolRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;

            if (rolSeleccionado === "Externo") {
                validacionQRFieldset.style.display = "block";
                validacionLlaveFieldset.style.display = "none";
                clasificacionFieldset.style.display = "none";
            } else {
                validacionQRFieldset.style.display = "none";
                validacionLlaveFieldset.style.display = "block";
                clasificacionFieldset.style.display = "none";
            }

            mensajeValidacion.style.display = "none";
        });
    });

    // Validar llave
    validarLlaveButton.addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();

        if (!llave) {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Por favor ingresa una llave.";
            return;
        }

        // Simula una validación de llave
        if (llave === "12345") {
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
        } else {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Llave no válida.";
        }
    });

    // Lector QR
    const html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            if (validCodes.includes(decodedText.trim())) {
                alert("Código QR válido. Acceso concedido.");
                clasificacionFieldset.style.display = "block";
                validacionQRFieldset.style.display = "none";
                html5QrCode.stop();
            } else {
                alert("Código QR no válido. Intenta nuevamente.");
            }
        },
        (errorMessage) => {
            console.error("Error al escanear QR:", errorMessage);
        }
    ).catch((err) => console.error("Error al iniciar el lector QR:", err));

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        window.location.href = "/modulos/modulo4-observar/index.html";
    });

    // Inicialización
    loadDatabaseFromCache();
});
