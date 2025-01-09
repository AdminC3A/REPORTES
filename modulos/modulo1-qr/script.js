document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let validCodes = []; // Base de datos de QR cargada
    let rolesYllaves = {}; // Base de datos de roles y llaves
    let lastScannedCode = null; // Último código escaneado
    let lastScanTime = 0; // Tiempo del último escaneo
    let isScanningPaused = false; // Control para pausar el escaneo
    let lastCameraId = null; // Última cámara utilizada
    const html5Qrcode = new Html5Qrcode("qr-reader"); // Instancia del lector QR

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionQRFieldset = document.getElementById("validacion-qr");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const validarLlaveButton = document.getElementById("validar-llave");
    const validarQRButton = document.getElementById("validar-qr");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const nextButton = document.getElementById("next");
    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");

    // Cargar la base de datos QR
    async function loadDatabase() {
        try {
            const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv");
            const csvText = await response.text();

            // Procesar el contenido del archivo CSV
            validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code);

            // Guardar en Local Storage
            localStorage.setItem("baseDeDatosQR", JSON.stringify(validCodes));
            console.log("Base de datos cargada:", validCodes);
        } catch (error) {
            console.error("Error al cargar la base de datos:", error);
            alert("Error al cargar la base de datos. Verifica la conexión.");
        }
    }

    // Cargar roles y llaves desde el JSON
    async function loadRolesAndKeys() {
        try {
            const response = await fetch("/data/roles.json");
            if (!response.ok) throw new Error("Error al cargar roles.json");
            rolesYllaves = await response.json();
            console.log("Roles y llaves cargados:", rolesYllaves);
        } catch (error) {
            console.error("Error al cargar roles y llaves:", error);
            alert("No se pudieron cargar los roles y llaves. Verifica la conexión.");
        }
    }

    // Validar llave para roles internos
    validarLlaveButton.addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();
        const rolSeleccionado = document.querySelector('input[name="rol"]:checked').value;

        if (!llave || !rolSeleccionado) {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Por favor selecciona un rol y proporciona una llave.";
            return;
        }

        let supervisores = {};
        if (rolSeleccionado === "Supervisor de Seguridad") {
            supervisores = rolesYllaves.supervisoresSeguridad.supervisores;
        } else if (rolSeleccionado === "Supervisor de Obra") {
            supervisores = rolesYllaves.supervisoresObra.supervisores;
        } else if (rolSeleccionado === "Guardia en Turno") {
            supervisores = rolesYllaves.guardiasTurno.supervisores;
        }

        // Validar la llave ingresada
        let llaveValida = false;
        let nombreSupervisor = "";

        Object.entries(supervisores).forEach(([nombre, llaves]) => {
            if (llaves.includes(llave)) {
                llaveValida = true;
                nombreSupervisor = nombre;
            }
        });

        if (llaveValida) {
            console.log(`Llave válida para ${nombreSupervisor}`);
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
        } else {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Llave no válida. Intenta nuevamente.";
        }
    });

    // Manejar el resultado exitoso del escaneo
    function onScanSuccess(decodedText) {
        if (isScanningPaused) {
            console.log("Escaneo pausado.");
            return;
        }

        const currentTime = new Date().getTime();

        // Evitar duplicados
        if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
            console.log("Código duplicado detectado. Ignorando.");
            return;
        }

        isScanningPaused = true;
        lastScannedCode = decodedText;
        lastScanTime = currentTime;

        // Validar código QR
        if (validCodes.includes(decodedText.trim())) {
            validationImage.src = "/images/Permitido.png";
            validationImage.style.display = "block";
            resultContainer.innerHTML = `
                Código detectado: ${decodedText} - Válido.<br>
                <button id="continueButton">Continuar</button>
            `;
            document.getElementById("continueButton").addEventListener("click", () => {
                window.location.href = "/modulos/modulo4-observar/index.html";
            });
        } else {
            validationImage.src = "/images/Alerta.png";
            validationImage.style.display = "block";
            resultContainer.innerText = `Código detectado: ${decodedText} - No válido.`;
            setTimeout(resetScanner, 5000);
        }
    }

    // Reiniciar el escáner
    function resetScanner() {
        isScanningPaused = false;
        validationImage.style.display = "none";
        resultContainer.innerText = "Escanea un código QR.";
    }

    // Manejar errores del escaneo
    function onScanError(errorMessage) {
        console.error("Error durante el escaneo:", errorMessage);
    }

    // Función para iniciar el escáner QR
    async function startScanner() {
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
                const cameraId = cameras[0].id;
                html5Qrcode.start(cameraId, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanError);
                lastCameraId = cameraId;
            } else {
                throw new Error("No se encontraron cámaras disponibles.");
            }
        } catch (error) {
            console.error("Error al iniciar el escáner QR:", error);
            alert("Error al acceder a la cámara. Verifica los permisos.");
        }
    }

    // Inicialización
    loadDatabase()
        .then(() => loadRolesAndKeys())
        .then(() => startScanner())
        .catch((error) => console.error("Error durante la inicialización:", error));
});
