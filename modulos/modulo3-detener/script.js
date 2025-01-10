document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {}; // Datos cargados desde roles.json
    let datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {};

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const observacionesFieldset = document.getElementById("observaciones-adicionales");
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
                validacionLlaveFieldset.style.display = "none";
                validacionNombreFieldset.style.display = "block";

                document.getElementById("nombre-externo").value = "";
                document.getElementById("telefono-externo").value = "";
                llaveValida = true; // Externos no requieren validación de llave
            } else {
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

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const rolSeleccionado = datosAcumulados.rolSeleccionado;

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

        console.log("Datos acumulados hasta el Módulo 3:", datosAcumulados);
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        window.location.href = "/modulos/modulo4-observar/";
    });

    // Inicializar el estado
    loadRolesAndKeys();
    nextButton.style.display = "block";
});
