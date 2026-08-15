/* ============================================================================
   CLEANIAC — SITE CONFIGURATION
   ----------------------------------------------------------------------------
   ► THIS IS THE ONLY FILE YOU NEED TO EDIT FOR BUSINESS DETAILS.
     Change the values below and save. Nothing else has to be touched.

   Details currently filled in were taken from the official Cleaniac brochure.
   Please verify each one and replace anything that has changed.
   ========================================================================== */

const CLEANIAC_CONFIG = {

  /* --- WHATSAPP -------------------------------------------------------------
     Country code + number, digits only, NO "+", NO spaces.
     India example: 91 + 7204022020  ->  "917204022020"
     ⚠️ REPLACE if your WhatsApp business number is different from the phone
        number printed on the brochure.                                       */
  WHATSAPP_NUMBER: "917204022020",

  /* --- PHONE (click-to-call) ---------------------------------------------- */
  PHONE_DISPLAY: "+91 72040 22020",          // ← shown on the website
  PHONE_TEL: "+917204022020",                // ← used by the "tel:" link

  /* --- EMAIL --------------------------------------------------------------- */
  EMAIL: "info@cleaniac.in",                 // ← REPLACE if different

  /* --- ADDRESS ------------------------------------------------------------- */
  ADDRESS_LINES: [                           // ← REPLACE / add lines as needed
    "Ground Floor, Masco Meridian",
    "Old Kankanady Bypass Road",
    "Pumpwell, Mangalore, Karnataka"
  ],

  /* --- GOOGLE MAPS ---------------------------------------------------------
     Paste your Google Maps share link here to activate the "Get directions"
     link. Leave as "" (empty) to hide it.                                    */
  MAPS_URL: "",

  /* --- BUSINESS HOURS ------------------------------------------------------
     ⚠️ PLACEHOLDER — replace with your actual working hours, or set to ""
        to hide the business-hours row completely.                            */
  HOURS: [
    { days: "Monday – Saturday", time: "Add your business hours" },
    { days: "Sunday", time: "Add your business hours" }
  ],

  /* --- SOCIAL LINKS (leave "" to hide the icon) ---------------------------- */
  SOCIAL: {
    instagram: "https://www.instagram.com/cleaniac.in/",
    facebook: "https://www.facebook.com/cleaniac.in/",
    website: "https://www.cleaniac.in"
  },

  /* --- BRAND --------------------------------------------------------------- */
  BRAND_NAME: "Cleaniac",
  BRAND_PARENT: "A unit of MAS Group",
  TAGLINE: "Make life shine everyday",

  /* --- CURRENCY ------------------------------------------------------------ */
  CURRENCY_SYMBOL: "₹",

  /* --- WHATSAPP MESSAGE TEMPLATES ------------------------------------------
     {{...}} placeholders are filled in automatically by the website.         */
  MESSAGES: {
    generic: "Hello Cleaniac, I would like to know more about your cleaning products.",
    bulk: "Hello Cleaniac, I am interested in bulk/commercial cleaning products. Please share pricing and available pack sizes.",
    orderIntro: "Hello Cleaniac,\nI would like to place an order:",
    productIntro: "Hello Cleaniac,\nI would like to enquire/order:",
    closing: "Please confirm availability, final pricing and delivery details.\nThank you."
  }
};

/* ---------------------------------------------------------------------------
   ADVANCED (optional) — carousel behaviour
   --------------------------------------------------------------------------- */
const CLEANIAC_SETTINGS = {
  autoScroll: true,          // slow automatic movement of product rows
  autoScrollDelay: 4200,     // milliseconds between steps
  toastDuration: 2200        // "Added to cart" message duration
};
