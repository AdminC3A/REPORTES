// Referencias al DOM
const cargarFotoArchivoBtn = document.getElementById("cargarFotoArchivoBtn");
const cargarFotoCamaraBtn = document.getElementById("cargarFotoCamaraBtn");
const fotoContainer = document.getElementById("fotoContainer");
const riesgoOpciones = document.getElementById("riesgoOpciones");
const clasificacionFieldset = document.getElementById("clasificacionFieldset");
const nextButton = document.getElementById("next");
const detalleRiesgoInput = document.getElementById("detalle-riesgo");
const detalleClasificacionInput = document.getElementById("detalle-otra-clasificacion");

// Tooltips
const tooltipComments = document.createElement("div");
tooltipComments.className = "tooltip-comment";
document.body.appendChild(tooltipComments);

// Mostrar y ocultar comentarios flotantes
document.querySelectorAll(".tooltip").forEach((tooltip) => {
    tooltip.addEventListener("click", () => {
        tooltipComments.textContent = tooltip.getAttribute("data-tooltip");
        tooltipComments.classList.add("visible");
        setTimeout(() => tooltipComments.classList.remove("visible"), 3000);
    });
});

// Función para mostrar secciones
function mostrarSeccion(seccion) {
    seccion.classList.remove("hidden");
    seccion.scrollIntoView({ behavior: "smooth" });
}

// Cargar Foto desde Archivo
cargarFotoArchivoBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const ctx = fotoContainer.getContext("2d");
                    ctx.clearRect(0, 0, fotoContainer.width, fotoContainer.height);
                    ctx.drawImage(img, 0, 0, fotoContainer.width, fotoContainer.height);
                    fotoContainer.style.display = "block";
                    mostrarSeccion(riesgoOpciones);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Manejo de la sección de Riesgos
document.querySelectorAll('input[name="riesgo"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const seleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
            (input) => input.value
        );
        if (seleccionados.length > 0) {
            mostrarSeccion(clasificacionFieldset);
        }
    });
});

// Manejo de la sección de Clasificación
document.querySelectorAll('input[name="clasificacion"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        nextButton.classList.remove("hidden");
        nextButton.scrollIntoView({ behavior: "smooth" });
    });
});
// Validar y continuar al siguiente módulo
nextButton.addEventListener("click", () => {
    const riesgosSeleccionados = Array.from(document.querySelectorAll('input[name="riesgo"]:checked')).map(
        (input) => input.value
    );
    const clasificacionSeleccionada = document.querySelector('input[name="clasificacion"]:checked')?.value;

    // Validaciones antes de continuar
    if (!imagenSeleccionada) {
        alert("Por favor carga una imagen antes de continuar.");
        return;
    }

    if (riesgosSeleccionados.length === 0) {
        alert("Por favor selecciona al menos un riesgo antes de continuar.");
        return;
    }

    if (riesgosSeleccionados.includes("Otros") && !detalleRiesgoInput.value.trim()) {
        alert("Por favor proporciona detalles adicionales para 'Otros'.");
        return;
    }

    if (clasificacionSeleccionada === "Otra Clasificación" && !detalleClasificacionInput.value.trim()) {
        alert("Por favor proporciona detalles para 'Otra Clasificación'.");
        return;
    }

    // Guardar datos en Local Storage y redirigir
    guardarEnLocalStorage("modulo2", {
        imagen: imagenSeleccionada.src,
        riesgosSeleccionados,
        detalleRiesgo: detalleRiesgoInput.value.trim(),
        clasificacionSeleccionada,
        detalleClasificacion: clasificacionSeleccionada === "Otra Clasificación" ? detalleClasificacionInput.value.trim() : null,
    });

    window.location.href = "/modulos/modulo3-detener/index.html";
});

