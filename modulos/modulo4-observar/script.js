// script.js para el Módulo 4: Mostrar acciones A (Corregir) y B (Retroalimentar)

// Recuperar datos de los módulos anteriores desde localStorage
let datosAcumulados = JSON.parse(localStorage.getItem("datosAcumulados")) || {};

// Asignar valores predeterminados si faltan datos
if (!datosAcumulados.accionSeleccionada) {
    console.warn("Acción seleccionada faltante. Usando valor predeterminado.");
    datosAcumulados.accionSeleccionada = "Acción No Especificada";
}
if (!datosAcumulados.clasificacionSeleccionada) {
    console.warn("Clasificación seleccionada faltante. Usando valor predeterminado.");
    datosAcumulados.clasificacionSeleccionada = "Clasificación No Especificada";
}

// Guardar datos corregidos en localStorage
localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));

// Cargar el archivo CSV con las combinaciones
Papa.parse('/data/combinaciones_botones.csv', {
    download: true,
    header: true,
    complete: function (results) {
        const combinaciones = results.data;
        console.log("Combinaciones cargadas:", combinaciones);

        // Mostrar acción basada en combinaciones
        mostrarAccion(combinaciones, datosAcumulados);
    },
    error: function (error) {
        console.error("Error al cargar el CSV:", error);
    }
});

// Función para mostrar la acción
function mostrarAccion(combinaciones, datos) {
    const combinacion = combinaciones.find(c => 
        c.Accion === datos.accionSeleccionada &&
        c.Clasificacion === datos.clasificacionSeleccionada
    );

    const contenedor = document.getElementById("contenedor-dinamico");

    if (combinacion) {
        contenedor.innerHTML = `
            <h2>Acción Seleccionada: ${combinacion.Accion}</h2>
            <p>Clasificación: ${combinacion.Clasificacion}</p>
            <button id="btn-corregir">A. Corregir</button>
            <button id="btn-retroalimentar">B. Retroalimentar</button>
        `;

        document.getElementById("btn-corregir").onclick = () => {
            alert(`Acción Correctiva: ${combinacion.BotonCorregir}`);
            datosAcumulados.modulo4 = { accion: combinacion.Accion, tipo: "Corregir" };
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
            window.location.href = "/modulos/modulo5-corregir/";
        };

        document.getElementById("btn-retroalimentar").onclick = () => {
            alert(`Retroalimentación: ${combinacion.BotonRetroalimentar}`);
            datosAcumulados.modulo4 = { accion: combinacion.Accion, tipo: "Retroalimentar" };
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
            window.location.href = "/modulos/modulo5-corregir/";
        };
    } else {
        contenedor.innerHTML = `
            <p>No se encontraron acciones específicas para los datos proporcionados.</p>
            <button id="continuar-generico">Continuar</button>
        `;
        document.getElementById("continuar-generico").onclick = () => {
            datosAcumulados.modulo4 = { accion: "Genérica", tipo: "Continuar" };
            localStorage.setItem("datosAcumulados", JSON.stringify(datosAcumulados));
            window.location.href = "/modulos/modulo5-corregir/";
        };
    }
}
