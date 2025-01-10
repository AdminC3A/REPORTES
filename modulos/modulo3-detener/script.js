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

    let llaveValida = false;

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
                llaveValida = true; // No requiere llave
            } else {
                // Mostrar validación de llave para otros roles
                validacionLlaveFieldset.style.display = "block";
                validacionNombreFieldset.style.display = "none";
                llaveValida = false; // Requiere validación de llave
            }

            clasificacionFieldset.style.display = "none";
            observacionesFieldset.style.display = "none";
        });
    });

    // Validar llave
    document.getElementById("validar-llave").addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();
        if (!llave) {
            alert("Por favor, ingresa una llave.");
            return;
        }

        // Lógica de validación de llave (reemplazar con lógica real)
        const supervisores = {
            "1234": "Empleado 1",
            "5678": "Empleado 2",
            "abcd": "Empleado 3"
        };

        if (supervisores[llave]) {
            alert(`Llave válida. Identificado: ${supervisores[llave]}`);
            datosAcumulados.llave = llave;
            datosAcumulados.nombreEmpleado = supervisores[llave];
            llaveValida = true;
            clasificacionFieldset.style.display = "block";
        } else {
            alert("Llave no válida. Intenta nuevamente.");
            llaveValida = false;
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
                mensajeValidacion.textContent = "Por favor ingresa al menos tu nombre o teléfono.";
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
    nextButton.style.display = "block";
});
