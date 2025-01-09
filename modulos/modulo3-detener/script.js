document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let rolesYllaves = {}; // Base de datos de roles y llaves

    // Elementos del DOM
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const validarLlaveButton = document.getElementById("validar-llave");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const nextButton = document.getElementById("next");
    const nombreExternoInput = document.getElementById("nombre-externo");
    const otrosDetalle = document.getElementById("otros-detalle");
    const observacionesAdicionales = document.getElementById("observaciones-adicionales");

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
        } else if (rol === "Externo") {
            // Permitir avanzar directamente para externos
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
            guardarEnLocalStorage("modulo3", { rol, nombreExterno: nombreExternoInput.value.trim() });
            return;
        }

        // Validar llave ingresada
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

            // Guardar datos en Local Storage
            guardarEnLocalStorage("modulo3", { rol, llave, supervisor: nombreSupervisor });
        } else {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Llave no válida. Intenta nuevamente.";
        }
    });

    // Mostrar campo de texto para "Otros" y habilitar observaciones adicionales
    document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
        radio.addEventListener("change", (event) => {
            const seleccion = event.target.value;

            if (seleccion === "Otros") {
                otrosDetalle.style.display = "block";
                otrosDetalle.required = true; // Obligatorio para "Otros"
                observacionesAdicionales.style.display = "none"; // Deshabilitar observaciones adicionales
                observacionesAdicionales.value = ""; // Limpiar valor
            } else {
                otrosDetalle.style.display = "none";
                otrosDetalle.required = false;
                observacionesAdicionales.style.display = "block";
            }

            // Mostrar botón "Continuar" al seleccionar cualquier clasificación
            nextButton.style.display = "block";
        });
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const clasificacionSeleccionada = document.querySelector('input[name="clasificacion"]:checked');

        if (!clasificacionSeleccionada) {
            alert("Por favor selecciona una clasificación para continuar.");
            return;
        }

        const clasificacion = clasificacionSeleccionada.value;
        const detalleOtros = otrosDetalle.value.trim();
        const observaciones = observacionesAdicionales.value.trim();

        if (clasificacion === "Otros" && !detalleOtros) {
            alert("Por favor describe la observación en el campo de texto.");
            return;
        }

        guardarEnLocalStorage("modulo3", {
            clasificacion,
            detalleOtros: clasificacion === "Otros" ? detalleOtros : null,
            observacionesAdicionales: observaciones || null,
        });

        // Redirigir al siguiente módulo
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
