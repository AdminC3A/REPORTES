document.addEventListener("DOMContentLoaded", async () => {
    // --- REFERENCIAS A BOTONES CORREGIDAS PARA EL HTML ACTUALIZADO ---
    const enviarDriveBtn = document.getElementById("enviar-drive"); 
    const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
    const finalizarBtn = document.getElementById("finalizar");
    const resumenContainer = document.getElementById("reporte-resumen");

    // --- CONFIGURACIÓN (Manteniendo solo lo necesario) ---
    const APPS_SCRIPT_URL = "URL_DE_TU_APPS_SCRIPT_AQUI"; // 👈 REVISA ESTA URL
    const NUMERO_WHATSAPP = "5215549616817";

    // --- FUNCIONES AUXILIARES ---

    function setEstadoCarga(cargando, tipo) {
        // Controlamos el estado de carga solo para el botón de Drive y los botones finales
        enviarDriveBtn.disabled = cargando;
        enviarWhatsAppBtn.disabled = cargando;
        finalizarBtn.disabled = cargando;
        
        if (cargando) {
            enviarDriveBtn.textContent = "Subiendo PDF a Drive...";
        } else {
            enviarDriveBtn.textContent = "📂 Subir Reporte a Drive";
            enviarWhatsAppBtn.disabled = false;
            finalizarBtn.disabled = false;
        }
    }

    // Lógica para el control de la visibilidad de 3 a 2 botones
    function controlarFlujo(paso) {
        if (paso === 'inicial') {
            enviarDriveBtn.style.display = 'block';
            // WhatsApp y Finalizar permanecen visibles por defecto del HTML
        } else if (paso === 'exito-drive') {
            // OCULTAR SOLO DRIVE
            enviarDriveBtn.style.display = 'none';
        }
    }

    function buscarPortadorPorLlave(llave, rolesData) {
        // CÓDIGO VALIDADO (Sin cambios)
        const llaveLimpia = llave.trim().toLowerCase();
        for (const categoria in rolesData) {
            const supervisores = rolesData[categoria].supervisores;
            for (const nombre in supervisores) {
                const llavesDelSupervisor = supervisores[nombre];
                if (Array.isArray(llavesDelSupervisor) && llavesDelSupervisor.length > 0) {
                    if (llavesDelSupervisor[0].trim().toLowerCase() === llaveLimpia) return nombre;
                }
            }
        }
        return null;
    }

    function cargarResumenVisual() {
        // CÓDIGO VALIDADO (Sin cambios)
        const reporte = JSON.parse(localStorage.getItem("reporte"));
        if (!reporte) {
            resumenContainer.innerHTML = "<h3>No se encontró reporte.</h3>";
            return;
        }
        let html = `
            <h3>Resumen del Reporte</h3>
            <p><strong>QR:</strong> ${reporte.modulo1?.codigoQR || 'N/A'}</p>
            <p><strong>Riesgos:</strong> ${reporte.modulo2?.riesgos?.join(', ') || 'N/A'}</p>
            <p><strong>Clasificación:</strong> ${reporte.modulo2?.clasificacionSeleccionada || 'N/A'}</p>
            <p><strong>Rol:</strong> ${reporte.modulo3?.rolSeleccionado || 'N/A'}</p>
        `;
        resumenContainer.innerHTML = html;
    }

    // --- LÓGICA DE ENVÍO A DRIVE (Toma la lógica de envío de PDF del original) ---

    async function enviarADrive() {
        setEstadoCarga(true, 'drive');
        try {
            const reporte = JSON.parse(localStorage.getItem("reporte"));
            if (!reporte) throw new Error("No hay reporte para enviar.");
            
            // La validación de la carga de roles.json es crucial y se mantiene aquí
            const response = await fetch('/data/roles.json');
            if (!response.ok) throw new Error("No se pudo cargar roles.json. Revisa la ruta.");
            const rolesData = await response.json();

            // 1. Generar PDF (Lógica completa y validada de jsPDF)
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(20).setTextColor("#0056b3").text("Reporte de Incidencias", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
            
            let nombreDelReportante = reporte.modulo3?.rolSeleccionado || 'No especificado';
            if (reporte.modulo3?.llave) {
                const nombreEncontrado = buscarPortadorPorLlave(reporte.modulo3.llave, rolesData);
                if (nombreEncontrado) nombreDelReportante = nombreEncontrado;
            }

            const tableRows = [];
            tableRows.push(["Fecha", new Date().toLocaleDateString('es-MX')]);
            if (reporte.modulo1?.codigoQR) tableRows.push(["Código QR", reporte.modulo1.codigoQR]);
            if (reporte.modulo2?.riesgos) tableRows.push(["Riesgos", reporte.modulo2.riesgos.join(", ")]);
            tableRows.push(["Reportado Por", nombreDelReportante]);
            
            doc.autoTable({ startY: 30, head: [['Concepto', 'Información']], body: tableRows, theme: 'grid', headStyles: { fillColor: [0, 86, 179] } });
            
            const pdfBase64 = doc.output('datauristring').split(',')[1];
            // --------------------------------------------------------------------------

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

            // Éxito: Transición de 3 botones a 2
            alert("Reporte PDF subido a Drive exitosamente ✅. Ahora puedes notificar por WhatsApp.");
            controlarFlujo('exito-drive'); 
            
        } catch (error) {
            console.error("Error al enviar a Drive:", error);
            alert("Error: No se pudo completar el envío a Drive. Revisa la consola (F12).");
            controlarFlujo('inicial'); // Volver a mostrar Drive si falla
        } finally {
            setEstadoCarga(false, 'drive');
        }
    }

    // --- FUNCIÓN DE WHATSAPP (CÓDIGO VALIDADO ORIGINAL) ---
    function enviarWhatsApp() {
        const reporte = JSON.parse(localStorage.getItem("reporte"));
        let mensajeTexto = "Se ha generado un nuevo reporte de seguridad.";
        if (reporte) {
            const qr = reporte.modulo1?.codigoQR || "N/A";
            const riesgos = reporte.modulo2?.riesgos?.join(', ') || "Ninguno";
            // Ajustamos el mensaje para reflejar la subida a Drive, manteniendo la estructura
            mensajeTexto = `*Reporte de Seguridad Generado*\n\n*Código QR:* ${qr}\n*Riesgos Detectados:* ${riesgos}\n\nEl PDF completo se encuentra en la carpeta de Google Drive.`;
        }
        const mensaje = encodeURIComponent(mensajeTexto);
        const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
        window.open(url, "_blank");
    }

    // --- FUNCIÓN FINALIZAR (CÓDIGO VALIDADO ORIGINAL) ---
    function finalizar() {
        if (confirm("¿Estás seguro de que deseas finalizar? Se borrará el reporte actual.")) {
            localStorage.removeItem("reporte");
            window.location.href = "../modulo1-qr/";
        }
    }

    // --- INICIALIZACIÓN Y EVENTOS ---
    cargarResumenVisual();
    controlarFlujo('inicial'); 
    
    // Conexión de los 3 botones
    enviarDriveBtn.addEventListener("click", enviarADrive); 
    enviarWhatsAppBtn.addEventListener("click", enviarWhatsApp);
    finalizarBtn.addEventListener("click", finalizar);
});
