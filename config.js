// ============================================================================
// config.js — EDIT THESE before deploying.
// Safe to expose: the anon key is public by design and RLS restricts it.
// NEVER put the service-role key here.
// ============================================================================
window.EVO_CONFIG = {
  // From Supabase -> Project Settings -> API
  SUPABASE_URL: "https://mopoomefvrgozbgnrxlo.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_kOEi_IDNrskSjcJq7Ieanw_qVjOYnSn",

  // Edge function base = SUPABASE_URL + /functions/v1
  // (filled automatically from SUPABASE_URL below — no need to edit)
  get FUNCTIONS_BASE() { return this.SUPABASE_URL + "/functions/v1"; },

  // Markets shown in the tech dropdown. Codes MUST match the markets table.
  MARKETS: [
    { code: "CFL",           label: "Central Florida (CFL)" },
    { code: "SWFL",          label: "Southwest Florida (SWFL)" },
    { code: "WEST",          label: "West" },
    { code: "LAL/CAS",       label: "Lakeland / Cassel (LAL/CAS)" },
    { code: "TAMPA",         label: "Tampa" },
    { code: "LEESBURG_FTTH", label: "Leesburg FTTH" },
    { code: "MARCO_FTTH",    label: "Marco FTTH" },
  ],

  // Field resources. Drop the PDFs into /pdfs and reference them here.
  // 'pages' lets the viewer render page-by-page images if you pre-render them;
  // if omitted, the raw PDF is shown in a responsive frame.
  RESOURCES: [
    { id: "dual_ssid",   title: "Dual SSID Split (WPA2 + WPA3)", subtitle: "For legacy devices that won't stay on WPA3", file: "pdfs/SB_Dual_SSID_Field_SOP.pdf" },
    { id: "install_sop", title: "Install Process & Procedure",   subtitle: "ONT first, router central, RSSI validation", file: "pdfs/Modified_Install_Training_Guide.pdf" },
    { id: "evo_log",     title: "Save EVO Log in Frontline",     subtitle: "Required for every swap — Evolution lab log", file: "pdfs/HOW-TO-SAVE-LOG-FRONTLINE.pdf" },
    { id: "nrby_osp",    title: "NRBY & OSP Sequence",           subtitle: "Submit NRBY first, then document", file: "pdfs/NRBY_and_OSP.pdf" },
  ],

  // === EVO RMA (Evolution Digital) ==========================================
  // Shown on the APPROVED card when a tech flags the removed EVO as defective.
  // >>> EDIT shipTo / contact with Evolution Digital's REAL RMA details before
  //     field use. Defective units must NOT go to 4558 Orlando. <<<
  EVO_RMA: {
    enabled: true,
    heading: "RMA the defective EVO to Evolution Digital",
    // TODO: replace with Evolution Digital's real RMA ship-to address.
    shipTo: "Evolution Digital \u2014 RMA Department\n(Return address is being confirmed \u2014 do NOT ship yet.)\nQuarantine the unit, label it with the customer account #, and hold for your manager's RMA instructions.",
    // TODO: replace with the real RMA email / phone / portal.
    contact: "Pending \u2014 your manager / warehouse will confirm the Evolution Digital RMA details.",
    note: "This unit was flagged defective. Do NOT send it to 4558 Orlando. Obtain an RMA number from Evolution Digital first, label the box with the customer account # and the RMA #, then return it per Evolution Digital's RMA process \u2014 ASAP.",
  },
};
