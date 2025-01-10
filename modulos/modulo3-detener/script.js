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
            datosAcumulados.modulo3 = { ...datosAcumulados.modulo3, rolSeleccionado };
            localStorage.setItem("reporte", JSON.stringify(datosAcumulados));

            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.classList.add("hidden");
                validacionNombreFieldset.classList.remove("hidden");
                llaveValida = true; // No requiere validación de llave
            } else {
                validacionLlaveFieldset.classList.remove("hidden");
                validacionNombreFieldset.classList.add("hidden");
                llaveValida = false; // Requiere validación de llave
            }

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
            llaveValida = Object.entries(supervisores).some(([nombre, llaves]) =>
                llaves.includes(llave)
            );

            if (llaveValida) {
                mensajeValidacionLlave.classList.add("hidden");
                alert("Llave válida.");
                nextButton.classList.remove("hidden");
            } else {
                mensajeValidacionLlave.textContent = "Llave no válida. Intenta nuevamente.";
                mensajeValidacionLlave.classList.remove("hidden");
            }
        } else {
            alert("Rol no encontrado en roles.json.");
        }

        localStorage.setItem("reporte", JSON.stringify(datosAcumulados));
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

        localStorage.setItem("reporte", JSON.stringify(datosAcumulados));
        window.location.href = "/modulos/modulo4-observar/";
    });

    loadRolesAndKeys();
});
