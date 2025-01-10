document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {}; // Datos cargados desde roles.json
     // Obtener los datos actuales del reporte
    const reporte = JSON.parse(localStorage.getItem("reporte")) || {};

    // Eliminar datos residuales específicos del módulo 3
    if (reporte.modulo3) {
        delete reporte.modulo3; // Eliminar los datos del módulo 3
        localStorage.setItem("reporte", JSON.stringify(reporte)); // Guardar el reporte actualizado
        console.log("Datos del módulo 3 eliminados.");
    }


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
            datosAcumulados.modulo3 = {
                ...datosAcumulados.modulo3,
                rolSeleccionado: rolSeleccionado,
            };
            localStorage.setItem("reporte", JSON.stringify(datosAcumulados));
            console.log("Rol seleccionado guardado:", rolSeleccionado);

            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.style.display = "none";
                validacionNombreFieldset.style.display = "block";
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
            llaveValida = Object.entries(supervisores).some(([nombre, llaves]) =>
                llaves.includes(llave)
            );

            if (llaveValida) {
                alert("Llave válida.");
                datosAcumulados.modulo3 = {
                    ...datosAcumulados.modulo3,
                    llave: llave,
                };
                clasificacionFieldset.style.display = "block";
            } else {
                alert("Llave no válida. Intenta nuevamente.");
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
                mensajeValidacion.style.display = "block";
                mensajeValidacion.textContent = "Por favor, ingresa al menos tu nombre o teléfono.";
                return;
            }

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

        if (descripcionFieldset.style.display === "block" && !descripcionTexto.value.trim()) {
            alert("Por favor, completa la descripción.");
            return;
        }

        if (descripcionFieldset.style.display === "block") {
            datosAcumulados.modulo3 = {
                ...datosAcumulados.modulo3,
                descripcion: descripcionTexto.value.trim(),
            };
        }

        if (observacionesFieldset.style.display === "block") {
            datosAcumulados.modulo3 = {
                ...datosAcumulados.modulo3,
                observacionesAdicionales: observacionesTexto.value.trim(),
            };
        }

        localStorage.setItem("reporte", JSON.stringify(datosAcumulados));
        console.log("Datos acumulados en módulo 3:", datosAcumulados);

        window.location.href = "/modulos/modulo4-observar/";
    });

    loadRolesAndKeys();
    nextButton.style.display = "block";
});
