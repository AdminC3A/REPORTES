// Inicializa EmailJS
document.addEventListener("DOMContentLoaded", () => {
    emailjs.init("TU_PUBLIC_KEY"); // ← Reemplaza con tu PUBLIC KEY real
});

// Función para obtener el reporte actual como PDF
async function generarPDFBlob() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const reporte = JSON.parse(localStorage.getItem("reporte"));

    let y = 10;
    doc.setFontSize(14);
    doc.text("📋 Reporte de Seguridad - Bitácora", 10, y);
    y += 10;

    doc.setFontSize(10);

    for (const [modulo, datos] of Object.entries(reporte)) {
        doc.setFont(undefined, "bold");
        doc.text(`${modulo.toUpperCase()}`, 10, y);
        y += 7;

        doc.setFont(undefined, "normal");

        for (const [clave, valor] of Object.entries(datos)) {
            if (!valor) continue;

            if (clave === "imagen" && valor.startsWith("data:image")) {
                try {
                    const img = new Image();
                    img.src = valor;
                    await new Promise((resolve) => {
                        img.onload = () => resolve();
                    });

                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    const imgData = canvas.toDataURL("image/jpeg", 0.5);
                    doc.addImage(imgData, "JPEG", 10, y, 50, 30);
                    y += 35;
                    continue;
                } catch (err) {
                    console.warn("Error al insertar imagen:", err);
                    continue;
                }
            }

            const texto = `${clave}: ${Array.isArray(valor) ? valor.join(", ") : valor}`;
            doc.text(texto, 10, y);
            y += 6;

            if (y > 270) {
                doc.addPage();
                y = 10;
            }
        }

        y += 4;
    }

    return doc.output("blob"); // Devuelve el PDF como Blob
}

// Enviar por WhatsApp
document.getElementById("btn-whatsapp").addEventListener("click", () => {
    const numero = "521XXXXXXXXXX"; // ← Reemplaza con número real
    const mensaje = encodeURIComponent("🛡️ Se ha generado un nuevo reporte de seguridad. Revisa el PDF en tu correo.");
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
});

// Enviar por Correo
document.getElementById("btn-correo").addEventListener("click", async () => {
    try {
        const pdfBlob = await generarPDFBlob();

        const formData = new FormData();
        formData.append("file", pdfBlob, "ReporteSeguridad.pdf");

        const reader = new FileReader();
        reader.onload = async function () {
            const base64PDF = reader.result.split(",")[1];

            const templateParams = {
                to_email: "tucorreo@dominio.com", // ← Cambia por el destinatario real
                message: "Se ha generado un nuevo reporte de seguridad. PDF adjunto.",
                attachment: base64PDF
            };

            const result = await emailjs.send("TU_SERVICE_ID", "TU_TEMPLATE_ID", templateParams);
            alert("Correo enviado correctamente.");
        };

        reader.readAsDataURL(pdfBlob);
    } catch (error) {
        console.error("Error al enviar correo:", error);
        alert("Hubo un error al enviar el correo.");
    }
});

// Enviar por Ambos
document.getElementById("btn-ambos").addEventListener("click", async () => {
    document.getElementById("btn-whatsapp").click();
    setTimeout(() => {
        document.getElementById("btn-correo").click();
    }, 1000);
});

// Finalizar y volver al escáner
document.getElementById("btn-finalizar").addEventListener("click", () => {
    localStorage.removeItem("reporte");
    window.location.href = "/modulos/modulo1-qr/"; // Ajusta según tu ruta real
});
