document.addEventListener("DOMContentLoaded", () => {
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const validacionNombreFieldset = document.getElementById("validacion-nombre");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const observacionesFieldset = document.getElementById("observaciones-adicionales");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const nextButton = document.getElementById("next");
    const otrosDetalle = document.getElementById("otros-detalle");
    const observacionesTexto = document.getElementById("observaciones-texto");

    // Mostrar campos según el rol
    rolRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const rolSeleccionado = radio.value;

            if (rolSeleccionado === "Externo") {
                validacionNombreFieldset.style.display = "block";
                validacionLlaveFieldset.style.display = "none";
            } else {
                validacionNombreFieldset.style.display = "none";
                validacionLlaveFieldset.style.display = "block";
            }

            clasificacionFieldset.style.display = "none";
            observacionesFieldset.style.display = "none";
            nextButton.style.display = "none";
        });
    });

    // Mostrar campo "Otros" o "Observaciones Adicionales"
    clasificacionFieldset.addEventListener("change", () => {
        const seleccion = document.querySelector('input[name="clasificacion"]:checked');

        if (seleccion.value === "Otros") {
            otrosDetalle.style.display = "block";
            observacionesFieldset.style.display = "none";
        } else {
            otrosDetalle.style.display = "none";
            observacionesFieldset.style.display = "block";
        }

        nextButton.style.display = "block";
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const clasificacion = document.querySelector('input[name="clasificacion"]:checked').value;
        const otrosTexto = otrosDetalle.value.trim();
        const observaciones = observacionesTexto.value.trim();

        if (clasificacion === "Otros" && !otrosTexto) {
            alert("Por favor describe la observación para 'Otros'.");
            return;
        }

        const datos = {
            rol: document.querySelector('input[name="rol"]:checked').value,
            clasificacion,
            detalleOtros: clasificacion === "Otros" ? otrosTexto : null,
            observacionesAdicionales: observaciones || null,
        };

        localStorage.setItem("modulo3Datos", JSON.stringify(datos));
        window.location.href = "/modulos/modulo4-observar/index.html";
    });
});
