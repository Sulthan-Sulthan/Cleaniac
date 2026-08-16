# Cleaniac — static website

A two-page, mobile-first website for the Cleaniac cleaning range.
No backend, no database, no payment gateway — orders are sent through WhatsApp.

| Page | What it holds |
|---|---|
| `index.html` | Home — hero, categories, why Cleaniac, who we serve, bulk, about, how to order, FAQ, contact |
| `products.html` | The full catalogue — search, category filters, product rows, product dialog |

Open `index.html` in a browser, or upload the whole folder to any static host
(Netlify, Vercel, GitHub Pages, cPanel, Hostinger…). Nothing needs to be built.

---

## 1. The three things you will edit most

| What you want to change | File to open |
|---|---|
| WhatsApp number, phone, email, address, hours, social links | `js/config.js` |
| Products, prices, pack sizes, fragrances, photos | `js/products.js` |
| Page text (hero, about, FAQ, headings) | `index.html` / `products.html` |

### WhatsApp number
`js/config.js`, first setting:

```js
WHATSAPP_NUMBER: "917204022020",   // country code + number, digits only
```

> ⚠️ The number currently in the file is the contact number printed on the
> Cleaniac brochure (`72040 22020`). Confirm that this same number is registered
> on WhatsApp — if the business WhatsApp number is different, replace it here.

Everything else — phone, email, address, business hours, Instagram, Facebook —
is right below it in the same file, each with a comment.

**Business hours are still placeholders.** Replace `"Add your business hours"`
with the real timings, or delete the `HOURS` entries to hide that row.

### Prices and products
`js/products.js`. Each product looks like this:

```js
{
  id: "floor-cleaner",                       
  name: "Floor Cleaner",
  category: ["floor"],
  short: "For everyday floor and tile cleaning",
  description: "Used for cleaning floors and tiles…",
  image: "assets/products/floor-cleaner.png",
  flavourLabel: "Fragrance",
  flavours: ["Oudh", "Botanical Mist", …],
  sizes: [
    { label: "500 ml", price: 99 },
    { label: "5 L",    price: null }
  ],
  bulkAvailable: true
}
```

Rules:

* **Never write `price: 0`.** Use `price: null` for anything not priced yet —
  the site then shows *Contact for price* and leaves it out of the subtotal.
* Adding a product = copy one whole `{ … }` block, paste it before the final `];`,
  give it a new unique `id`.
* Prices are plain numbers (`99`, not `"₹99.00"`). The ₹ formatting is automatic.

---

## 2. Product photos

Every product points at a file in `assets/products/` named after its id.

**11 products use your own photographs**, cut out of their backgrounds and
exported as transparent 900 × 900 WebP:

| Product | Source photo |
|---|---|
| Floor Cleaner | IMG_7045 (Oudh, studio) |
| Hand Wash | IMG_7043 (Aqua Fresh) |
| Dishwash | IMG_7048 |
| Glass Cleaner | IMG_7063 |
| Liquid Detergent | IMG_7041 |
| Phenyl | WhatsApp 2.43.44 PM (1 L line-up) |
| Fabric Conditioner | WhatsApp 4.52.17 PM |
| Toilet Cleaner | WhatsApp 4.52.16 PM (2) |
| All Purpose Cleaner | WhatsApp 8.57.37 PM |
| Drain Cleaner | WhatsApp 8.57.19 PM |
| Soap Oil | WhatsApp 4.52.16 PM (1), right-hand jar |

**13 products still use the branded “Product photo coming soon” image:**
Detergent Powder, Black Phenyl, Cleanox Liquid Bleach, Cleanox Fabric Stain
Remover, Cleanox Stove & Grill Cleaner, Dashboard Polish, Tyre Polish, Auto
Cleanser, Chassis Cleaner, Room Freshener and the three Microfiber Mops.

**To replace any image:** save your photo with the *same file name* into
`assets/products/` — e.g. overwrite `assets/products/room-freshener.webp`.
Nothing in the code changes. A different name is fine too; just update the
`image:` line for that product.

Photo tips: square (1:1), product centred, background removed or plain white,
around 900 × 900 px, saved as `.webp` (keep files under ~150 KB). If a file is
ever missing the site falls back to a branded placeholder — a broken-image icon
is never shown.

Unused source photos (spare angles and variants) stay in `assets/productImages/`.

### The hero image

`assets/brand/hero-products.webp` is one combined cut-out of six products —
Liquid Detergent, Hand Wash, Floor Cleaner, Dishwash, Glass Cleaner and All
Purpose Cleaner — 1588 × 820, transparent, cropped tight against the bottles.
**To change the hero, replace that one file.** Keep it a transparent, tightly
cropped cut-out: the home page stretches it across the full hero band, so any
empty space around the edges pushes the products off-centre. The same file is
used again in the About section, and `assets/brand/og-cover.jpg` (the
social-share picture) is exported from it — regenerate that too when you swap
the hero.

