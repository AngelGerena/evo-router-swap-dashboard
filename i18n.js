// ============================================================================
// i18n.js — English / Spanish toggle for the EVO Swap Request app
// Self-contained: maps English UI strings to Spanish and swaps them on toggle.
// Field-appropriate Spanish (Puerto Rican / Central Florida tech usage).
// Remembers the choice on the device.
// ============================================================================
(function () {
  const LANG_KEY = "evo_lang";

  // Full English → Spanish dictionary. Keys are the exact English text as it
  // appears on the page (trimmed). Values are the Spanish equivalents.
  const ES = {
    // header
    "Summit Broadband · Field": "Summit Broadband · Campo",
    "EVO Swap Request": "Solicitud de Cambio EVO",
    "Every swap needs approval from Anthony or Peterson. No exceptions.":
      "Todo cambio necesita aprobación de Anthony o Peterson. Sin excepciones.",
    "How it works — 60-second tutorial": "Cómo funciona — tutorial de 60 segundos",

    // step rail
    "Basics": "Fundamentos",
    "Checklist": "Lista de verificación",
    "Submit": "Enviar",

    // sidebar resources
    "Field resources — tap to read": "Recursos de campo — toca para leer",
    "Dual SSID Split (WPA2 + WPA3)": "División de SSID doble (WPA2 + WPA3)",
    "For legacy devices that won't stay on WPA3":
      "Para equipos antiguos que no se mantienen en WPA3",
    "Install Process & Procedure": "Proceso y procedimiento de instalación",
    "ONT first, router central, RSSI validation":
      "ONT primero, router al centro, validación de RSSI",
    "Save EVO Log in Frontline": "Guardar registro EVO en Frontline",
    "Required for every swap — Evolution lab log":
      "Requerido en cada cambio — registro de laboratorio de Evolution",
    "NRBY & OSP Sequence": "Secuencia NRBY y OSP",
    "Submit NRBY first, then document": "Envía NRBY primero, luego documenta",

    // step 0 — basics
    "Before requesting a swap, run the basics. Most \"swaps\" are fixed by relocating the router or splitting the network for old devices. Open any guide, then continue.":
      "Antes de solicitar un cambio, revisa los fundamentos. La mayoría de los \"cambios\" se resuelven reubicando el router o dividiendo la red para equipos antiguos. Abre cualquier guía y luego continúa.",
    "Optimize first, swap last": "Optimiza primero, cambia de último",
    "Why an EVO swap is a last resort — read this":
      "Por qué un cambio de EVO es el último recurso — lee esto",
    "Our standard: optimize first, swap last":
      "Nuestro estándar: optimiza primero, cambia de último",
    "Every truck roll is a chance to take care of the customer the right way. Before we ever consider removing an EVO router, our responsibility is to exhaust every reasonable step to make the existing equipment perform the way it was designed to. A router swap is not a fix — it is a last resort, and only appropriate after we've confirmed the unit has been set up to maximize performance in the home.":
      "Cada visita es una oportunidad de atender al cliente de la manera correcta. Antes de considerar remover un router EVO, nuestra responsabilidad es agotar cada paso razonable para que el equipo existente funcione como fue diseñado. Un cambio de router no es una solución — es el último recurso, y solo es apropiado después de confirmar que la unidad fue configurada para maximizar el rendimiento en el hogar.",
    "Cover the fundamentals — every time": "Cubre los fundamentos — siempre",
    "Most \"bad router\" calls are really placement, configuration, or power problems. Before requesting a swap, confirm the basics are genuinely complete:":
      "La mayoría de las llamadas de \"router malo\" son en realidad problemas de ubicación, configuración o corriente. Antes de solicitar un cambio, confirma que los fundamentos estén realmente completos:",
    "Central placement & clean wiring": "Ubicación central y cableado limpio",
    "Split the networks": "Divide las redes",
    "Verify the power supply": "Verifica la fuente de poder",
    "Rule out parallel networks": "Descarta redes paralelas",
    "Validate the signal before you judge the hardware":
      "Valida la señal antes de juzgar el equipo",
    "If a swap is truly warranted": "Si el cambio realmente se justifica",
    "The bottom line": "En resumen",
    "Swapping an EVO is the easy answer, not the right one. We owe our customers the diligence of doing everything possible to make their service perform before reaching for new hardware. Holding the line on the basics is what separates a real fix from a temporary one.":
      "Cambiar un EVO es la respuesta fácil, no la correcta. Les debemos a nuestros clientes la diligencia de hacer todo lo posible para que su servicio funcione antes de recurrir a equipo nuevo. Mantener firmes los fundamentos es lo que separa una solución real de una temporal.",
    "I've reviewed the basics →": "He revisado los fundamentos →",
    "Next ›": "Siguiente ›",

    // step 1 — checklist
    "Confirm each step. The request button stays locked until the basics are done and the ONT reading is in.":
      "Confirma cada paso. El botón de solicitud permanece bloqueado hasta que los fundamentos estén completos y la lectura del ONT esté ingresada.",
    "Router relocated centrally": "Router reubicado al centro",
    "Moved to a central spot, wired where possible":
      "Movido a un lugar central, cableado donde sea posible",
    "Dual SSID split attempted": "Intentada la división de SSID doble",
    "WPA2 \"-2\" network for legacy devices, printers, OTT":
      "Red WPA2 \"-2\" para equipos antiguos, impresoras, OTT",
    "No parallel networks": "Sin redes paralelas",
    "Confirmed there's no second/old network in the home":
      "Confirmado que no hay una segunda red o red vieja en el hogar",
    "Guide": "Guía",
    "ONT light readings": "Lecturas de luz del ONT",
    "required": "requerido",
    "Select the ONT type, then enter the readings. Just type the number — we add the minus for you.":
      "Selecciona el tipo de ONT, luego ingresa las lecturas. Solo escribe el número — nosotros añadimos el signo negativo por ti.",
    "NID / FCPA closet (dB)": "NID / clóset FCPA (dB)",
    "1490 · RF (dB)": "1490 · RF (dB)",
    "1550 · Data (dB)": "1550 · Datos (dB)",
    "1577 · Data (dB)": "1577 · Datos (dB)",
    "Frontline Health Score": "Puntaje de salud de Frontline",
    "Continue to request →": "Continuar a la solicitud →",
    "Complete all three checks and enter the ONT reading to continue.":
      "Completa las tres verificaciones e ingresa la lectura del ONT para continuar.",

    // step 2 — request form
    "Last step. This gates the job until a manager decides — they get pinged instantly.":
      "Último paso. Esto detiene el trabajo hasta que un gerente decida — se les notifica al instante.",
    "Customer first name": "Nombre del cliente",
    "Customer last name": "Apellido del cliente",
    "Account # / Job # (Offer #)": "# de cuenta / # de trabajo (# de oferta)",
    "Property / MDU name (if applicable)": "Nombre de la propiedad / MDU (si aplica)",
    "Property / MDU name": "Nombre de la propiedad / MDU",
    "The unit you're swapping": "La unidad que estás cambiando",
    "EVO S/N or MAC being removed": "S/N o MAC del EVO que se remueve",
    "EVO S/N or MAC you want to add": "S/N o MAC del EVO que quieres agregar",
    "Account it's being removed from": "Cuenta de la que se remueve",
    "Every removed EVO must carry its account # and return to":
      "Todo EVO removido debe llevar su # de cuenta y regresar a",
    "Flag this EVO as an RMA to Evolution Digital":
      "Marcar este EVO como RMA a Evolution Digital",
    "Flagging marks this unit as defective. Instead of the normal return to 4558 Orlando, you'll box it, write the account # on it, apply the Warehouse RMA label, and ship it to Evolution Digital. Check the flag to see the full handling steps.":
      "Marcarlo identifica esta unidad como defectuosa. En lugar de la devolución normal al 4558 Orlando, la empacarás, escribirás el # de cuenta, aplicarás la etiqueta RMA del almacén y la enviarás a Evolution Digital. Marca la casilla para ver los pasos completos de manejo.",
    "Use only when nothing fixed it — a genuine defect that needs Evolution & Clay's attention.":
      "Usar solo cuando nada lo arregló — un defecto genuino que necesita la atención de Evolution y Clay.",
    "A router goes back to Evolution Digital only for a genuine hardware defect, such as:":
      "Un router regresa a Evolution Digital solo por un defecto de hardware genuino, como:",
    "Will no longer power up at all.": "Ya no enciende en absoluto.",
    "Powers on but will not connect to the internet.": "Enciende pero no se conecta al internet.",
    "Broadcasts only 2.4 GHz and not 5 GHz.": "Solo transmite 2.4 GHz y no 5 GHz.",
    "Broadcasts only 5 GHz and not 2.4 GHz.": "Solo transmite 5 GHz y no 2.4 GHz.",
    "This unit will be tracked as a defective RMA. Confirm you understand the handling:":
      "Esta unidad se rastreará como RMA defectuoso. Confirma que entiendes el manejo:",
    "Box the EVO that is going back.": "Empaca el EVO que va de regreso.",
    "Write the customer's": "Escribe el",
    "account #": "# de cuenta del cliente",
    "on the box.": "en la caja.",
    "Place the Warehouse-provided": "Coloca la",
    "RMA return label": "etiqueta de devolución RMA provista por el almacén",
    "on the box.": "en la caja.",
    "Ship it back to": "Envíalo de regreso a",
    "Evolution Digital ASAP": "Evolution Digital lo antes posible",
    "I understand and will follow the RMA handling steps above.":
      "Entiendo y seguiré los pasos de manejo de RMA de arriba.",
    "Your market": "Tu mercado",
    "Market": "Mercado",
    "Your name": "Tu nombre",
    "Not you?": "¿No eres tú?",
    "Reason for swap (optional)": "Razón del cambio (opcional)",
    "Reason for swap": "Razón del cambio",
    "Request approval": "Solicitar aprobación",
    "You'll see a confirmation. The tech screen unlocks when a manager approves.":
      "Verás una confirmación. La pantalla del técnico se desbloquea cuando un gerente aprueba.",

    // NRBY interstitial
    "Before you open NRBY · Read this": "Antes de abrir NRBY · Lee esto",
    "Sequence matters — submit first, then document":
      "La secuencia importa — envía primero, luego documenta",
    "Submit the NRBY request first": "Envía la solicitud NRBY primero",
    "Then document it in your job notes":
      "Luego documéntalo en tus notas de trabajo",
    "Once submitted, note in your job notes that the NRBY has been submitted. Noting an NRBY that wasn't actually submitted creates delays, confusion, and \"OSP didn't show\" callbacks.":
      "Una vez enviado, anota en tus notas de trabajo que el NRBY fue enviado. Anotar un NRBY que en realidad no se envió crea retrasos, confusión y llamadas de \"OSP no llegó\".",
    "Set the right expectation with the customer":
      "Establece la expectativa correcta con el cliente",
    "I have read and understood the NRBY & OSP sequence above.":
      "He leído y entendido la secuencia NRBY y OSP de arriba.",
    "Continue to NRBY ↗": "Continuar a NRBY ↗",
    "This opens app.nrby.ai in a new tab.":
      "Esto abre app.nrby.ai en una pestaña nueva.",

    // result cards
    "Approved — you're cleared": "Aprobado — estás autorizado",
    "Attestation required": "Declaración requerida",
    "By checking these boxes, you are formally affirming that you have already completed each of the following required steps on this job:":
      "Al marcar estas casillas, estás afirmando formalmente que ya completaste cada uno de los siguientes pasos requeridos en este trabajo:",
    "Relocated the router to a central location and hard-wired it where possible.":
      "Reubicaste el router a una ubicación central y lo cableaste donde fue posible.",
    "Attempted the dual-SSID split (separate WPA2 and WPA3 networks) for legacy devices.":
      "Intentaste la división de SSID doble (redes WPA2 y WPA3 separadas) para equipos antiguos.",
    "Confirmed there are no parallel, secondary, or old networks active in the home.":
      "Confirmaste que no hay redes paralelas, secundarias o viejas activas en el hogar.",
    "This is an official record. If it is later determined that these steps were not actually performed, you may be held accountable. Only proceed if every step above is genuinely complete.":
      "Este es un registro oficial. Si más adelante se determina que estos pasos no se realizaron, podrías ser responsabilizado. Continúa solo si cada paso de arriba está genuinamente completo.",
    "Cancel": "Cancelar",
    "I affirm — all steps were completed": "Afirmo — todos los pasos fueron completados",

    // switch / NEXGEN panel
    "SWITCH/NEXGEN": "SWITCH/NEXGEN",
    "At a switch/NEXGEN property, prove the feed before swapping. The router is only the suspect if a laptop plugged straight into the wall jack still gets internet.":
      "En una propiedad de switch/NEXGEN, comprueba el feed antes de cambiar. El router solo es sospechoso si una laptop conectada directamente al conector de pared todavía recibe internet.",
    "Router has power and the feed cable is in the WAN/Internet port.":
      "El router tiene corriente y el cable del feed está en el puerto WAN/Internet.",
    "Tested a known-good patch cable from the wall jack.":
      "Probé un cable patch que sé que funciona desde el conector de pared.",
    "Checked the wall jack and confirmed the correct active jack.":
      "Revisé el conector de pared y confirmé el conector activo correcto.",
    "Direct laptop test at the wall jack": "Prueba directa con laptop en el conector de pared",
    "Select the result…": "Selecciona el resultado…",
    "Laptop GETS internet — router is the likely issue": "La laptop SÍ recibe internet — el router es el problema probable",
    "Laptop gets NO internet": "La laptop NO recibe internet",
    "No link light at the jack": "Sin luz de enlace en el conector",
    "169.254 / no valid IP": "169.254 / sin IP válida",
    "Valid IP but no internet": "IP válida pero sin internet",
    "Feed tested good — the router is the likely issue. A swap is justified. Continue below.":
      "Feed comprobado bueno — el router es el problema probable. El cambio se justifica. Continúa abajo.",
    "Do not swap the router.": "No cambies el router.",
    "The feed has not been proven good. Escalate to the NOC — a switch or feed issue is likely, and swapping the router will not fix it.":
      "El feed no se ha comprobado como bueno. Escala al NOC — es probable un problema del switch o del feed, y cambiar el router no lo resolverá.",
    "Call NOC: 407.998.4611 · Option 3": "Llama al NOC: 407.998.4611 · Opción 3",

    // result cards
    "Approved — you're cleared": "Aprobado — estás autorizado",
    "Attestation required": "Declaración requerida",
    "By checking these boxes, you are formally affirming that you have already completed each of the following required steps on this job:":
      "Al marcar estas casillas, estás afirmando formalmente que ya completaste cada uno de los siguientes pasos requeridos en este trabajo:",
    "Relocated the router to a central location and hard-wired it where possible.":
      "Reubicaste el router a una ubicación central y lo cableaste donde fue posible.",
    "Attempted the dual-SSID split (separate WPA2 and WPA3 networks) for legacy devices.":
      "Intentaste la división de SSID doble (redes WPA2 y WPA3 separadas) para equipos antiguos.",
    "Confirmed there are no parallel, secondary, or old networks active in the home.":
      "Confirmaste que no hay redes paralelas, secundarias o viejas activas en el hogar.",
    "This is an official record. If it is later determined that these steps were not actually performed, you may be held accountable. Only proceed if every step above is genuinely complete.":
      "Este es un registro oficial. Si más adelante se determina que estos pasos no se realizaron, podrías ser responsabilizado. Continúa solo si cada paso de arriba está genuinamente completo.",
    "Cancel": "Cancelar",
    "I affirm — all steps were completed": "Afirmo — todos los pasos fueron completados",

    // switch property
    "This is a switch-based property": "Esta es una propiedad basada en switch",
    "Lofts at Sodo, The Vue, NEXGEN, and similar switch properties.":
      "Lofts at Sodo, The Vue, NEXGEN y propiedades de switch similares.",
    "Switch property · Basic troubleshooting": "Propiedad de switch · Diagnóstico básico",
    "Complete these steps before requesting a swap":
      "Completa estos pasos antes de solicitar un cambio",
    "At a switch-based property, the problem is often at the switch or the port — not the EVO router. Work through each step and confirm it before proceeding.":
      "En una propiedad basada en switch, el problema suele estar en el switch o el puerto — no en el router EVO. Realiza cada paso y confírmalo antes de continuar.",
    "Test a spare port": "Prueba un puerto de repuesto",
    "Move the customer to a known-good spare port and verify.":
      "Mueve al cliente a un puerto de repuesto que sepas que funciona y verifica.",
    "Test with your laptop at the port": "Prueba con tu laptop en el puerto",
    "Confirm the port delivers service by connecting your own laptop.":
      "Confirma que el puerto entrega servicio conectando tu propia laptop.",
    "Punch down and activate the correct line": "Poncha y activa la línea correcta",
    "Verify the correct line is punched down and activated for the customer.":
      "Verifica que la línea correcta esté ponchada y activada para el cliente.",
    "If all ports fail: capture switch serial & notify the NOC":
      "Si todos los puertos fallan: captura el serial del switch y notifica al NOC",
    "If every port on the switch fails, record the switch serial number below and notify the NOC immediately — a Commercial tech must be dispatched to replace the switch.":
      "Si todos los puertos del switch fallan, anota el número de serie del switch abajo y notifica al NOC de inmediato — se debe enviar un técnico Comercial para reemplazar el switch.",
    "Switch serial number": "Número de serie del switch",
    "Notify the NOC immediately with this serial number so a Commercial tech can be dispatched.":
      "Notifica al NOC de inmediato con este número de serie para que se pueda enviar un técnico Comercial.",
    "I confirm I completed all basic switch troubleshooting steps above.":
      "Confirmo que completé todos los pasos básicos de diagnóstico del switch de arriba.",
    "Continue to swap request →": "Continuar a la solicitud de cambio →",
    "Denied — do not swap": "Denegado — no hagas el cambio",
    "New request": "Nueva solicitud",
    "Request sent": "Solicitud enviada",
    "Didn't send": "No se envió",
    "Go back": "Regresar",
  };

  function applyLang(lang) {
    const nodes = document.querySelectorAll("[data-i18n-text]");
    if (lang === "es") {
      document.querySelectorAll("[data-i18n-text]").forEach((el) => {
        const en = el.getAttribute("data-i18n-text");
        if (ES[en]) el.textContent = ES[en];
      });
    } else {
      document.querySelectorAll("[data-i18n-text]").forEach((el) => {
        el.textContent = el.getAttribute("data-i18n-text");
      });
    }
    document.documentElement.lang = lang;
    document.querySelectorAll(".lang-opt").forEach((o) =>
      o.classList.toggle("active", o.dataset.lang === lang)
    );
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  // On load: snapshot every translatable string as data-i18n-text, then apply
  // the saved language. We snapshot text nodes so toggling back to EN restores
  // the exact original.
  function tagStrings() {
    // Elements whose *direct* text should translate. We tag any element that
    // has no child elements (leaf) and whose trimmed text has a Spanish entry,
    // plus explicitly-marked [data-i18n] spans.
    const candidates = document.querySelectorAll(
      "h1,h2,h3,h4,p,span,b,em,button,a,label,li,div,option,th"
    );
    candidates.forEach((el) => {
      // skip if it has element children (to avoid clobbering nested markup)
      const hasElementChild = Array.from(el.childNodes).some(
        (n) => n.nodeType === 1
      );
      const txt = el.textContent.trim();
      if (!hasElementChild && txt && ES[txt] !== undefined) {
        el.setAttribute("data-i18n-text", txt);
      }
    });
  }

  function init() {
    tagStrings();
    let saved = "en";
    try { saved = localStorage.getItem(LANG_KEY) || "en"; } catch (e) {}
    applyLang(saved);

    const toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const current = document.documentElement.lang === "es" ? "es" : "en";
        applyLang(current === "es" ? "en" : "es");
      });
    }
  }

  // expose for dynamically-injected content (result cards) to re-translate
  window.applyEvoLang = function () {
    const lang = document.documentElement.lang === "es" ? "es" : "en";
    tagStrings();
    applyLang(lang);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
