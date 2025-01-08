document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {};

    fetch('/data/roles.json')
        .then(response => response.json())
        .then(data => {
            rolesYllaves = data;
            console.log("Roles y llaves cargados:", rolesYllaves);
        })
        .catch(error => console.error("Error al cargar roles y llaves:", error));

    const validarLlaveBtn = document.getElementById("validar-llave");
    const clasificacionFieldset = document.getElementById("clasificacion");
    const validacionLlaveFieldset = document.getElementById("validacion-llave");
    const mensajeValidacion = document.getElementById("mensaje-validacion");

    validarLlaveBtn.addEventListener("click", () => {
        const llave = document.getElementById("llave").value.trim();
        const rolSeleccionado = document.querySelector('input[name="rol"]:checked').value;

        let supervisores = {};
        if (rolSeleccionado === "Supervisor de Seguridad") {
            supervisores = rolesYllaves.supervisoresSeguridad.supervisores;
        } else if (rolSeleccionado === "Supervisor de Obra") {
            supervisores = rolesYllaves.supervisoresObra.supervisores;
        } else if (rolSeleccionado === "Guardia en Turno") {
            supervisores = rolesYllaves.guardiasTurno.supervisores;
        }

        const nombreSupervisor = prompt("Ingresa tu nombre (como aparece en el sistema):");

        if (supervisores[nombreSupervisor] && supervisores[nombreSupervisor].includes(llave)) {
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
            console.log(`Llave válida para ${nombreSupervisor}`);
        } else {
            mensajeValidacion.style.display = "block";
            mensajeValidacion.innerText = "Llave o nombre no válidos. Intenta nuevamente.";
            console.error("Llave o nombre no válidos.");
        }
    });

    document.getElementById("trabajar-sin-llave").addEventListener("click", () => {
        const confirmar = confirm("¿Seguro que deseas trabajar sin llave? Esto será registrado en el reporte.");
        if (confirmar) {
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
            console.warn("Trabajando sin llave. Esto será registrado.");
        }
    });
});
