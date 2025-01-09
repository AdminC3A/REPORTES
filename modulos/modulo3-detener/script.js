document.addEventListener("DOMContentLoaded", () => {
    let validCodes = []; // Base de datos de QR cargada
    let rolesYllaves = {}; // Base de datos de roles y llaves
    let qrReaderActive = false; // Control del lector QR
    const html5QrCode = new Html5Qrcode("qr-reader"); // Instancia del lector QR

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionQRFieldset = document.getElementById("validacion-qr");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const validarLlaveButton = document.getElementById("validar-llave");
    const validarQRButton = document.getElementById("validar-qr");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const nextButton = document.getElementById("next");

    // Cargar la base de datos QR
    async function loadDatabase() {
        try {
            const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv");
            const csvText = await response.text();

            // Procesar el contenido del archivo CSV
            validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code);

            // Guardar la base de datos en Local Storage
            localStorage.setItem("baseDeDatosQR", JSON.stringify(validCodes));
            console.log("Base de datos cargada y guardada en Local Storage:", validCodes);
        } catch (error) {
            console.error("Error al cargar la base de datos:", error);
            alert("Error al cargar la base de datos. Verifica la conexión.");
        }
    }

    // Cargar la base de datos de roles y llaves
    async function loadRolesAndKeys() {
        try {
            const response = await fetch("/data/roles.json");
            if (!response.ok) throw new Error("Error al cargar roles.json");
            rolesYllaves = await response.json();
            console.log("Roles y llaves cargados:", rolesYllaves);
        } catch (error) {
            console.error("Error al cargar roles y llaves:", error);
            alert("No se pudieron cargar los roles y llaves. Verifica la conexión y el archivo roles.json.");
        }
    }

    // Mostrar campo según rol seleccionado
    rolRadios.forEach((radio) => {
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

    // Lector QR para rol externo
    function startQrReader() {
        html5QrCode
            .start(
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
                    console.warn("Error al escanear QR:", errorMessage);
                }
            )
            .catch((err) => console.error("Error al iniciar el lector QR:", err));
    }

    validarQRButton.addEventListener("click", () => {
        if (!qrReaderActive) {
            startQrReader();
            qrReaderActive = true;
        }
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        window.location.href = "/modulos/modulo4-observar/index.html";
    });

    // Inicialización
    loadDatabase();
    loadRolesAndKeys();
});
