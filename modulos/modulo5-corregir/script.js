document.addEventListener("DOMContentLoaded", async () => {
    // --- REFERENCIAS A BOTONES ---
    const enviarDriveBtn = document.getElementById("enviar-drive");
    const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
    const finalizarBtn = document.getElementById("finalizar");
    const resumenContainer = document.getElementById("reporte-resumen");

    // --- CONFIGURACIÓN (REEMPLAZAR ESTO) ---
    const APPS_SCRIPT_URL = "URL_DE_TU_APPS_SCRIPT_AQUI"; 
    const NUMERO_WHATSAPP = "5215549616817";

    // Función de control visual para deshabilitar/habilitar botones
    function setEstadoCarga(cargando, tipo) {
        enviarDriveBtn.disabled = cargando;
        if (cargando) {
            enviarDriveBtn.textContent = "Subiendo PDF a Drive...";
        } else {
            enviarDriveBtn.textContent = "📂 Subir Reporte a Drive";
        }
    }

    // Función que controla la visibilidad de los botones finales
    function controlarBotonesFinales(mostrar) {
        enviarWhatsAppBtn.style.display = mostrar ? 'block' : 'none';
        finalizarBtn.style.display = mostrar ? 'block' : 'none';
        enviarDriveBtn.style.display = mostrar ? 'none' : 'block';
    }
    
    // Las funciones buscarPortadorPorLlave y cargarResumenVisual se mantienen sin cambios (no incluidas aquí por brevedad, pero usa las versiones anteriores)

    // --- LÓGICA DE ENVÍO A DRIVE ---

    async function enviarADrive() {
        setEstadoCarga(true, 'drive');
        try {
            const reporte = JSON.parse(localStorage.getItem("reporte"));
            if (!reporte) throw new Error("No hay reporte para enviar.");
            
            const response = await fetch('/data/roles.json');
            if (!response.ok) throw new Error("No se pudo cargar roles.json");
            const rolesData = await response.json();

            // 1. Generar PDF (usa la lógica completa de tu antigua función enviarCorreo)
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            // ... (código jsPDF para generar tabla y contenido) ...
            let nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
            // (Necesitas incluir la lógica completa de generación de PDF aquí)
            
            // --- CÓDIGO CLAVE PARA GENERACIÓN DE PDF ---
            doc.setFontSize(20).setTextColor("#0056b3").text("Reporte de Incidencias", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
            // Lógica para obtener nombreDelReportante usando buscarPortadorPorLlave...
            const tableRows = []; // ... llenar tableRows con datos ...
            doc.autoTable({ startY: 30, head: [['Concepto', 'Información']], body: tableRows, theme: 'grid', headStyles: { fillColor: [0, 86, 179] } });
            
            // Obtener la cadena Base64
            const pdfBase64 = doc.output('datauristring').split(',')[1];
            // -----------------------------------------------------------

            // 2. Datos a enviar a Apps Script
            const datosParaDrive = {
                base64Data: pdfBase64,
                mimeType: 'application/pdf',
                fileName: `Reporte_${reporte.modulo1?.codigoQR || 'SIN_QR'}_${new Date().getTime()}.pdf`
            };

            // 3. Envío a Apps Script
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosParaDrive)
            });

            // Éxito: Mostrar los siguientes pasos
            alert("Reporte PDF subido a Drive exitosamente ✅. Ahora puedes notificar por WhatsApp.");
            controlarBotonesFinales(true);
            
        } catch (error) {
            console.error("Error al enviar a Drive:", error);
            alert("Error al generar o enviar el PDF a Drive. Revisa la consola.");
            controlarBotonesFinales(false);
        } finally {
            setEstadoCarga(false, 'drive');
        }
    }

    // --- FUNCIÓN DE WHATSAPP (Solo abre el chat con el mensaje) ---
    function enviarWhatsApp() {
        const reporte = JSON.parse(localStorage.getItem("reporte"));
        let mensajeTexto = `*Reporte de Seguridad Generado*\n\n*Código QR:* ${reporte.modulo1?.codigoQR || 'N/A'}\n*Riesgos Detectados:* ${reporte.modulo2?.riesgos?.join(', ') || 'Ninguno'}\n\nEl PDF completo se encuentra en la carpeta de Google Drive.`;
        const mensaje = encodeURIComponent(mensajeTexto);
        const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
        window.open(url, "_blank");
    }

    // --- FUNCIÓN FINALIZAR ---
    function finalizar() {
        if (confirm("¿Estás seguro de que deseas finalizar? Se borrará el reporte actual.")) {
            localStorage.removeItem("reporte");
            window.location.href = "../modulo1-qr/";
        }
    }

    // --- INICIALIZACIÓN Y EVENTOS ---
    // (Necesitas incluir aquí las funciones auxiliares de buscarPortadorPorLlave y cargarResumenVisual)
    cargarResumenVisual();
    controlarBotonesFinales(false);
    
    enviarDriveBtn.addEventListener("click", enviarADrive); 
    enviarWhatsAppBtn.addEventListener("click", enviarWhatsApp);
    finalizarBtn.addEventListener("click", finalizar);
});
