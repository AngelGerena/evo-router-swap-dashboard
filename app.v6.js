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
// "Guide" buttons inside the checklist (data-page deep-links straight to a page)
$$("[data-open]").forEach((b) =>
  b.addEventListener("click", () =>
    openResource(b.dataset.open, null, b.dataset.page ? parseInt(b.dataset.page, 10) : null)
  )
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

async function openResource(id, cardEl, targetPage, explicitRes) {
  const res = explicitRes || CFG.RESOURCES.find((r) => r.id === id);
  if (!res) return;
  if (!explicitRes) markSeen(id);
  $("#readerTitle").textContent = res.title;
  $("#readerPage").textContent = "";
  reader.hidden = false;
  document.body.style.overflow = "hidden";
  if (typeof pdfjsLib === "undefined") {
    readerScroll.innerHTML =
      `<div class="reader-loading">Opening the PDF directly…</div>`;
    // Native PDF viewers honor #page=N to jump straight to the section.
    window.open(res.file + (targetPage ? "#page=" + targetPage : ""), "_blank");
    return;
  }
  readerScroll.innerHTML = '<div class="reader-loading">Loading…</div>';

  try {
    const pdf = await pdfjsLib.getDocument(res.file).promise;
    currentPdf = pdf;
    readerScroll.innerHTML = "";
    const gotoPage = targetPage && targetPage >= 1 && targetPage <= pdf.numPages ? targetPage : null;
    $("#readerPage").textContent = gotoPage ? `Page ${gotoPage} of ${pdf.numPages}` : `${pdf.numPages} pages`;
    // Render at device width for crispness; cap for performance.
    const targetW = Math.min(readerScroll.clientWidth - 20, 900);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const scale = (targetW / base.width) * (window.devicePixelRatio || 1);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width; canvas.height = vp.height;
      canvas.dataset.page = i;
      readerScroll.appendChild(canvas);
      page.render({ canvasContext: canvas.getContext("2d"), viewport: vp });
    }
    // Jump to the deep-linked page; retry past any layout-settle delay.
    if (gotoPage) {
      const jump = () => {
        const tc = readerScroll.querySelector(`canvas[data-page="${gotoPage}"]`);
        // .reader-scroll has scroll-behavior:smooth in CSS, which cancels a
        // programmatic jump mid-render. Force an instant scroll for the jump.
        if (tc) { readerScroll.style.scrollBehavior = "auto"; readerScroll.scrollTop = tc.offsetTop; }
      };
      requestAnimationFrame(jump);
      setTimeout(jump, 120);
      setTimeout(jump, 400);
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

// ---- NRBY interstitial -----------------------------------------------------
const NRBY_URL = "https://app.nrby.ai/dashboard";
const nrbyScreen = $("#nrbyScreen");
const nrbyBtn = $("#nrbyBtn");
const nrbyAck = $("#nrbyAck");
const nrbyContinue = $("#nrbyContinue");

function openNrby() {
  if (nrbyAck) nrbyAck.checked = false;
  if (nrbyContinue) nrbyContinue.disabled = true;
  nrbyScreen.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeNrby() {
  nrbyScreen.hidden = true;
  document.body.style.overflow = "";
}
if (nrbyBtn) nrbyBtn.addEventListener("click", openNrby);
$("#nrbyClose")?.addEventListener("click", closeNrby);
if (nrbyAck) nrbyAck.addEventListener("change", () => {
  if (nrbyContinue) nrbyContinue.disabled = !nrbyAck.checked;
});
if (nrbyContinue) nrbyContinue.addEventListener("click", () => {
  if (nrbyAck && !nrbyAck.checked) return;
  window.open(NRBY_URL, "_blank", "noopener");
  closeNrby();
});

// ---- checklist gate --------------------------------------------------------
const checks = ["#c_relocate", "#c_ssid", "#c_parallel"].map($);
const rNid = $("#r_nid"), rHealth = $("#r_health");
const r1490 = $("#r_1490"), r1550 = $("#r_1550"), r1577 = $("#r_1577");
const readGrid = $("#readGrid");
let ontType = null; // 'iphotonix' | 'adtran'

// Per-type acceptable ranges (dB). Reading must fall within [hi, lo].
const ONT_RANGE = {
  iphotonix: { lo: -21, hi: -13 },
  adtran:    { lo: -22, hi: -10 },
};

// Which active fields apply to the selected type
function activeOntFields() {
  if (ontType === "iphotonix") return [r1490, r1550];
  if (ontType === "adtran") return [r1577];
  return [];
}

function selectOnt(type) {
  ontType = type;
  readGrid.hidden = false;
  $$(".ont-pick").forEach((b) => b.classList.toggle("sel", b.dataset.ont === type));
  $$(".fld-iphotonix").forEach((el) => (el.hidden = type !== "iphotonix"));
  $$(".fld-adtran").forEach((el) => (el.hidden = type !== "adtran"));
  evalReadings(); evalGate();
}
$$(".ont-pick").forEach((b) => b.addEventListener("click", () => selectOnt(b.dataset.ont)));
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
  if (!ontType) { flag.hidden = true; return; }
  const range = ONT_RANGE[ontType];
  const fields = activeOntFields();
  const entered = fields.filter((el) => !isNaN(readLight(el)));
  if (entered.length === 0) { flag.hidden = true; return; }

  // flag any entered reading that's out of this ONT type's range
  const bad = entered
    .map((el) => ({ el, v: readLight(el) }))
    .filter(({ v }) => !(v <= range.hi && v >= range.lo));

  flag.hidden = false;
  if (bad.length) {
    flag.className = "read-flag warn";
    const vals = bad.map((b) => `${b.v} dB`).join(", ");
    flag.textContent =
      `${vals} outside the ${range.hi} to ${range.lo} dB range for ${ontLabel()}. Re-check the fiber before swapping.`;
  } else {
    flag.className = "read-flag ok";
    flag.textContent = `Readings are within the ${range.hi} to ${range.lo} dB range for ${ontLabel()}.`;
  }
}
function ontLabel() { return ontType === "iphotonix" ? "iPhotonix" : "Adtran"; }

// NID is informational only — never blocks the gate. Typical -13 to -17,
// but lower is normal on longer fiber runs, so this is a gentle sanity check.
function evalNid() {
  const note = $("#nidNote");
  if (!note) return;
  const v = readLight(rNid);
  if (isNaN(v)) { note.hidden = true; return; }
  note.hidden = false;
  if (v <= -13 && v >= -17) {
    note.className = "nid-note ok";
    note.textContent = `NID ${v} dB is within the typical -13 to -17 range.`;
  } else {
    note.className = "nid-note info";
    note.textContent = `NID ${v} dB is outside the typical -13 to -17 range — that can be normal on longer fiber runs. Just confirm it's expected for this distance.`;
  }
}

function evalGate() {
  const allChecked = checks.every((c) => c && c.checked);
  const fields = activeOntFields();
  const allOntIn = ontType && fields.length > 0 && fields.every((el) => !isNaN(readLight(el)));
  const open = allChecked && allOntIn;
  toSubmit.disabled = !open;
  if (open) {
    lockHint.textContent = "Basics done — continue when ready.";
    lockHint.classList.add("clear");
  } else {
    lockHint.classList.remove("clear");
    let need = [];
    if (!allChecked) need.push("tick all 3 boxes");
    if (!ontType) need.push("pick ONT type");
    else if (!allOntIn) need.push(ontType === "iphotonix" ? "enter 1490 + 1550" : "enter 1577");
    lockHint.textContent = "To continue: " + need.join(" · ");
  }
}
checks.forEach((c) => c.addEventListener("change", evalGate));
// Show the minus in the box itself once the tech leaves the field.
function normalizeFieldDisplay(el) {
  if (!el) return;
  const v = readLight(el);
  if (!isNaN(v)) el.value = String(v);
}
["input", "change", "blur", "keyup"].forEach((evt) =>
  [rNid, r1490, r1550, r1577].forEach((el) => el && el.addEventListener(evt, () => {
    if (evt === "blur") normalizeFieldDisplay(el);
    evalReadings(); evalNid(); evalGate();
  }))
);

// ---- RMA (defective EVO) toggle -------------------------------------------
const rmaCb = $("#f_rma"), rmaAckWrap = $("#rmaAckWrap"), rmaAckCb = $("#f_rma_ack"), rmaFlag = $("#rmaFlag");
const returnMicro = $("#returnMicro");
const RETURN_DEFAULT_HTML = 'Every removed EVO must carry its account # and return to <b>4558 in Orlando</b>.';
const RETURN_RMA_HTML = '⚠ Defective unit — do <b>not</b> send to 4558 Orlando. Return to <b>Evolution Digital (RMA)</b>; full instructions appear after approval.';
function syncRma(){
  if (!rmaCb) return;
  const on = rmaCb.checked;
  if (rmaAckWrap) rmaAckWrap.hidden = !on;
  if (!on && rmaAckCb) rmaAckCb.checked = false;
  if (rmaFlag) rmaFlag.classList.toggle("on", on);
  if (returnMicro) returnMicro.innerHTML = on ? RETURN_RMA_HTML : RETURN_DEFAULT_HTML;
}
if (rmaCb) rmaCb.addEventListener("change", syncRma);

// ---- submit ----------------------------------------------------------------
$("#reqForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Defective-EVO flag requires the RMA acknowledgment before sending.
  if ($("#f_rma") && $("#f_rma").checked && !($("#f_rma_ack") && $("#f_rma_ack").checked)) {
    alert("Please confirm the Evolution Digital RMA acknowledgment, or untick the defective-EVO box.");
    if ($("#f_rma_ack")) $("#f_rma_ack").focus();
    return;
  }

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
    rma_flagged: !!($("#f_rma") && $("#f_rma").checked),
    rma_acknowledged: !!($("#f_rma_ack") && $("#f_rma_ack").checked),
    checklist: {
      router_relocated: $("#c_relocate").checked,
      dual_ssid_attempted: $("#c_ssid").checked,
      no_parallel_networks: $("#c_parallel").checked,
      ont_type: ontType,
      ont_light_nid: isNaN(readLight(rNid)) ? null : readLight(rNid),
      ont_light_1490: r1490 && !isNaN(readLight(r1490)) ? readLight(r1490) : null,
      ont_light_1550: r1550 && !isNaN(readLight(r1550)) ? readLight(r1550) : null,
      ont_light_1577: r1577 && !isNaN(readLight(r1577)) ? readLight(r1577) : null,
      // Backward-compatible single value: data channel for the selected ONT type
      ont_light_ont: ontType === "iphotonix"
        ? (r1550 && !isNaN(readLight(r1550)) ? readLight(r1550) : null)
        : (r1577 && !isNaN(readLight(r1577)) ? readLight(r1577) : null),
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
  if (!ok) {
    card.className = "result-card err";
    card.innerHTML = `
      <div class="seal">!</div>
      <h2>Didn't send</h2>
      <p>${escHtml(data.error || "Something went wrong.")}</p>
      <button class="again" onclick="history.back()">Go back</button>`;
    goStep(3);
    return;
  }
  card.className = "result-card ok pending";
  card.innerHTML = `
    <div class="seal" id="rSeal">✓</div>
    <h2 id="rTitle">Request sent</h2>
    <p id="rMsg">The job is gated until a manager decides — they've been pinged now.</p>
    <div class="routed">Routed to ${escHtml(data.routed_to || "your market manager")}</div>
    <div class="await" id="rAwait"><span class="dot"></span> Waiting on their decision… this screen updates by itself.</div>
    <button class="again" onclick="location.reload()">New request</button>`;
  goStep(3);
  if (data.id) startDecisionPoll(data.id);
}

let _pollTimer = null, _pollStop = null;
function startDecisionPoll(id) {
  if (_pollTimer) clearInterval(_pollTimer);
  if (_pollStop) clearTimeout(_pollStop);
  const check = async () => {
    try {
      const r = await fetch(`${CFG.FUNCTIONS_BASE}/request-status?id=${encodeURIComponent(id)}`, {
        headers: { apikey: CFG.SUPABASE_ANON_KEY },
      });
      if (!r.ok) return;
      const d = await r.json();
      if (d.status === "approved" || d.status === "denied") {
        clearInterval(_pollTimer); _pollTimer = null;
        if (_pollStop) { clearTimeout(_pollStop); _pollStop = null; }
        renderDecision(d);
      }
    } catch (e) { /* keep polling */ }
  };
  check();
  _pollTimer = setInterval(check, 12000);
  _pollStop = setTimeout(() => { if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; } }, 45 * 60 * 1000);
}

function renderDecision(d) {
  const card = $("#resultCard");
  const approved = d.status === "approved";
  const note = (d.note || "").trim();
  const rma = (CFG && CFG.EVO_RMA) || {};
  const isRma = d.rma_flagged === true && rma.enabled !== false;
  const retHead = isRma ? escHtml(rma.heading || "RMA the defective EVO to Evolution Digital") : "Quarantine &amp; return the old EVO";
  const shipToHtml = escHtml(rma.shipTo || "Evolution Digital — RMA Department").replace(/\n/g, "<br>");
  const retBox = isRma
    ? `<div class="return-addr rma">${shipToHtml}</div>` +
      (rma.contact ? `<p class="micro">RMA contact: ${escHtml(rma.contact)}</p>` : "") +
      (rma.note ? `<p class="micro">${escHtml(rma.note)}</p>` : "")
    : `<div class="return-addr">4558 35th St.<br>Orlando, FL 32811</div>`;
  card.className = "result-card decided " + (approved ? "ok" : "err");
  card.innerHTML = `
    <div class="seal big">${approved ? "✓" : "✕"}</div>
    <h2>${approved ? "Approved — you're cleared" : "Denied — do not swap"}</h2>
    <p>${approved
        ? "Your manager approved this swap. Before you remove the old EVO, the two steps below are required — no exceptions."
        : "Your manager denied this swap. Hold off and follow their note below."}</p>
    ${note ? `<div class="mgrnote ${approved ? "good" : "bad"}"><span class="mgrnote-h">${approved ? "Why it was approved" : "Manager's note / instruction"}</span>${escHtml(note)}</div>` : ""}
    ${!approved ? `
    <div class="must-wrap denied">
      <div class="must-head">Still required · No exceptions</div>
      <div class="must-step">
        <div class="must-num">!</div>
        <div class="must-body">
          <b>Save the EVO log in Frontline</b>
          <p>Even though the swap was denied, save the EVO log in Frontline for the record. Do this even if the unit is offline. Follow any additional instructions in the manager's note above.</p>
          <button class="must-guide" id="deniedEvoLogGuide" type="button">Open “Save EVO Log” guide</button>
        </div>
      </div>
    </div>` : ""}
    ${approved ? `
    ${isRma ? `<div class="mgrnote bad"><span class="mgrnote-h">Defective unit — Evolution Digital RMA</span>Do not send this EVO to 4558 Orlando. Follow the RMA steps below.</div>` : ""}
    <div class="must-wrap">
      <div class="must-head">Required before &amp; after the swap · No exceptions</div>

      <div class="must-step">
        <div class="must-num">1</div>
        <div class="must-body">
          <b>Save the EVO log in Frontline first</b>
          <p>Before you remove the old EVO router, save its log in Frontline so Evolution can review it in the lab. Do this even if the unit is offline.</p>
          <button class="must-guide" id="approvedEvoLogGuide" type="button">Open “Save EVO Log” guide</button>
        </div>
      </div>

      <div class="must-step">
        <div class="must-num">2</div>
        <div class="must-body">
          <b>${retHead}</b>
          <p>Quarantine the removed EVO router (and its power supply, if applicable). Label a box with the customer’s <b>account #</b> and ensure it is returned to:</p>
          ${retBox}
        </div>
      </div>
    </div>` : ""}
    ${d.by ? `<div class="routed">Decided by ${escHtml(d.by)}</div>` : ""}
    <button class="again" onclick="location.reload()">New request</button>`;

  // The card is injected after load, so wire its guide button(s) directly.
  const logGuide = $("#approvedEvoLogGuide") || $("#deniedEvoLogGuide");
  if (logGuide) logGuide.addEventListener("click", () => openResource("evo_log"));
}

function escHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}


// ---- tutorial slide deck ---------------------------------------------------
const tutorial = $("#tutorial");
if (tutorial) {
  const TUTORIAL = [
    { ic: "▶", badge: "EVO Swap Request", title: "How it works",
      body: "Every swap needs approval from Anthony or Peterson — no exceptions. Here’s the whole flow in about a minute." },
    { ic: "1", badge: "Step 1", title: "Run the basics first",
      body: "Most “swaps” are fixed without one. Relocate the router centrally, attempt a Dual-SSID split for legacy devices, and confirm there’s no second/old network. Tap any Guide to open the SOP at the right page." },
    { ic: "2", badge: "Step 2", title: "Checklist + ONT readings",
      body: "Tick all three boxes, then enter your NID and ONT light readings. SOP range is −14 to −19.5 dB, with no more than 1 dB loss NID→ONT. The request button stays locked until the basics and ONT reading are in." },
    { ic: "3", badge: "Step 3", title: "Submit the request",
      body: "Add the customer, account / job #, the EVO serial or MAC being removed and its account, your market, and your name — then tap Request approval. Every removed EVO returns to 4558 in Orlando with its account #." },
    { ic: "⚡", badge: "After you submit", title: "A manager decides — fast",
      body: "Your market’s manager is pinged instantly and approves or denies in one tap. You’ll see a confirmation; the job stays gated until they decide. No answer in 30 minutes auto-escalates to the backstop." },
    { ic: "✓", badge: "That’s it", title: "Basics → gate → approved",
      body: "Run the basics, finish the checklist, submit. Reopen this anytime from the “How it works” button." },
  ];
  const tutStage = $("#tutStage"), tutDots = $("#tutDots"), tutPrev = $("#tutPrev"), tutNext = $("#tutNext");
  let tutIdx = 0;
  const renderTut = () => {
    const s = TUTORIAL[tutIdx];
    tutStage.innerHTML =
      `<div class="tut-slide"><div class="tut-ic">${s.ic}</div>` +
      `<div class="tut-badge">${s.badge}</div><h2>${s.title}</h2><p>${s.body}</p></div>`;
    tutDots.innerHTML = TUTORIAL.map((_, i) => `<span class="tut-dot ${i === tutIdx ? "on" : ""}"></span>`).join("");
    tutPrev.disabled = tutIdx === 0;
    tutNext.textContent = tutIdx === TUTORIAL.length - 1 ? "Done" : "Next ›";
  };
  const openTut = () => { tutIdx = 0; renderTut(); tutorial.hidden = false; document.body.style.overflow = "hidden"; };
  const closeTut = () => { tutorial.hidden = true; document.body.style.overflow = ""; };
  const go = (d) => {
    const n = tutIdx + d;
    if (n < 0) return;
    if (n >= TUTORIAL.length) { closeTut(); return; }
    tutIdx = n; renderTut();
  };
  // Tutorial opens the dedicated, navigable walkthrough page (Back/Next/swipe/keys).
  $("#tutBtn").addEventListener("click", () => { location.href = "tutorial.html"; });
  $("#tutClose").addEventListener("click", closeTut);
  tutPrev.addEventListener("click", () => go(-1));
  tutNext.addEventListener("click", () => go(1));
  // swipe (mobile)
  let tx = null;
  tutStage.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  tutStage.addEventListener("touchend", (e) => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (dx < -45) go(1); else if (dx > 45) go(-1);
  });
  // keyboard
  document.addEventListener("keydown", (e) => {
    if (tutorial.hidden) return;
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "Escape") closeTut();
  });
}

// ---- init ------------------------------------------------------------------
fillMarkets();
renderResources();
evalGate();
