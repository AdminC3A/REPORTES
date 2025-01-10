document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let rolesYllaves = {}; // Base de datos de roles y llaves

    // Elementos del DOM
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const observacionesFieldset = document.getElementById("observaciones-adicionales");
    const validarLlaveButton = document.getElementById("validar-llave");
    const continuarExternoButton = document.getElementById("continuar-externo");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const nextButton = document.getElementById("next");
    const nombreExternoInput = document.getElementById("nombre-externo");
    const otrosDetalle = document.getElementById("otros-detalle");
    const observacionesTexto = document.getElementById("observaciones-texto");

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
                validacionNombreFieldset.style.display = "block";
                clasificacionFieldset.style.display = "none";
                observacionesFieldset.style.display = "none";
                nextButton.style.display = "none";
            } else {
                validacionLlaveFieldset.style.display = "block";
                validacionNombreFieldset.style.display = "none";
                clasificacionFieldset.style.display = "none";
                observacionesFieldset.style.display = "none";
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

        Object.values(supervisores).forEach((llaves) => {
            if (llaves.includes(llave)) {
                llaveValida = true;
            }
        });

        if (llaveValida) {
            mensajeValidacion.style.display = "none";
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
        } else {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Llave no válida. Intenta nuevamente.";
        }
    });

    // Continuar con "Externo"
    continuarExternoButton.addEventListener("click", () => {
        const nombre = nombreExternoInput.value.trim();

        if (!nombre) {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Por favor ingresa tu nombre.";
            return;
        }

        mensajeValidacion.style.display = "none";
        clasificacionFieldset.style.display = "block";
        validacionNombreFieldset.style.display = "none";
    });

    // Mostrar el textarea para "Otros"
    document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.value === "Otros") {
                otrosDetalle.style.display = "block";
            } else {
                otrosDetalle.style.display = "none";
            }
            observacionesFieldset.style.display = "block";
            nextButton.style.display = "block";
        });
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const clasificacion = document.querySelector('input[name="clasificacion"]:checked');
        const otros = otrosDetalle.value.trim();
        const observaciones = observacionesTexto.value.trim();

        // Guardar datos en Local Storage
        const datos = {
            rol: document.querySelector('input[name="rol"]:checked').value,
            clasificacion: clasificacion ? clasificacion.value : null,
            otros: otros || null,
            observaciones: observaciones || null,
        };

        localStorage.setItem("datosModulo3", JSON.stringify(datos));

        // Redirigir al módulo 4
        window.location.href = "/modulos/modulo4-observar/index.html";
    });

    // Inicializar
    loadRolesAndKeys();
});
