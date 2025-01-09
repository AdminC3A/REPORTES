// script.js

// Cargar el archivo CSV
Papa.parse('./data/combinaciones_botones.csv', {
    download: true,
    header: true, // Interpretar las cabeceras como claves del objeto
    complete: function (results) {
        const combinaciones = results.data; // Datos extraídos del CSV
        console.log("Combinaciones cargadas:", combinaciones);

        // Mostrar la combinación inicial (por ejemplo, la número 1)
        mostrarCombinacion(combinaciones, 1); // Cambia el número según lo que desees cargar
    },
    error: function (error) {
        console.error("Error al cargar el CSV:", error);
    }
});

// Función para mostrar una combinación específica
function mostrarCombinacion(combinaciones, numero) {
    const combinacion = combinaciones.find(c => c.Numero == numero);
    if (combinacion) {
        console.log(`Acción: ${combinacion.Accion}`);
        console.log(`Clasificación: ${combinacion.Clasificacion}`);
        console.log(`Botón Corregir: ${combinacion.BotonCorregir}`);
        console.log(`Botón Retroalimentar: ${combinacion.BotonRetroalimentar}`);

        // Actualizar el contenido dinámicamente
        actualizarContenido(combinacion);
    } else {
        console.error("No se encontró la combinación especificada.");
    }
}

// Función para actualizar el contenido dinámicamente
function actualizarContenido(combinacion) {
    const contenedor = document.getElementById("contenedor-dinamico");
    contenedor.innerHTML = `
        <h2>Acción: ${combinacion.Accion}</h2>
        <p>Clasificación: ${combinacion.Clasificacion}</p>
        <button class="boton" id="btn-corregir">Corregir</button>
        <button class="boton" id="btn-retroalimentar">Retroalimentar</button>
    `;

    // Configurar botones
    document.getElementById("btn-corregir").onclick = () => alert(`Contramedida: ${combinacion.BotonCorregir}`);
    document.getElementById("btn-retroalimentar").onclick = () => alert(`Retroalimentación: ${combinacion.BotonRetroalimentar}`);
}
