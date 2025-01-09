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
    const otrosDetalle = document.getElementById("otros-detalle");
    const nextButton = document.getElementById("next");

    // Cargar la base de datos de QR desde Local Storage
    function loadDatabaseFromCache() {
        const cachedData = localStorage.getItem("baseDeDatosQR");
        if (cachedData) {
            validCodes = JSON.parse(cachedData);
            console.log("Base de datos de QR cargada:", validCodes);
        } else {
            alert("No se encontró la base de datos de QR. Asegúrate de haberla cargado en el Módulo 1.");
        }
    }

    // Cargar la base de datos de roles y llaves
    function loadRolesAndKeys() {
        fetch("/data/roles.json")
            .then((response) => response.json())
            .then((data) => {
                rolesYllaves = data;
                console.log("Roles y llaves cargados:", rolesYllaves);
            })
            .catch((error) => {
                console.error("Error al cargar roles y llaves:", error);
                alert("No se pudieron cargar los roles y llaves. Verifique la conexión.");
            });
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
                    console.error("Error al escanear QR:", errorMessage);
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
    loadDatabaseFromCache();
    loadRolesAndKeys();
});
