// script.js para el Módulo 4

// Recuperar datos de los módulos anteriores desde localStorage
const datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {};

// Cargar el archivo CSV desde la ruta absoluta
Papa.parse('/data/combinaciones_botones.csv', {
    download: true,
    header: true, // Usar las cabeceras como claves
    complete: function (results) {
        const combinaciones = results.data; // Datos cargados del CSV
        console.log("Combinaciones cargadas:", combinaciones);

        // Mostrar la combinación basada en los datos acumulados
        procesarCombinaciones(combinaciones, datosAcumulados);
    },
    error: function (error) {
        console.error("Error al cargar el CSV:", error);
    }
});

// Función para procesar las combinaciones basadas en los datos anteriores
function procesarCombinaciones(combinaciones, datos) {
    console.log("Datos acumulados:", datos);

    // Buscar la combinación relevante basada en los datos
    const combinacion = combinaciones.find(c => 
        c.Accion === datos.accionSeleccionada &&
        c.Clasificacion === datos.clasificacionSeleccionada
    );

    if (combinacion) {
        console.log(`Acción: ${combinacion.Accion}`);
        console.log(`Clasificación: ${combinacion.Clasificacion}`);
        console.log(`Botón Corregir: ${combinacion.BotonCorregir}`);
        console.log(`Botón Retroalimentar: ${combinacion.BotonRetroalimentar}`);

        // Actualizar el contenido dinámico
        actualizarContenido(combinacion);
    } else {
        console.error("No se encontró la combinación especificada.");
        const contenedor = document.getElementById("contenedor-dinamico");
        contenedor.innerHTML = `<p>No se encontraron combinaciones para los datos proporcionados.</p>`;
    }
}

// Función para actualizar el contenido dinámico
function actualizarContenido(combinacion) {
    const contenedor = document.getElementById("contenedor-dinamico");
    contenedor.innerHTML = `
        <h2>Acción: ${combinacion.Accion}</h2>
        <p>Clasificación: ${combinacion.Clasificacion}</p>
        <button id="btn-corregir">Corregir</button>
        <button id="btn-retroalimentar">Retroalimentar</button>
    `;

    // Configurar botones
    document.getElementById("btn-corregir").onclick = () => {
        alert(`Contramedida: ${combinacion.BotonCorregir}`);
        // Guardar la elección y pasar al siguiente módulo
        datosAcumulados.modulo4 = { accion: combinacion.Accion, tipo: "Corregir" };
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        window.location.href = "/modulos/modulo5-corregir/";
    };

    document.getElementById("btn-retroalimentar").onclick = () => {
        alert(`Retroalimentación: ${combinacion.BotonRetroalimentar}`);
        // Guardar la elección y pasar al siguiente módulo
        datosAcumulados.modulo4 = { accion: combinacion.Accion, tipo: "Retroalimentar" };
        localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
        window.location.href = "/modulos/modulo5-corregir/";
    };
}
