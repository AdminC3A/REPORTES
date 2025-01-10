document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {}; // Datos cargados desde roles.json
    let datosAcumulados = JSON.parse(localStorage.getItem("reporte")) || {};

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const nextButton = document.getElementById("next");
    const llaveInput = document.getElementById("llave");
    const validacionMensaje = document.createElement("p");
    validacionMensaje.className = "error hidden";
    validacionLlaveFieldset.appendChild(validacionMensaje);

    let llaveValida = false;

    // Limpia solo los datos del módulo 3 en Local Storage
    if (datosAcumulados.modulo3) {
        delete datosAcumulados.modulo3; // Eliminar datos del módulo 3
        localStorage.setItem("reporte", JSON.stringify(datosAcumulados)); // Actualizar almacenamiento
    }

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

    // Manejar selección de rol
    rolRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;

            // Guardar selección de rol en Local Storage
            datosAcumulados.modulo3 = { ...datosAcumulados.modulo3, rolSeleccionado };
            localStorage.setItem("reporte", JSON.stringify(datosAcumulados));

            // Mostrar u ocultar secciones basadas en el rol seleccionado
            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.classList.add("hidden");
                validacionNombreFieldset.classList.remove("hidden");
                llaveValida = true; // No requiere validación de llave
            } else {
                validacionLlaveFieldset.classList.remove("hidden");
                validacionNombreFieldset.classList.add("hidden");
                llaveValida = false; // Requiere validación de llave
            }

            validacionMensaje.classList.add("hidden");
            validacionMensaje.textContent = "";
            nextButton.classList.add("hidden");
        });
    });

    // Validar llave
    document.getElementById("validar-llave").addEventListener("click", () => {
        const llave = llaveInput.value.trim();
        const rolSeleccionado = datosAcumulados.modulo3?.rolSeleccionado;

        if (!llave) {
            validacionMensaje.textContent = "Por favor, ingresa una llave.";
            validacionMensaje.classList.remove("hidden");
            return;
        }

        const rolKey = Object.keys(rolesYllaves).find(
            (key) => rolesYllaves[key].rol === rolSeleccionado
        );

        if (rolKey) {
            const supervisores = rolesYllaves[rolKey]?.supervisores || {};
            llaveValida = Object.entries(supervisores).some(([nombre, llaves]) =>
                llaves.includes(llave)
            );

            if (llaveValida) {
                validacionMensaje.classList.add("hidden");
                validacionMensaje.textContent = "";

                // Guardar llave en Local Storage
                datosAcumulados.modulo3 = { ...datosAcumulados.modulo3, llave };
                localStorage.setItem("reporte", JSON.stringify(datosAcumulados));

                alert("Llave válida.");
                nextButton.classList.remove("hidden");
            } else {
                validacionMensaje.textContent = "Llave no válida.";
                validacionMensaje.classList.remove("hidden");
            }
        } else {
            alert("Rol no encontrado en roles.json.");
        }
    });

    // Validar y continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const rolSeleccionado = datosAcumulados.modulo3?.rolSeleccionado;

        if (rolSeleccionado === "Externo") {
            const nombre = document.getElementById("nombre-externo").value.trim();
            const telefono = document.getElementById("telefono-externo").value.trim();

            if (!nombre && !telefono) {
                const mensajeNombre = document.getElementById("mensaje-validacion-nombre");
                mensajeNombre.textContent = "Por favor, ingresa al menos tu nombre o teléfono.";
                mensajeNombre.classList.remove("hidden");
                return;
            }

            // Guardar datos de "Externo" en Local Storage
            datosAcumulados.modulo3 = {
                ...datosAcumulados.modulo3,
                nombreExterno: nombre || datosAcumulados.modulo3?.nombreExterno,
                telefonoExterno: telefono || datosAcumulados.modulo3?.telefonoExterno,
            };
        } else {
            if (!llaveValida) {
                alert("Por favor, valida la llave antes de continuar.");
                return;
            }
        }

        // Guardar datos acumulados en Local Storage
        localStorage.setItem("reporte", JSON.stringify(datosAcumulados));
        console.log("Datos guardados en módulo 3:", datosAcumulados);

        window.location.href = "/modulos/modulo4-observar/";
    });

    loadRolesAndKeys();
});
