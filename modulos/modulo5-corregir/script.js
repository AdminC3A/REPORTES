document.addEventListener("DOMContentLoaded", async () => {
    // --- REFERENCIAS A BOTONES ---
    const enviarDriveBtn = document.getElementById("enviar-drive"); 
    const enviarWhatsAppBtn = document.getElementById("enviar-whatsapp");
    const finalizarBtn = document.getElementById("finalizar");
    const resumenContainer = document.getElementById("reporte-resumen");

    // --- CONFIGURACIÓN ---
    const APPS_SCRIPT_URL = "URL_DE_TU_APPS_SCRIPT_AQUI"; // 👈 PEGA TU URL
    const NUMERO_WHATSAPP = "5215549616817";

    // --- LÓGICA DE CONTROL VISUAL ---

    // Maneja el estado de carga y deshabilita SOLO el botón de Drive si está activo
    function setEstadoCarga(cargando) {
        enviarDriveBtn.disabled = cargando;
        if (cargando) {
            enviarDriveBtn.textContent = "Subiendo PDF a Drive...";
            // Se puede deshabilitar WhatsApp y Finalizar temporalmente para evitar doble clic
            enviarWhatsAppBtn.disabled = true;
            finalizarBtn.disabled = true;
        } else {
            enviarDriveBtn.textContent = "📂 Subir Reporte a Drive";
            enviarWhatsAppBtn.disabled = false;
            finalizarBtn.disabled = false;
        }
    }
    
    // Función que gestiona la transición de 3 botones a 2
    function controlarFlujo(paso) {
        if (paso === 'inicial') {
            // Inicial: Todos visibles (Por defecto en HTML)
            enviarDriveBtn.style.display = 'block';
        } else if (paso === 'exito-drive') {
            // Después del Éxito: OCULTAR SOLO DRIVE
            enviarDriveBtn.style.display = 'none';
            enviarWhatsAppBtn.disabled = false; // Asegurar que estén activos
            finalizarBtn.disabled = false;
        }
    }

    // --- LÓGICA DE ENVÍO A DRIVE ---

    async function enviarADrive() {
        setEstadoCarga(true); // Bloquea todos los botones temporalmente
        try {
            // [CÓDIGO DE LÓGICA DE GENERACIÓN DE PDF Y ENVÍO A APPS SCRIPT AQUÍ]
            // ... (Asegúrate de tener la lógica de jsPDF y fetch(APPS_SCRIPT_URL) del paso anterior)
            
            // Éxito: Transición a los 2 botones
            alert("Reporte PDF subido a Drive exitosamente ✅. Ahora puedes notificar por WhatsApp.");
            controlarFlujo('exito-drive'); 
            
        } catch (error) {
            console.error("Error al enviar a Drive:", error);
            alert("Error al generar o enviar el PDF a Drive. Intenta de nuevo.");
            controlarFlujo('inicial'); // Volver al estado inicial si falla
        } finally {
            setEstadoCarga(false); // Restablece el estado de carga
        }
    }

    // --- FUNCIÓN DE WHATSAPP Y FINALIZAR (Validado) ---
    function enviarWhatsApp() {
        const reporte = JSON.parse(localStorage.getItem("reporte"));
        // ... (Copia aquí tu lógica funcional de WhatsApp) ...
    }

    function finalizar() {
        // ... (Copia aquí tu lógica funcional de Finalizar) ...
    }

    // --- INICIALIZACIÓN Y EVENTOS ---
    // (Asegúrate de incluir las funciones auxiliares aquí: buscarPortadorPorLlave y cargarResumenVisual)
    cargarResumenVisual();
    controlarFlujo('inicial'); // Inicializa para asegurar visibilidad

    enviarDriveBtn.addEventListener("click", enviarADrive); 
    enviarWhatsAppBtn.addEventListener("click", enviarWhatsApp);
    finalizarBtn.addEventListener("click", finalizar);
});
