document.addEventListener("DOMContentLoaded", () => {
    // Recuperar datos previos o inicializar objeto vacío
    let datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {};

    // Validar que existan datos de módulos anteriores
    if (!datosAcumulados.modulo1 || !datosAcumulados.modulo2) {
        alert("Faltan datos de módulos anteriores. Por favor, completa los pasos previos.");
        window.location.href = "/modulos/modulo1-inicio/"; // Redirigir al primer módulo
        return;
    }

    // Inicializar datos del Módulo 3 si no existen
    datosAcumulados.modulo3 = datosAcumulados.modulo3 || {};

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const observacionesFieldset = document.getElementById("observaciones-adicionales");
    const nextButton = document.getElementById("next");
    const mensajeValidacion = document.getElementById("mensaje-validacion");

    // Mostrar campos según el rol seleccionado
    rolRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;
            datosAcumulados.modulo3.rolSeleccionado = rolSeleccionado;
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));

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
        const rolSeleccionado = datosAcumulados.modulo3.rolSeleccionado;

        if (!llave) {
            alert("Por favor, ingresa una llave.");
            return;
        }

        // Validar llave (simplificado para este ejemplo)
        if (llave === "1234") { // Cambiar según lógica real
            alert("Llave válida.");
            datosAcumulados.modulo3.llave = llave;
            clasificacionFieldset.style.display = "block";
        } else {
            alert("Llave no válida. Intenta nuevamente.");
        }
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
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

        datosAcumulados.modulo3.nombreExterno = nombre;
        datosAcumulados.modulo3.telefonoExterno = telefono;
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        mensajeValidacion.style.display = "none";
        clasificacionFieldset.style.display = "block";
    });

    // Manejar selección de clasificación
    document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
            const clasificacion = e.target.value;
            datosAcumulados.modulo3.clasificacionSeleccionada = clasificacion;

            if (clasificacion === "Otros") {
                document.getElementById("otros-detalle").style.display = "block";
            } else {
                document.getElementById("otros-detalle").style.display = "none";
            }

            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
            observacionesFieldset.style.display = "block";
            nextButton.style.display = "block";
        });
    });

    // Guardar observaciones adicionales
    document.getElementById("observaciones-texto").addEventListener("input", (e) => {
        datosAcumulados.modulo3.observacionesAdicionales = e.target.value;
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        console.log("Datos acumulados hasta el Módulo 3:", datosAcumulados);
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        window.location.href = "/modulos/modulo4-observar/";
    });
});
