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

    let llaveValida = false; // Bandera para validar si la llave es válida

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
                llaveValida = true; // Externos no necesitan validar llave
            } else {
                validacionLlaveFieldset.style.display = "block";
                validacionNombreFieldset.style.display = "none";
                llaveValida = false; // Reiniciar la validación de llave
            }
            clasificacionFieldset.style.display = "none";
            observacionesFieldset.style.display = "none";
            nextButton.style.display = "block";
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

        // Lógica de validación de llave (reemplazar con tu lógica real)
        const supervisores = {
            "1234": "Empleado 1",
            "5678": "Empleado 2",
            "abcd": "Empleado 3"
        };

        if (supervisores[llave]) {
            alert(`Llave válida. Identificado: ${supervisores[llave]}`);
            datosAcumulados.llave = llave;
            datosAcumulados.nombreEmpleado = supervisores[llave];
            llaveValida = true; // Bandera de validación
            clasificacionFieldset.style.display = "block";
        } else {
            alert("Llave no válida. Intenta nuevamente.");
            llaveValida = false; // No se permite avanzar
        }
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
    });

    // Continuar con nombre y teléfono para externos
document.getElementById("continuar-externo").addEventListener("click", () => {
    const nombre = document.getElementById("nombre-externo").value.trim();
    const telefono = document.getElementById("telefono-externo").value.trim();

    // Validación de teléfono
    const regexTelefono = /^[0-9]{10}$/;
    if (telefono && !regexTelefono.test(telefono)) {
        alert("Por favor, ingresa un número de teléfono válido con 10 dígitos.");
        return;
    }

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
        const rolSeleccionado = datosAcumulados.rolSeleccionado;

        if (rolSeleccionado !== "Externo" && !llaveValida) {
            alert("Por favor, valida la llave antes de continuar.");
            return;
        }

        if (rolSeleccionado === "Externo") {
            const nombre = datosAcumulados.nombreExterno || "";
            const telefono = datosAcumulados.telefonoExterno || "";
            if (!nombre && !telefono) {
                alert("Por favor, completa al menos el nombre o el teléfono antes de avanzar.");
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
