document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let rolesYllaves = {}; // Base de datos de roles y llaves

    // Elementos del DOM
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionExternoFieldset = document.getElementById("validacion-externo");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const validarLlaveButton = document.getElementById("validar-llave");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const nextButton = document.getElementById("next");
    const nombreExternoInput = document.getElementById("nombre-externo");
    const telefonoExternoInput = document.getElementById("telefono-externo");
    const continuarExternoButton = document.getElementById("continuar-externo");
    const otrosDetalle = document.getElementById("otros-detalle");

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

    // Mostrar el campo según el rol seleccionado
    document.querySelectorAll('input[name="rol"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;

            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.style.display = "none";
                validacionExternoFieldset.style.display = "block";
                clasificacionFieldset.style.display = "none";
                nextButton.style.display = "none";
            } else {
                validacionLlaveFieldset.style.display = "block";
                validacionExternoFieldset.style.display = "none";
                clasificacionFieldset.style.display = "none";
                nextButton.style.display = "none";
            }

            mensajeValidacion.style.display = "none";
        });
    });

    // Validar llave para roles internos
    validarLlaveButton.addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();
        const rolSeleccionado = document.querySelector('input[name="rol"]:checked');

        if (!llave || !rolSeleccionado) {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Por favor selecciona un rol y proporciona una llave.";
            return;
        }

        const rol = rolSeleccionado.value;
        let supervisores = {};

        if (rol === "Supervisor de Seguridad") {
            supervisores = rolesYllaves.supervisoresSeguridad.supervisores;
        } else if (rol === "Supervisor de Obra") {
            supervisores = rolesYllaves.supervisoresObra.supervisores;
        } else if (rol === "Guardia en Turno") {
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
            mensajeValidacion.style.display = "none";
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";

            guardarEnLocalStorage("modulo3", { rol, llave, supervisor: nombreSupervisor });
        } else {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Llave no válida. Intenta nuevamente.";
        }
    });

    // Continuar con "Externo"
    continuarExternoButton.addEventListener("click", () => {
        const nombre = nombreExternoInput.value.trim();
        const telefono = telefonoExternoInput.value.trim();

        clasificacionFieldset.style.display = "block";
        validacionExternoFieldset.style.display = "none";

        guardarEnLocalStorage("modulo3", { rol: "Externo", nombreExterno: nombre, telefonoExterno: telefono });
    });

    // Mostrar campo de texto para "Otros"
    document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
        radio.addEventListener("change", (event) => {
            const seleccion = event.target.value;

            if (seleccion === "Otros") {
                otrosDetalle.style.display = "block";
            } else {
                otrosDetalle.style.display = "none";
            }

            // Mostrar botón "Continuar" al seleccionar cualquier clasificación
            nextButton.style.display = "block";
        });
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const clasificacionSeleccionada = document.querySelector('input[name="clasificacion"]:checked');
        const clasificacion = clasificacionSeleccionada ? clasificacionSeleccionada.value : null;
        const detalleOtros = otrosDetalle.value.trim();

        // Guardar datos en Local Storage
        guardarEnLocalStorage("modulo3", {
            clasificacion,
            detalleOtros: clasificacion === "Otros" ? detalleOtros : null,
        });

        // Ir al módulo 4 sin validar
        window.location.href = "/modulos/modulo4-observar/index.html";
    });

    // Guardar en Local Storage
    function guardarEnLocalStorage(modulo, datos) {
        let reporte = JSON.parse(localStorage.getItem("reporte")) || {};
        reporte[modulo] = { ...reporte[modulo], ...datos };
        localStorage.setItem("reporte", JSON.stringify(reporte));
        console.log(`Datos guardados en ${modulo}:`, datos);
    }

    // Inicialización
    loadRolesAndKeys();
});
