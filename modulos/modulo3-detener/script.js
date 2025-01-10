document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {}; // Datos cargados desde roles.json
    let datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {}; // Recuperar datos almacenados

    // Tabla de mapeo de roles a claves de JSON
    const roleKeyMapping = {
        "Supervisor de Seguridad": "supervisoresSeguridad",
        "Supervisor de Obra": "supervisoresObra",
        "Guardia en Turno": "guardiasTurno"
    };

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const observacionesFieldset = document.getElementById("observaciones-adicionales");
    const nextButton = document.getElementById("next");
    const mensajeValidacion = document.getElementById("mensaje-validacion");

    // Cargar roles y llaves desde JSON
    async function loadRolesAndKeys() {
        try {
            const response = await fetch("/data/roles.json");
            if (!response.ok) throw new Error("Error al cargar roles.json");
            rolesYllaves = await response.json();

            // Validar estructura esperada
            const rolesEsperados = Object.values(roleKeyMapping);
            rolesEsperados.forEach((rol) => {
                if (!rolesYllaves[rol]) {
                    console.warn(`Rol faltante: ${rol} en roles.json`);
                }
            });

            console.log("Roles y llaves cargados:", rolesYllaves);
        } catch (error) {
            console.error("Error al cargar roles y llaves:", error);
            alert("No se pudieron cargar los roles y llaves. Verifica la conexión.");
        }
    }

    // Mostrar campos según el rol seleccionado
    rolRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;
            datosAcumulados.rolSeleccionado = rolSeleccionado;
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));

            // Mostrar campo correspondiente según el rol
            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.style.display = "none";
                validacionNombreFieldset.style.display = "block";

                // Reiniciar campos para Externo
                document.getElementById("nombre-externo").value = "";
                document.getElementById("telefono-externo").value = "";
            } else {
                validacionLlaveFieldset.style.display = "block";
                validacionNombreFieldset.style.display = "none";
            }
            clasificacionFieldset.style.display = "none";
            observacionesFieldset.style.display = "none";
            nextButton.style.display = "none";
        });
    });

    // Validar llave
    document.getElementById("validar-llave").addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();
        const rolSeleccionado = datosAcumulados.rolSeleccionado;

        if (!llave) {
            alert("Por favor, ingresa una llave.");
            return;
        }

        if (!rolSeleccionado || !roleKeyMapping[rolSeleccionado]) {
            alert("Rol no válido o no seleccionado.");
            return;
        }

        const rolKey = roleKeyMapping[rolSeleccionado]; // Obtener la clave mapeada
        const supervisores = rolesYllaves[rolKey]?.supervisores || {};

        if (!supervisores || Object.keys(supervisores).length === 0) {
            alert("No se encontraron supervisores para el rol seleccionado.");
            return;
        }

        let llaveValida = false;

        Object.entries(supervisores).forEach(([nombre, llaves]) => {
            if (Array.isArray(llaves) && llaves.includes(llave)) {
                llaveValida = true;
            }
        });

        if (llaveValida) {
            alert("Llave válida.");
            clasificacionFieldset.style.display = "block";
        } else {
            alert("Llave no válida. Intenta nuevamente.");
        }
    });

    // Continuar con nombre y teléfono para externos
    document.getElementById("continuar-externo").addEventListener("click", () => {
        const nombre = document.getElementById("nombre-externo").value.trim();
        const telefono = document.getElementById("telefono-externo").value.trim();

        if (!nombre || !telefono) {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.textContent = "Por favor, completa el nombre y el teléfono.";
            return;
        }

        datosAcumulados.nombreExterno = nombre;
        datosAcumulados.telefonoExterno = telefono;
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        mensajeValidacion.style.display = "none";
        clasificacionFieldset.style.display = "block";
    });

    // Manejar selección de clasificación
    document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
            const clasificacion = e.target.value;
            datosAcumulados.clasificacionSeleccionada = clasificacion;
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));

            if (clasificacion === "Otros") {
                document.getElementById("otros-detalle").style.display = "block";
            } else {
                document.getElementById("otros-detalle").style.display = "none";
            }
            observacionesFieldset.style.display = "block";
            nextButton.style.display = "block";
        });
    });

    // Guardar observaciones adicionales
    document.getElementById("observaciones-texto").addEventListener("input", (e) => {
        datosAcumulados.observacionesAdicionales = e.target.value;
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        window.location.href = "/modulos/modulo4-observar/";
    });

    // Inicialización
    loadRolesAndKeys();
});
