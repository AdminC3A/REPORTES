document.addEventListener("DOMContentLoaded", () => {
    let rolesYllaves = {};

    // Cargar roles y llaves desde JSON
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

        // Validar la llave y extraer el nombre
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
            console.error("Llave no válida.");
        }
    });

    // Opción para trabajar sin llave
    document.getElementById("trabajar-sin-llave").addEventListener("click", () => {
        const confirmar = confirm("¿Seguro que deseas trabajar sin llave? Esto será registrado en el reporte.");
        if (confirmar) {
            clasificacionFieldset.style.display = "block";
            validacionLlaveFieldset.style.display = "none";
            console.warn("Trabajando sin llave. Esto será registrado.");
        }
    });
});
