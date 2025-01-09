// script.js para el Módulo 4: Mostrar acciones A (Corregir) y B (Retroalimentar)

// Recuperar datos de los módulos anteriores desde localStorage
const datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {};

// Verificar si hay datos acumulados
if (!datosAcumulados.accionSeleccionada || !datosAcumulados.clasificacionSeleccionada) {
    alert("Faltan datos acumulados de los módulos anteriores. Redirigiendo...");
    window.location.href = "/modulos/modulo2-decidir/";
}

// Cargar el archivo CSV con las combinaciones
Papa.parse('/data/combinaciones_botones.csv', {
    download: true,
    header: true, // Usar las cabeceras como claves
    complete: function (results) {
        const combinaciones = results.data; // Datos cargados del CSV
        console.log("Combinaciones cargadas:", combinaciones);

        // Procesar las combinaciones basadas en los datos acumulados
        mostrarAccion(combinaciones, datosAcumulados);
    },
    error: function (error) {
        console.error("Error al cargar el CSV:", error);
    }
});

// Función para mostrar la acción a implementar
function mostrarAccion(combinaciones, datos) {
    // Buscar la combinación relevante basada en los datos acumulados
    const combinacion = combinaciones.find(c => 
        c.Accion === datos.accionSeleccionada &&
        c.Clasificacion === datos.clasificacionSeleccionada
    );

    // Si se encuentra una combinación válida, mostrar las opciones
    if (combinacion) {
        console.log("Combinación seleccionada:", combinacion);

        // Actualizar contenido dinámico con las acciones
        actualizarContenido(combinacion);
    } else {
        console.error("No se encontró una combinación para los datos seleccionados.");
        const contenedor = document.getElementById("contenedor-dinamico");
        contenedor.innerHTML = `<p>No se encontraron acciones para los datos proporcionados.</p>`;
    }
}

// Función para actualizar el contenido dinámico
function actualizarContenido(combinacion) {
    const contenedor = document.getElementById("contenedor-dinamico");
    contenedor.innerHTML = `
        <h2>Acción Seleccionada: ${combinacion.Accion}</h2>
        <p>Clasificación: ${combinacion.Clasificacion}</p>
        <button id="btn-corregir">A. Corregir</button>
        <button id="btn-retroalimentar">B. Retroalimentar</button>
    `;

    // Configurar botones
    document.getElementById("btn-corregir").onclick = () => {
        alert(`Acción Correctiva: ${combinacion.BotonCorregir}`);
        // Guardar la elección en localStorage y continuar
        datosAcumulados.modulo4 = { accion: combinacion.Accion, tipo: "Corregir" };
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        window.location.href = "/modulos/modulo5-corregir/";
    };

    document.getElementById("btn-retroalimentar").onclick = () => {
        alert(`Retroalimentación: ${combinacion.BotonRetroalimentar}`);
        // Guardar la elección en localStorage y continuar
        datosAcumulados.modulo4 = { accion: combinacion.Accion, tipo: "Retroalimentar" };
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        window.location.href = "/modulos/modulo5-corregir/";
    };
}
