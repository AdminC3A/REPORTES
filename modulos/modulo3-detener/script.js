document.addEventListener("DOMContentLoaded", () => {
    let datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {};

    // Elementos del DOM
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const observacionesFieldset = document.getElementById("observaciones-adicionales");
    const nextButton = document.getElementById("next");

    // Mostrar campos según el rol seleccionado
    rolRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;
            datosAcumulados.rolSeleccionado = rolSeleccionado;
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));

            if (rolSeleccionado === "Externo") {
                // Mostrar ambos campos para "Externo"
                validacionLlaveFieldset.style.display = "none";
                validacionNombreFieldset.style.display = "block";

                // Reiniciar campos de "Externo"
                document.getElementById("nombre-externo").value = "";
                document.getElementById("telefono-externo").value = "";
            } else {
                // Mostrar validación de llave para otros roles
                validacionLlaveFieldset.style.display = "block";
                validacionNombreFieldset.style.display = "none";
            }

            clasificacionFieldset.style.display = "none";
            observacionesFieldset.style.display = "none";
        });
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const rolSeleccionado = datosAcumulados.rolSeleccionado;

        if (rolSeleccionado === "Externo") {
            const nombre = document.getElementById("nombre-externo").value.trim();
            const telefono = document.getElementById("telefono-externo").value.trim();

            if (!nombre && !telefono) {
                alert("Por favor, ingresa al menos el nombre o el teléfono antes de avanzar.");
                return;
            }

            if (nombre) datosAcumulados.nombreExterno = nombre;
            if (telefono) datosAcumulados.telefonoExterno = telefono;
        } else {
            if (!datosAcumulados.llave) {
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
