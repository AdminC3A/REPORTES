document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let rolesYllaves = {}; // Base de datos de roles y llaves

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const validarLlaveButton = document.getElementById("validar-llave");
    const continuarExternoButton = document.getElementById("continuar-externo");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const otrosDetalle = document.getElementById("otros-detalle");
    const otrosEjemplos = document.getElementById("otros-ejemplos");
    const nextButton = document.getElementById("next");

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

    // Mostrar el campo correspondiente según el rol seleccionado
    rolRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;

            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.style.display = "none";
                validacionNombreFieldset.style.display = "block";
                clasificacionFieldset.style.display = "none";
            } else {
                validacionLlaveFieldset.style.display = "block";
                validacionNombreFieldset.style.display = "none";
                clasificacionFieldset.style.display = "none";
            }

            mensajeValidacion.style.display = "none"; // Ocultar mensaje de error
        });
    });

    // Validar llave para roles internos
    validarLlaveButton.addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();
        const rolSeleccionado = document.querySelector('input[name="rol"]:checked')?.value;

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

    // Continuar con el rol "Externo"
    continuarExternoButton.addEventListener("click", () => {
        const nombreExterno = document.getElementById("nombre-externo").value.trim();

        if (!nombreExterno) {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Por favor ingresa tu nombre para continuar.";
            return;
        }

        console.log(`Nombre ingresado: ${nombreExterno}`);
        clasificacionFieldset.style.display = "block";
        validacionNombreFieldset.style.display = "none";
    });

    // Mostrar ejemplos interactivos al seleccionar "Otros"
    document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
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

    // Agregar ejemplos al campo de texto cuando se seleccionan
    document.querySelectorAll(".ejemplo-opcion").forEach((ejemplo) => {
        ejemplo.addEventListener("click", (event) => {
            const textoEjemplo = event.target.getAttribute("data-value");
            otrosDetalle.value = textoEjemplo;
        });
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        window.location.href = "/modulos/modulo4-observar/index.html";
    });

    // Inicialización
    loadRolesAndKeys();
});
