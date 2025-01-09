document.addEventListener("DOMContentLoaded", () => {
    let validCodes = []; // Base de datos de QR cargada desde Local Storage
    let qrReaderActive = false; // Bandera para controlar el lector QR

    // Cargar la base de datos desde Local Storage
    function loadDatabaseFromCache() {
        const cachedData = localStorage.getItem("baseDeDatosQR");
        if (cachedData) {
            validCodes = JSON.parse(cachedData);
            console.log("Base de datos cargada desde el cache:", validCodes);
        } else {
            console.error("No se encontró la base de datos en el cache.");
            alert("No se encontró la base de datos. Asegúrate de haberla cargado en el Módulo 1.");
        }
    }

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionQRFieldset = document.getElementById("validacion-qr");
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const otrosDetalle = document.getElementById("otros-detalle");
    const otrosEjemplos = document.getElementById("otros-ejemplos");
    const nextButton = document.getElementById("next");
    const escanearQRButton = document.getElementById("validar-qr");
    const validarLlaveButton = document.getElementById("validar-llave");
    const qrReaderContainer = document.getElementById("qr-reader");

    // Función para guardar en Local Storage
    function guardarEnLocalStorage(modulo, datos) {
        let reporte = JSON.parse(localStorage.getItem("reporte")) || {};
        reporte[modulo] = { ...reporte[modulo], ...datos };
        localStorage.setItem("reporte", JSON.stringify(reporte));
        console.log(`Datos del ${modulo} guardados:`, datos);
    }

    // Mostrar campos según el rol seleccionado
    rolRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;

            if (rolSeleccionado === "Externo") {
                // Mostrar validación QR
                validacionQRFieldset.style.display = "block";
                validacionLlaveFieldset.style.display = "none";
                clasificacionFieldset.style.display = "none";
                qrReaderActive = false; // Resetear estado del lector QR
            } else {
                // Mostrar validación por llave
                validacionQRFieldset.style.display = "none";
                validacionLlaveFieldset.style.display = "block";
                clasificacionFieldset.style.display = "none";
            }

            mensajeValidacion.style.display = "none"; // Ocultar mensaje de error al cambiar de rol
        });
    });

    // Escaneo QR al hacer clic en "Validar QR Externo"
    escanearQRButton.addEventListener("click", () => {
        if (qrReaderActive) {
            alert("El lector QR ya está activo.");
            return;
        }

        const html5QrCode = new Html5Qrcode("qr-reader"); // ID del contenedor
        const config = { fps: 10, qrbox: 250 };

        qrReaderActive = true;
        qrReaderContainer.style.display = "block";

        html5QrCode.start(
            { facingMode: "environment" }, // Cámara trasera
            config,
            (decodedText) => {
                console.log(`QR escaneado: ${decodedText}`);
                qrReaderActive = false; // Desactivar el lector

                // Validar QR contra la base de datos
                if (validCodes.includes(decodedText.trim())) {
                    alert("Código QR válido. Acceso concedido.");
                    guardarEnLocalStorage("modulo3", { rol: "Externo", qr: decodedText });

                    // Ocultar el lector QR y habilitar la clasificación
                    html5QrCode.stop().then(() => {
                        qrReaderContainer.style.display = "none";
                        clasificacionFieldset.style.display = "block";
                        validacionQRFieldset.style.display = "none";
                    });
                } else {
                    alert("Código QR no válido. Intenta nuevamente.");
                }
            },
            (error) => {
                console.warn("Error al escanear QR:", error);
            }
        ).catch(error => console.error("Error al iniciar el escáner QR:", error));
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

        // Obtener supervisores según el rol
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
            guardarEnLocalStorage("modulo3", { rol: rolSeleccionado, llave, supervisor: nombreSupervisor });
        } else {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Llave no válida. Intenta nuevamente.";
        }
    });

    // Mostrar campo de texto y ejemplos si seleccionan "Otros"
    document.querySelectorAll('input[name="clasificacion"]').forEach(radio => {
        radio.addEventListener("change", (event) => {
            if (event.target.value === "Otros") {
                otrosDetalle.style.display = "block";
                otrosEjemplos.style.display = "block";
            } else {
                otrosDetalle.style.display = "none";
                otrosEjemplos.style.display = "none";
            }

            nextButton.style.display = "block";
        });
    });

    // Capturar clic en ejemplos y completar el campo de texto
    document.querySelectorAll('.ejemplo-opcion').forEach(ejemplo => {
        ejemplo.addEventListener("click", (event) => {
            const textoEjemplo = event.target.getAttribute("data-value");
            otrosDetalle.value = textoEjemplo;
        });
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const seleccion = document.querySelector('input[name="clasificacion"]:checked');
        let validacionOtros = true;

        if (!seleccion) {
            alert("Por favor selecciona una clasificación para continuar.");
            return;
        }

        if (seleccion.value === "Otros") {
            const otrosTexto = otrosDetalle.value.trim();
            if (!otrosTexto) {
                validacionOtros = false;
                alert("Por favor describe la observación en el campo de texto para continuar.");
            } else {
                guardarEnLocalStorage("modulo3", {
                    clasificacion: "Otros",
                    detalleOtros: otrosTexto
                });
            }
        } else {
            guardarEnLocalStorage("modulo3", {
                clasificacion: seleccion.value
            });
        }

        // Redirigir al siguiente módulo si la validación es correcta
        if (validacionOtros) {
            window.location.href = "/modulos/modulo4-observar/index.html";
        }
    });

    // Inicializar la carga de la base de datos desde el cache
    loadDatabaseFromCache();
});
