document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {};

    // Cargar roles y llaves desde JSON.
    fetch('/data/roles.json')
        .then(response => response.json())
        .then(data => {
            rolesYllaves = data;
            console.log("Roles y llaves cargados:", rolesYllaves);
        })
        .catch(error => console.error("Error al cargar roles y llaves:", error));

    const rolRadios = document.querySelectorAll('input[name="rol"]');
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const validarLlaveBtn = document.getElementById("validar-llave");
    const mensajeValidacion = document.getElementById("mensaje-validacion");
    const trabajarSinLlaveBtn = document.getElementById("trabajar-sin-llave");
    const otrosDetalle = document.getElementById("otros-detalle");
    const otrosEjemplos = document.getElementById("otros-ejemplos");
    const nextButton = document.getElementById("next");

    // Mostrar el campo de validación de llave al seleccionar un rol
    rolRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            validacionLlaveFieldset.style.display = "block";
            mensajeValidacion.style.display = "none"; // Ocultar mensaje de error al cambiar de rol
        });
    });

    // Validar la llave ingresada
    validarLlaveBtn.addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();
        const rolSeleccionado = document.querySelector('input[name="rol"]:checked').value;

        if (!llave || !rolSeleccionado) {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Por favor selecciona un rol y proporciona una llave.";
            return;
        }

        let supervisores = {};
        if (rolSeleccionado === "Supervisor de Seguridad") {
            supervisores = rolesYllaves.supervisoresSeguridad.supervisores;
        } else if (rolSeleccionado === "Supervisor de Obra") {
            supervisores = rolesYllaves.supervisoresObra.supervisores;
        } else if (rolSeleccionado === "Guardia en Turno") {
            supervisores = rolesYllaves.guardiasTurno.supervisores;
        }

        // Validar la llave ingresada
        let llaveValida = false;
        let nombreSupervisor = "";

        Object.entries(supervisores).forEach(([nombre, llaves]) => {
            if (llaves.includes(llave)) {
                llaveValida = true;
                nombreSupervisor = nombre;
            }
        });

        if (llaveValida) {
            console.log(`Llave válida para ${nombreSupervisor}`);
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
        } else {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Llave no válida. Intenta nuevamente.";
        }
    });

    // Mostrar campo de texto y ejemplos si seleccionan "Otros"
    document.querySelectorAll('input[name="clasificacion"]').forEach(radio => {
        radio.addEventListener("change", (event) => {
            if (event.target.value === "Otros") {
                otrosDetalle.style.display = "block";
                otrosEjemplos.style.display = "block";
            } else {
                otrosDetalle.style.display = "none";
                otrosEjemplos.style.display = "none";
            }

            // Mostrar botón para continuar
            nextButton.style.display = "block";
        });
    });

    // Capturar clic en ejemplos y completar el campo de texto
    document.querySelectorAll('.ejemplo-opcion').forEach(ejemplo => {
        ejemplo.addEventListener("click", (event) => {
            const textoEjemplo = event.target.getAttribute("data-value");
            otrosDetalle.value = textoEjemplo;
        });
    });

    // Continuar al siguiente módulo
    nextButton.addEventListener("click", () => {
        const seleccion = document.querySelector('input[name="clasificacion"]:checked');
        if (!seleccion) {
            alert("Por favor selecciona una clasificación para continuar.");
            return;
        }

        // Validar que si es "Otros", se haya ingresado un detalle
        if (seleccion.value === "Otros" && !otrosDetalle.value.trim()) {
            alert("Por favor describe la observación en el campo de texto.");
            return;
        }

        // Redirigir al módulo 4
        window.location.href = "/modulos/modulo4-observar/index.html";
    });

    // Permitir trabajar sin llave
    trabajarSinLlaveBtn.addEventListener("click", () => {
        const confirmar = confirm("¿Seguro que deseas trabajar sin llave? Esto será registrado en el reporte.");
        if (confirmar) {
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
            console.warn("Trabajando sin llave. Esto será registrado.");
        }
    });
});
