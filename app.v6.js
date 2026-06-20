// ============================================================================
// app.js — EVO Swap Request (tech-facing)
// ============================================================================
// Surface any uncaught error on screen instead of dying silently.
window.addEventListener("error", (e) => {
  const b = document.createElement("div");
  b.style.cssText = "position:fixed;bottom:0;left:0;right:0;background:#b91c1c;color:#fff;font:12px monospace;padding:8px;z-index:9999;white-space:pre-wrap";
  b.textContent = "JS error: " + (e.message || e.error);
  document.body.appendChild(b);
});

const CFG = window.EVO_CONFIG;

// pdf.js is optional. If it didn't load (slow CDN, offline, blocked), the rest
// of the app MUST still work. Never let this line crash the script.
try {
  if (typeof pdfjsLib !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
} catch (e) { /* pdf reader will degrade gracefully */ }

const $ = (s, r) => (r && r.querySelector ? r : document).querySelector(s);
const $$ = (s, r) => [...(r && r.querySelectorAll ? r : document).querySelectorAll(s)];

const state = {
  step: 0,
  resourcesOpened: new Set(),
  formOpenedAt: Date.now(),
};

// ---- step navigation -------------------------------------------------------
function goStep(n) {
  state.step = n;
  $$(".step").forEach((s) => s.classList.toggle("is-active", +s.dataset.step === n));
  $$(".rail-step").forEach((railBtn, i) => {
    railBtn.classList.toggle("is-active", i === n);
    railBtn.classList.toggle("done", i < n);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$$("[data-next]").forEach((b) => b.addEventListener("click", () => goStep(state.step + 1)));
$$(".rail-step").forEach((b) =>
  b.addEventListener("click", () => { if (+b.dataset.go <= state.step) goStep(+b.dataset.go); })
);

// ---- markets ---------------------------------------------------------------
function fillMarkets() {
  const sel = $("#f_market");
  sel.innerHTML = '<option value="" disabled selected>Select your market…</option>' +
    CFG.MARKETS.map((m) => `<option value="${m.code}">${m.label}</option>`).join("");
}

// ---- resources -------------------------------------------------------------
function renderResources() {
  const wrap = $("#resourceList");
  wrap.innerHTML = CFG.RESOURCES.map((r) => `
    <button class="res-card" data-res="${r.id}">
      <span class="res-ic">PDF</span>
      <span><b>${r.title}</b><em>${r.subtitle}</em></span>
      <span class="chev">›</span>
    </button>`).join("");
  $$("[data-res]", wrap).forEach((b) =>
    b.addEventListener("click", () => openResource(b.dataset.res, b))
  );
}
// "Guide" buttons inside the checklist
$$("[data-open]").forEach((b) =>
  b.addEventListener("click", () => openResource(b.dataset.open))
);

function markSeen(id) {
  state.resourcesOpened.add(id);
  $$(`[data-res="${id}"]`).forEach((card) => {
    if (card.classList.contains("seen")) return;
    card.classList.add("seen");
    card.querySelector(".chev")?.replaceWith(
      Object.assign(document.createElement("span"), { className: "seen-tag", textContent: "Opened" })
    );
  });
}

// ---- PDF reader ------------------------------------------------------------
const reader = $("#reader"), readerScroll = $("#readerScroll");
let currentPdf = null;

async function openResource(id, cardEl) {
  const res = CFG.RESOURCES.find((r) => r.id === id);
  if (!res) return;
  markSeen(id);
  $("#readerTitle").textContent = res.title;
  $("#readerPage").textContent = "";
  reader.hidden = false;
  document.body.style.overflow = "hidden";
  if (typeof pdfjsLib === "undefined") {
    readerScroll.innerHTML =
      `<div class="reader-loading">Opening the PDF directly…</div>`;
    window.open(res.file, "_blank");
    return;
  }
  readerScroll.innerHTML = '<div class="reader-loading">Loading…</div>';

  try {
    const pdf = await pdfjsLib.getDocument(res.file).promise;
    currentPdf = pdf;
    readerScroll.innerHTML = "";
    $("#readerPage").textContent = `${pdf.numPages} pages`;
    // Render at device width for crispness; cap for performance.
    const targetW = Math.min(readerScroll.clientWidth - 20, 900);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const scale = (targetW / base.width) * (window.devicePixelRatio || 1);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width; canvas.height = vp.height;
      readerScroll.appendChild(canvas);
      page.render({ canvasContext: canvas.getContext("2d"), viewport: vp });
    }
  } catch (e) {
    readerScroll.innerHTML =
      `<div class="reader-loading">Couldn't load this PDF.<br>Make sure ${res.file} is deployed.</div>`;
  }
}
$("#readerClose").addEventListener("click", () => {
  reader.hidden = true;
  document.body.style.overflow = "";
  readerScroll.innerHTML = "";
  currentPdf = null;
});

// ---- checklist gate --------------------------------------------------------
const checks = ["#c_relocate", "#c_ssid", "#c_parallel"].map($);
const rOnt = $("#r_ont"), rNid = $("#r_nid"), rHealth = $("#r_health");
const toSubmit = $("#toSubmit"), lockHint = $("#lockHint"), flag = $("#readingFlag");

// Light readings (NID/ONT) are always negative dB. iOS numeric keyboards hide
// the minus sign, so accept a plain number and coerce it negative. Honor an
// explicit minus if the tech typed one.
function readLight(el){
  const raw = String(el.value || "").trim();
  if(raw === "") return NaN;
  const n = parseFloat(raw.replace(/[^0-9.\-]/g, ""));
  if(isNaN(n)) return NaN;
  return n > 0 ? -n : n;   // 18 -> -18 ; -18 stays -18 ; 0 stays 0
}
function readInt(el){
  const n = parseInt(String(el.value||"").replace(/[^0-9\-]/g,""),10);
  return isNaN(n) ? null : n;
}

function evalReadings() {
  const ont = readLight(rOnt), nid = readLight(rNid);
  if (isNaN(ont)) { flag.hidden = true; return; }
  flag.hidden = false;
  const inRange = ont <= -14 && ont >= -19.5;
  const loss = !isNaN(nid) ? Math.abs(ont - nid) : null;
  if (!inRange) {
    flag.className = "read-flag warn";
    flag.textContent = `ONT ${ont} dB is outside the -14 to -19.5 range. Re-check the fiber before swapping.`;
  } else if (loss !== null && loss > 1) {
    flag.className = "read-flag warn";
    flag.textContent = `NID → ONT loss is ${loss.toFixed(1)} dB (over 1 dB). Troubleshoot fiber/connectors first.`;
  } else {
    flag.className = "read-flag ok";
    flag.textContent = "ONT reading is within SOP range.";
  }
}

function evalGate() {
  const checkStates = checks.map((c) => (c && c.checked ? "1" : "0"));
  const allChecked = checks.every((c) => c && c.checked);
  const ontVal = readLight(rOnt);
  const hasOnt = !isNaN(ontVal);
  const open = allChecked && hasOnt;
  toSubmit.disabled = !open;
  if (open) {
    lockHint.textContent = "Basics done — continue when ready.";
    lockHint.classList.add("clear");
  } else {
    // diagnostic so we can see exactly what's missing
    lockHint.classList.remove("clear");
    lockHint.textContent =
      `Checks ${checkStates.join("")} · ONT="${rOnt.value}" reads ${isNaN(ontVal) ? "—" : ontVal}` +
      ` · ${allChecked ? "" : "tick all 3 boxes"}${!allChecked && !hasOnt ? " & " : ""}${hasOnt ? "" : "enter ONT"}`;
  }
}
checks.forEach((c) => c.addEventListener("change", evalGate));
["input", "change", "blur", "keyup"].forEach((evt) =>
  [rOnt, rNid].forEach((el) => el.addEventListener(evt, () => { evalReadings(); evalGate(); }))
);

// ---- submit ----------------------------------------------------------------
$("#reqForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#submitBtn");
  btn.disabled = true; btn.textContent = "Sending…";

  const payload = {
    tech_name: $("#f_tech").value.trim(),
    market_code: $("#f_market").value,
    customer_first: $("#f_first").value.trim(),
    customer_last: $("#f_last").value.trim(),
    account_number: $("#f_acct").value.trim(),
    evo_serial_mac: $("#f_serial").value.trim(),
    removed_from_acct: $("#f_removed").value.trim(),
    swap_reason: $("#f_reason").value.trim() || null,
    checklist: {
      router_relocated: $("#c_relocate").checked,
      dual_ssid_attempted: $("#c_ssid").checked,
      no_parallel_networks: $("#c_parallel").checked,
      ont_light_nid: isNaN(readLight(rNid)) ? null : readLight(rNid),
      ont_light_ont: isNaN(readLight(rOnt)) ? null : readLight(rOnt),
      overall_health_score: readInt(rHealth),
      resources_opened: [...state.resourcesOpened],
      time_to_submit_secs: Math.round((Date.now() - state.formOpenedAt) / 1000),
    },
  };

  try {
    const res = await fetch(`${CFG.FUNCTIONS_BASE}/submit-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CFG.SUPABASE_ANON_KEY },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    showResult(true, data);
  } catch (err) {
    showResult(false, { error: err.message });
    btn.disabled = false; btn.textContent = "Request approval";
  }
});

function showResult(ok, data) {
  const card = $("#resultCard");
  if (ok) {
    card.className = "result-card ok";
    card.innerHTML = `
      <div class="seal">✓</div>
      <h2>Request sent</h2>
      <p>The job is gated until a manager decides. They've been pinged now.</p>
      <div class="routed">Routed to ${data.routed_to || "your market manager"}</div>
      <p style="margin-top:14px">Keep this screen handy. You'll be cleared the moment it's approved.</p>
      <button class="again" onclick="location.reload()">New request</button>`;
  } else {
    card.className = "result-card err";
    card.innerHTML = `
      <div class="seal">!</div>
      <h2>Didn't send</h2>
      <p>${data.error || "Something went wrong."}</p>
      <button class="again" onclick="history.back()">Go back</button>`;
  }
  goStep(3);
}

// ---- init ------------------------------------------------------------------
fillMarkets();
renderResources();
evalGate();