---

## 3. WhatsApp buttons — where they are

WhatsApp appears in exactly three places, on purpose:

1. **Cart** → *Send Order on WhatsApp* (becomes *Request Order & Bulk Quote*
   when the cart has 20 L / 30 kg / 50 L packs or unpriced items).
2. **Bulk section** (both pages) → *Request a Bulk Quote*.
3. **Contact form** → *Send enquiry* opens WhatsApp with the message prepared.

Everything else is an ordinary button: *Shop Products* in the header, *Explore
Products* and *Download Brochure* in the hero, and Home / Products / Cart in the
mobile bottom bar.

---

## 4. Brochure download

The hero’s **Download Brochure** button serves
`assets/brochure/cleaniac-brochure.pdf`. Replace that file to publish a new
brochure — the link never changes.

---

## 5. What the site does

* Home page hero: the product photo sits behind the hero text as a faded
  background layer that fades in on load — there is no framed picture in its own
  column any more, and no white card behind it. Logo, headline and buttons are
  centred over it.
* Catalogue rendered from `products.js` — swipeable rows per category, arrows on
  desktop, slow auto-movement that pauses on hover, focus, touch, when the tab is
  hidden, or when the visitor prefers reduced motion.
* Instant search (name, category, description, fragrance, pack size, “bulk”) and
  category filter chips. Category links carry a filter: `products.html?cat=laundry`.
* Product details open in a dialog — never a separate page. Fragrance and pack
  size are chosen there and the price follows the selected size. On phones it
  floats as a sheet with a 10 px gap on the left, right and bottom, rounded on
  all four corners, 86% of the screen height; from 768 px up it is a centred
  two-column dialog. It closes itself if the visitor clicks any other link or
  in-page anchor, or returns to the page with Back/Forward — it never stays
  hanging over the page.
* **Add to Cart on a card adds immediately** (first fragrance, smallest pack) and
  the toast says exactly which variant went in. *View Details* is for choosing.
* Cart stored in `localStorage`, so it survives a refresh. Each
  **product + fragrance + size** combination is its own cart line.
* Subtotal counts only known prices; quote-only items are listed separately. If
  every item in the cart is quote-only the subtotal reads *On enquiry* instead of
  ₹0, and the WhatsApp message leaves the subtotal line out altogether.
* **Clear cart** asks for confirmation inside the drawer itself — *Cancel* or
  *Yes, clear* — not with a browser pop-up.
* Checkout builds one formatted WhatsApp message from the cart.
* Share button (Web Share API with copy-link fallback) and deep links —
  `products.html#floor-cleaner` opens that product’s dialog.
* “Recently viewed” row appears only after a visitor has opened products.
* Light / dark theme toggle in the header; follows the device setting until the
  visitor chooses, then remembers it.
* The phone menu is just the six nav links (Home, Products, About Us, Bulk
  Orders, FAQ, Contact) — the duplicate *Shop Products* button was removed,
  since the bottom bar already has Products.
* Enquiry form with no backend — WhatsApp or the visitor’s email app.

---

## 6. File map

```
index.html                  home page (+ inline SVG icon sprite)
products.html               catalogue page (same header/footer/sprite)
css/style.css               all styling, light & dark themes (section 1 = colours)
js/config.js                ← business details (edit me)
js/products.js              ← catalogue (edit me)
js/app.js                   application logic, runs on both pages
assets/logo/                logo mark, full lockup, favicons
assets/brand/               hero image, social share image
assets/products/            product photos + placeholder images
assets/productImages/       original unedited photos (source material)
assets/brochure/            the PDF served by the Download Brochure button
```

The header, footer and icon sprite exist in both HTML files — if you edit one,
copy the change into the other.

---

## 7. Still to be filled in by Cleaniac

1. **Business hours** — `js/config.js` → `HOURS`.
2. **Google Maps link** — `js/config.js` → `MAPS_URL` (empty hides the link).
3. **The company story** — `index.html`, search for `EDITABLE PLACEHOLDER`.
4. **Privacy Policy / Terms pages** — bottom of the footer in both HTML files.
5. **Canonical + Open Graph URLs** — `<head>` of both pages, replace
   `https://www.cleaniac.in/` if the live address differs.
6. **Photos** for the 13 products listed in section 2 — including the black
   “Brill” bottle photo, which was left out because its product is unclear.

No reviews, ratings, certifications, delivery promises, discounts or product
performance claims have been invented anywhere on the site.
