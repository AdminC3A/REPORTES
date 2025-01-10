document.addEventListener("DOMContentLoaded", () => {
    let datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {};

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
            datosAcumulados.rolSeleccionado = rolSeleccionado;
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));

            // Mostrar campos según rol
            if (rolSeleccionado === "Externo") {
                validacionLlaveFieldset.style.display = "none";
                validacionNombreFieldset.style.display = "block";
                document.getElementById("nombre-externo").value = "";
                document.getElementById("telefono-externo").value = "";
            } else {
                validacionLlaveFieldset.style.display = "block";
                validacionNombreFieldset.style.display = "none";
            }
            clasificacionFieldset.style.display = "none";
            observacionesFieldset.style.display = "none";
            nextButton.style.display = "block"; // Permitir avanzar
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

        const llaveValida = true; // Puedes reemplazarlo por tu lógica de validación real

        if (llaveValida) {
            datosAcumulados.llave = llave;
            alert("Llave válida.");
            clasificacionFieldset.style.display = "block";
        } else {
            alert("Llave no válida.");
        }
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
    });

    // Continuar con nombre y teléfono para externos
    document.getElementById("continuar-externo").addEventListener("click", () => {
        const nombre = document.getElementById("nombre-externo").value.trim();
        const telefono = document.getElementById("telefono-externo").value.trim();

        if (!nombre && !telefono) {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.textContent = "Por favor, ingresa al menos un dato para continuar.";
            return;
        }

        if (nombre) datosAcumulados.nombreExterno = nombre;
        if (telefono) datosAcumulados.telefonoExterno = telefono;

        mensajeValidacion.style.display = "none";
        clasificacionFieldset.style.display = "block";
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
    });

    // Manejar selección de clasificación
    document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
            const clasificacion = e.target.value;
            datosAcumulados.clasificacionSeleccionada = clasificacion;

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
        datosAcumulados.observacionesAdicionales = e.target.value;
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        if (
            datosAcumulados.rolSeleccionado ||
            datosAcumulados.llave ||
            datosAcumulados.nombreExterno ||
            datosAcumulados.telefonoExterno ||
            datosAcumulados.clasificacionSeleccionada ||
            datosAcumulados.observacionesAdicionales
        ) {
            console.log("Datos acumulados hasta el Módulo 3:", datosAcumulados);
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
            window.location.href = "/modulos/modulo4-observar/";
        } else {
            alert("Por favor, completa al menos un campo antes de avanzar.");
        }
    });

    // Inicializar el estado
    nextButton.style.display = "block"; // Mostrar el botón desde el inicio
});
