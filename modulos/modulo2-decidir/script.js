const cargarFotoArchivoBtn = document.getElementById("cargarFotoArchivoBtn");
const cargarFotoCamaraBtn = document.getElementById("cargarFotoCamaraBtn");
const fotoContainer = document.getElementById("fotoContainer");
const riesgoOpciones = document.getElementById("riesgoOpciones");
const nextButton = document.getElementById("next");
const otrosDetalleInput = document.getElementById("otros-detalle");
let imagenSeleccionada = null;

// Función para guardar en Local Storage
function guardarEnLocalStorage(modulo, datos) {
    let reporte = JSON.parse(localStorage.getItem("reporte")) || {};
    reporte[modulo] = { ...reporte[modulo], ...datos }; // Combina datos nuevos con existentes
    localStorage.setItem("reporte", JSON.stringify(reporte));
    console.log(`Datos del ${modulo} guardados:`, datos);
}

// Mostrar las opciones después de cargar la foto
function mostrarOpciones() {
    fotoContainer.style.display = "block"; // Mostrar previsualización
    riesgoOpciones.style.display = "block"; // Mostrar opciones de selección
    nextButton.style.display = "block"; // Mostrar botón "Continuar"
    riesgoOpciones.scrollIntoView({ behavior: "smooth" }); // Desplazar automáticamente
}

/**
 * Cargar foto desde archivo
 */
cargarFotoArchivoBtn.addEventListener("click", () => {
    const imagenInput = document.createElement("input");
    imagenInput.type = "file";
    imagenInput.accept = "image/*";
    imagenInput.click();

    imagenInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    imagenSeleccionada = img;
                    guardarEnLocalStorage("modulo2", { imagen: e.target.result });
                    const ctxFoto = fotoContainer.getContext("2d");
                    ctxFoto.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctxFoto.drawImage(img, 0, 0, fotoContainer.width, fotoContainer.height);
                    mostrarOpciones();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

/**
 * Validar y continuar al siguiente módulo
 */
nextButton.addEventListener("click", function () {
    const seleccionados = [];
    document.querySelectorAll('input[name="riesgo"]:checked').forEach((input) => {
        seleccionados.push(input.value);
    });

    if (!imagenSeleccionada) {
        alert("Por favor carga una imagen antes de continuar.");
        return;
    }

    if (seleccionados.length === 0) {
        alert("Por favor selecciona al menos un riesgo antes de continuar.");
        return;
    }

    if (seleccionados.includes("Otros") && !otrosDetalleInput.value.trim()) {
        alert("Por favor proporciona detalles para la opción 'Otros'.");
        return;
    }

    guardarEnLocalStorage("modulo2", {
        imagen: imagenSeleccionada.src,
        riesgos: seleccionados,
        detalleOtros: otrosDetalleInput.value.trim(),
    });

    window.location.href = "/modulos/modulo3-detener/index.html";
});
