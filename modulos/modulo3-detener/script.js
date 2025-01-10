document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {}; // Datos cargados desde roles.json
    let datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {};

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const clasificacionRadios = document.querySelectorAll('input[name="clasificacion"]');
    const observacionesFieldset = document.getElementById("observaciones-adicionales");
    const descripcionFieldset = document.getElementById("descripcion");
    const descripcionTexto = document.getElementById("descripcion-texto");
    const observacionesTexto = document.getElementById("observaciones-texto");
    const nextButton = document.getElementById("next");
    const mensajeValidacion = document.getElementById("mensaje-validacion");

    let llaveValida = false;

    // Cargar datos desde roles.json
    async function loadRolesAndKeys() {
        try {
            const response = await fetch("/data/roles.json");
            if (!response.ok) throw new Error("Error al cargar roles.json");
            rolesYllaves = await response.json();
            console.log("Roles y llaves cargados:", rolesYllaves);
        } catch (error) {
            console.error("Error al cargar roles.json:", error);
            alert("No se pudieron cargar los datos de roles y llaves. Verifica la conexión.");
        }
    }

    // Mostrar campos según el rol seleccionado
    rolRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;
            datosAcumulados.rolSeleccionado = rolSeleccionado;
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));

            if (rolSeleccionado === "Externo") {
                // Mostrar campos de nombre y teléfono para "Externo"
                validacionLlaveFieldset.style.display = "none";
                validacionNombreFieldset.style.display = "block";

                // Reiniciar valores
                document.getElementById("nombre-externo").value = "";
                document.getElementById("telefono-externo").value = "";
                llaveValida = true; // Externos no requieren validación de llave
            } else {
                // Mostrar validación de llave para otros roles
                validacionLlaveFieldset.style.display = "block";
                validacionNombreFieldset.style.display = "none";
                llaveValida = false; // Requieren validación de llave
            }

            clasificacionFieldset.style.display = "none";
            observacionesFieldset.style.display = "none";
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

        // Buscar el rol seleccionado en roles.json
        const rolKey = Object.keys(rolesYllaves).find(
            (key) => rolesYllaves[key].rol === rolSeleccionado
        );

        if (rolKey) {
            // Buscar llave en los supervisores del rol seleccionado
            const supervisores = rolesYllaves[rolKey]?.supervisores || {};
            llaveValida = Object.entries(supervisores).some(([nombre, llaves]) =>
                llaves.includes(llave)
            );

            if (llaveValida) {
                alert("Llave válida.");
                datosAcumulados.llave = llave;
                clasificacionFieldset.style.display = "block";
            } else {
                alert("Llave no válida. Intenta nuevamente.");
            }
        } else {
            alert("Rol no encontrado en roles.json.");
        }

        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
    });

    // Manejar selección de clasificación
    clasificacionRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
            const clasificacion = e.target.value;
            datosAcumulados.clasificacionSeleccionada = clasificacion;
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));

            // Mostrar campos según la selección
            if (clasificacion === "Otros") {
                // Mostrar descripción (obligatoria)
                descripcionFieldset.style.display = "block";
                observacionesFieldset.style.display = "none";
                descripcionTexto.required = true; // Hacer obligatorio
                observacionesTexto.required = false; // Quitar obligatoriedad
            } else {
                // Mostrar observaciones adicionales (opcional)
                descripcionFieldset.style.display = "none";
                observacionesFieldset.style.display = "block";
                descripcionTexto.required = false; // Quitar obligatoriedad
                observacionesTexto.required = false; // Sigue siendo opcional
            }
        });
    });

    // Validar campos antes de avanzar
    nextButton.addEventListener("click", () => {
        const rolSeleccionado = datosAcumulados.rolSeleccionado;

        // Validar "Externo" con nombre o teléfono
        if (rolSeleccionado === "Externo") {
            const nombre = document.getElementById("nombre-externo").value.trim();
            const telefono = document.getElementById("telefono-externo").value.trim();

            if (!nombre && !telefono) {
                mensajeValidacion.style.display = "block";
                mensajeValidacion.textContent = "Por favor, ingresa al menos tu nombre o teléfono.";
                return;
            }

            if (nombre) datosAcumulados.nombreExterno = nombre;
            if (telefono) datosAcumulados.telefonoExterno = telefono;
        } else {
            if (!llaveValida) {
                alert("Por favor, valida la llave antes de continuar.");
                return;
            }
        }

        // Validar descripción si es visible y requerida
        if (descripcionFieldset.style.display === "block" && !descripcionTexto.value.trim()) {
            alert("Por favor, completa la descripción.");
            descripcionTexto.focus();
            return;
        }

        // Guardar observaciones o descripción según el caso
        if (observacionesFieldset.style.display === "block" && observacionesTexto.value.trim()) {
            datosAcumulados.observacionesAdicionales = observacionesTexto.value.trim();
        }

        if (descripcionFieldset.style.display === "block" && descripcionTexto.value.trim()) {
            datosAcumulados.descripcion = descripcionTexto.value.trim();
        }

        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        console.log("Datos acumulados:", datosAcumulados);

        // Redirigir al siguiente módulo
        window.location.href = "/modulos/modulo4-observar/";
    });

    // Inicializar el estado
    loadRolesAndKeys();
    nextButton.style.display = "block";
});
