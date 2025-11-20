// CONFIGURA AQUÍ TU URL DE APPS SCRIPT Y LA CARPETA DE DRIVE
const APPS_SCRIPT_URL = "PON_AQUI_TU_URL_DEL_WEBAPP";
const WHATSAPP_NUMERO = "5210000000000"; // ← Cambia el número

let archivoSeleccionado = null;

// BOTONES
const btnDrive = document.getElementById("btn-drive");
const btnWhatsapp = document.getElementById("btn-whatsapp");
const btnSalir = document.getElementById("btn-salir");
const inputArchivo = document.getElementById("archivo");


// ------------------------------------------------------
// 1. SUBIR A DRIVE
// ------------------------------------------------------
btnDrive.addEventListener("click", () => {
    inputArchivo.click();
});

// al seleccionar archivo
inputArchivo.addEventListener("change", async (e) => {
    archivoSeleccionado = e.target.files[0];

    if (!archivoSeleccionado) {
        alert("No seleccionaste archivo.");
        return;
    }

    alert("Archivo seleccionado: " + archivoSeleccionado.name);

    const reader = new FileReader();
    reader.onload = async function () {
        try {
            const base64 = reader.result.split(",")[1];

            const payload = {
                fileName: archivoSeleccionado.name,
                mimeType: archivoSeleccionado.type,
                base64Data: base64
            };

            await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            alert("Archivo subido a Drive.");

            // Ocultar botón de Drive
            btnDrive.style.display = "none";

        } catch (err) {
            console.error(err);
            alert("Error al subir el archivo.");
        }
    };

    reader.readAsDataURL(archivoSeleccionado);
});


// ------------------------------------------------------
// 2. ENVIAR A WHATSAPP
// ------------------------------------------------------
btnWhatsapp.addEventListener("click", () => {
    const mensaje = encodeURIComponent("Reporte disponible.");
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensaje}`;
    window.open(url, "_blank");
});


// ------------------------------------------------------
// 3. SALIR / ESCANEAR OTRO CÓDIGO
// ------------------------------------------------------
btnSalir.addEventListener("click", () => {
    // Puede ser reload o redirigir a tu lector QR
    location.reload();
});
