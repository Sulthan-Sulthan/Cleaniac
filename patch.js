const fs = require('fs');

let appJs = fs.readFileSync('js/app.js', 'utf8');
appJs = appJs.replace(
  /const pills = \[\];[\s\S]*?<div class="product-actions">[\s\S]*?<\/div>";/s,
  `card.innerHTML =
      '<button class="product-media" type="button" data-open aria-label="View details for ' + esc(product.name) + '">' +
        mediaHTML(product) +
      '</button>' +
      '<div class="product-body">' +
        '<h3 class="product-name"><button type="button" data-open>' + esc(product.name) + '</button></h3>' +
        '<p class="product-price">' +
          (from != null
            ? '<span class="from">' + (sizeCount > 1 ? "From" : "Price") + '</span>' + money(from)
            : '<span class="enquiry">' + ENQUIRY_TEXT + '</span>') +
        '</p>' +
      '</div>' +
      '<div class="product-actions">' +
        '<button class="btn btn--primary btn--sm btn--block" style="width:100%" type="button" data-quick aria-label="Add ' + esc(product.name) + ' to cart">Add to Cart</button>' +
      '</div>';`
);
fs.writeFileSync('js/app.js', appJs);

let styleCss = fs.readFileSync('css/style.css', 'utf8');
const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');\n`;
if (!styleCss.includes('fonts.googleapis.com')) {
  styleCss = fontImport + styleCss;
}

const overrideCss = `
/* OVERRIDES FOR RECENT DESIGN REQUIREMENTS */
body, button, input, textarea, select { font-family: 'Outfit', sans-serif !important; }
.product-media { aspect-ratio: 4 / 3 !important; }
.product-body { flex-direction: row !important; align-items: flex-end !important; justify-content: space-between !important; gap: 12px !important; }
.product-name { flex: 1; margin-bottom: 2px !important; line-height: 1.25 !important; }
.product-name button { padding: 0 0 2px !important; }
.product-price { margin-top: 0 !important; padding-top: 0 !important; font-size: 1.15rem !important; align-items: center !important; gap: 5px !important; flex-shrink: 0 !important; margin-bottom: 2px !important; display: flex !important; }
.product-price .from { font-weight: 650 !important; font-size: 0.8rem !important; display: inline-block !important; }
.hero { flex-direction: column !important; align-items: center !important; justify-content: flex-start !important; padding-top: clamp(40px, 6vw, 60px) !important; }
.hero-bg { order: 2 !important; position: relative !important; margin-top: clamp(10px, 3vw, 20px) !important; bottom: auto !important; height: auto !important; }
.hero-inner { order: 1 !important; width: 100% !important; }
.hero-inner::before { display: none !important; }
.hero::after { display: none !important; }
.eyebrow { letter-spacing: 0.15em !important; color: var(--pink) !important; }
.row-head h3 { font-size: clamp(1.3rem, 3.5vw, 1.5rem) !important; letter-spacing: -0.01em !important; }
.row-head .row-count { font-size: 0.88rem !important; }
.product-actions .btn { font-size: 0.95rem !important; padding: 10px !important; min-height: 44px !important; }
`;
if (!styleCss.includes('OVERRIDES FOR RECENT DESIGN REQUIREMENTS')) {
  styleCss += overrideCss;
}

fs.writeFileSync('css/style.css', styleCss);
console.log("Patched successfully!");
