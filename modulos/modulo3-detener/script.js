document.addEventListener("DOMContentLoaded", () => {
    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlave = document.getElementById("validacion-llave");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const fallaAdministrativaFieldset = document.getElementById("falla-administrativa");
    const nextButton = document.getElementById("next");

    // Mostrar validación de llave al seleccionar rol
    rolRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            validacionLlave.style.display = "block";
        });
    });

    // Validar llave
    document.getElementById("validar-llave").addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();
        if (llave === "1234") { // Reemplaza con la lógica real de validación
            clasificacionFieldset.style.display = "block";
            validacionLlave.style.display = "none";
        } else {
            document.getElementById("mensaje-validacion").style.display = "block";
        }
    });

    // Mostrar opciones dinámicas para Falla Administrativa
    document.querySelectorAll('input[name="clasificacion"]').forEach(radio => {
        radio.addEventListener("change", (event) => {
            if (event.target.value === "Falla Administrativa") {
                fallaAdministrativaFieldset.style.display = "block";
            } else {
                fallaAdministrativaFieldset.style.display = "none";
            }
            nextButton.style.display = "block";
        });
    });
});
