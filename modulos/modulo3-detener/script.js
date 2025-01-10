document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {}; // Datos cargados desde roles.json
    let datosAcumulados = JSON.parse(localStorage.getItem("reporte")) || {};

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const llaveInput = document.getElementById("llave");
    const validarLlaveBtn = document.getElementById("validar-llave");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const supervisorNombre = document.getElementById("supervisor-nombre");
    const nextButton = document.getElementById("next");

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
            datosAcumulados.modulo3 = {
                ...datosAcumulados.modulo3,
                rolSeleccionado: rolSeleccionado,
            };
            localStorage.setItem("reporte", JSON.stringify(datosAcumulados));

            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.style.display = "none";
                llaveValida = true; // Externos no requieren validación de llave
            } else {
                validacionLlaveFieldset.style.display = "block";
                llaveValida = false;
            }
        });
    });

    // Validar llave
    validarLlaveBtn.addEventListener("click", () => {
        const llave = llaveInput.value.trim();
        const rolSeleccionado = datosAcumulados.modulo3?.rolSeleccionado;

        if (!llave) {
            alert("Por favor, ingresa una llave.");
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
                llaveValida = true;
                datosAcumulados.modulo3 = {
                    ...datosAcumulados.modulo3,
                    llave: llave,
                    supervisor: supervisor[0],
                };
                localStorage.setItem("reporte", JSON.stringify(datosAcumulados));
                mensajeValidacion.style.display = "none";
                supervisorNombre.style.display = "block";
                supervisorNombre.querySelector("span").textContent = supervisor[0];
                alert("Llave válida.");
                nextButton.style.display = "block";
            } else {
                llaveValida = false;
                mensajeValidacion.style.display = "block";
                mensajeValidacion.textContent = "Llave no válida. Intenta nuevamente.";
            }
        } else {
            alert("Rol no encontrado en roles.json.");
        }
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        if (!llaveValida) {
            alert("Por favor, valida la llave antes de continuar.");
            return;
        }
        window.location.href = "/modulos/modulo4-observar/";
    });

    // Inicializar datos
    loadRolesAndKeys();
});
