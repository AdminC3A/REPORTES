document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {}; // Datos cargados desde roles.json
    let datosAcumulados = JSON.parse(localStorage.getItem("reporte")) || {};

    // Referencias al DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const nextButton = document.getElementById("next");
    const llaveInput = document.getElementById("llave");
    const mensajeValidacionLlave = document.getElementById("mensaje-validacion");
    const mensajeValidacionNombre = document.getElementById("mensaje-validacion-nombre");
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

    // Manejar selección de rol
    rolRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;

            // Guardar selección de rol en Local Storage
            datosAcumulados.modulo3 = { ...datosAcumulados.modulo3, rolSeleccionado };
            localStorage.setItem("reporte", JSON.stringify(datosAcumulados));
            console.log("Rol seleccionado guardado:", rolSeleccionado);

            // Mostrar u ocultar secciones basadas en el rol seleccionado
            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.classList.add("hidden");
                validacionNombreFieldset.classList.remove("hidden");
                llaveValida = true; // Externos no requieren validación de llave
            } else {
                validacionLlaveFieldset.classList.remove("hidden");
                validacionNombreFieldset.classList.add("hidden");
                llaveValida = false; // Requieren validación de llave
            }

            // Ocultar mensajes de validación
            mensajeValidacionLlave.classList.add("hidden");
            mensajeValidacionNombre.classList.add("hidden");
            nextButton.classList.add("hidden");
        });
    });

    // Validar llave
    document.getElementById("validar-llave").addEventListener("click", () => {
        const llave = llaveInput.value.trim();
        const rolSeleccionado = datosAcumulados.modulo3?.rolSeleccionado;

        if (!llave) {
            mensajeValidacionLlave.textContent = "Por favor, ingresa una llave.";
            mensajeValidacionLlave.classList.remove("hidden");
            return;
        }

        const rolKey = Object.keys(rolesYllaves).find(
            (key) => rolesYllaves[key].rol === rolSeleccionado
        );

        if (rolKey) {
            const supervisores = rolesYllaves[rolKey]?.supervisores || {};
            const supervisor = Object.entries(supervisores).find(([nombre, llaves]) =>
                llaves.includes(llave)
            );

            if (supervisor) {
                const [nombreSupervisor] = supervisor;
                mensajeValidacionLlave.classList.add("hidden");

                // Mostrar el nombre del propietario de la llave
                alert(`Llave válida. Propietario: ${nombreSupervisor}`);

                // Guardar datos en Local Storage
                datosAcumulados.modulo3 = { ...datosAcumulados.modulo3, llave, supervisor: nombreSupervisor };
                localStorage.setItem("reporte", JSON.stringify(datosAcumulados));

                llaveValida = true;
                nextButton.classList.remove("hidden");
            } else {
                mensajeValidacionLlave.textContent = "Llave no válida. Intenta nuevamente.";
                mensajeValidacionLlave.classList.remove("hidden");
                llaveValida = false;
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
                mensajeValidacionNombre.textContent = "Por favor, ingresa al menos tu nombre o teléfono.";
                mensajeValidacionNombre.classList.remove("hidden");
                return;
            }

            datosAcumulados.modulo3 = {
                ...datosAcumulados.modulo3,
                nombreExterno: nombre || datosAcumulados.modulo3?.nombreExterno,
                telefonoExterno: telefono || datosAcumulados.modulo3?.telefonoExterno,
            };
        }

        if (!llaveValida && rolSeleccionado !== "Externo") {
            alert("Por favor, valida la llave antes de continuar.");
            return;
        }

        // Guardar datos acumulados en Local Storage
        localStorage.setItem("reporte", JSON.stringify(datosAcumulados));
        console.log("Datos guardados en módulo 3:", datosAcumulados);

        window.location.href = "/modulos/modulo4-observar/";
    });

    loadRolesAndKeys();
});
