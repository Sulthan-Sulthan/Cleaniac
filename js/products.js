/* ============================================================================
   CLEANIAC — PRODUCT CATALOGUE
   ----------------------------------------------------------------------------
   HOW TO EDIT (no coding experience needed):

   • Change a price ............ edit the number after "price:"   e.g. price: 99
   • Price not decided yet ..... write  price: null   ->  shows "Contact for price"
                                 NEVER write 0.
   • Add a pack size ........... copy a line inside "sizes" and edit it
   • Add a fragrance ........... add a "Name" inside the flavours [ ... ] list
   • Add a product ............. copy one whole { ... } block, paste it before
                                 the closing ]; and give it a NEW unique id
   • Add a real photo .......... put the picture in  assets/products/
                                 then set  image: "assets/products/your-file.webp"
                                 Leave  image: null  to show the branded
                                 placeholder card (never a broken image).

   Every "id" must be unique — it is also the share link (…/#floor-cleaner).
   ========================================================================== */

/* Category names used across the site. Rename here and everywhere updates. */
const CATEGORIES = [
  { id: "floor",      name: "Floor Care",              icon: "floor"  },
  { id: "kitchen",    name: "Kitchen Care",            icon: "kitchen"},
  { id: "bathroom",   name: "Bathroom & Surface Care", icon: "bath"   },
  { id: "laundry",    name: "Laundry Care",            icon: "laundry"},
  { id: "hygiene",    name: "Hand & Personal Hygiene", icon: "hand"   },
  { id: "air",        name: "Air Care",                icon: "air"    },
  { id: "auto",       name: "Automobile Care",         icon: "auto"   },
  { id: "accessories",name: "Cleaning Accessories",    icon: "mop"    }
];

const PRODUCTS = [
  {
    id: "floor-cleaner",
    name: "Floor Cleaner",
    category: ["floor"],
    short: "For everyday floor and tile cleaning",
    description: "Used for cleaning floors and tiles. Available in five fragrance options and in household as well as larger commercial pack sizes.",
    image: "assets/products/floor-cleaner.webp",   // ← replace with your own photo anytime
    flavourLabel: "Fragrance",
    flavours: ["Oudh", "Botanical Mist", "Citrus Lemon", "Aromatic Musk", "Lemongrass"],
    sizes: [
      { label: "500 ml", price: 99 },
      { label: "5 L",    price: null },
      { label: "20 L",   price: null },
      { label: "50 L",   price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "dishwash",
    name: "Dishwash",
    category: ["kitchen"],
    short: "For utensils and everyday kitchen washing",
    description: "Used for cleaning utensils and everyday kitchen washing. Available from compact household bottles up to large commercial packs.",
    image: "assets/products/dishwash.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "250 ml", price: 45 },
      { label: "500 ml", price: 99 },
      { label: "5 L",    price: 599 },
      { label: "20 L",   price: null },
      { label: "50 L",   price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "toilet-cleaner",
    name: "Toilet Cleaner",
    category: ["bathroom"],
    short: "For toilet bowls and bathroom sanitation",
    description: "For cleaning toilet bowls and bathroom sanitation. Available as Original and Lemon variants.",
    image: "assets/products/toilet-cleaner.webp",
    flavourLabel: "Variant",
    flavours: ["Original Toilet Cleaner", "Lemon Toilet Cleaner"],
    sizes: [
      { label: "500 ml", price: 99 },
      { label: "5 L",    price: null },
      { label: "20 L",   price: null },
      { label: "50 L",   price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "glass-cleaner",
    name: "Glass Cleaner",
    category: ["bathroom"],
    short: "For glass, mirrors and smooth surfaces",
    description: "For cleaning glass, mirrors and suitable smooth surfaces.",
    image: "assets/products/glass-cleaner.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "500 ml", price: 99 }
    ],
    bulkAvailable: false
  },
  {
    id: "hand-wash",
    name: "Hand Wash",
    category: ["hygiene"],
    short: "Liquid hand wash in four fragrances",
    description: "Liquid hand wash available in four fragrance options, in household bottles and larger refill packs.",
    image: "assets/products/hand-wash.webp",
    flavourLabel: "Fragrance",
    flavours: ["Aqua Fresh", "Litchi", "Orange", "Amber Blossom"],
    sizes: [
      { label: "250 ml", price: 79 },
      { label: "1 L",    price: 199 },
      { label: "5 L",    price: null },
      { label: "20 L",   price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "detergent-powder",
    name: "Detergent Powder",
    category: ["laundry"],
    short: "Laundry detergent powder for clothes",
    description: "Laundry detergent powder for washing clothes. Available in household packs and a 30 kg bulk pack.",
    image: "assets/products/detergent-powder.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "1 kg",  price: 60 },
      { label: "2 kg",  price: 99 },
      { label: "3 kg",  price: 199 },
      { label: "30 kg", price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "fabric-conditioner",
    name: "Fabric Conditioner",
    category: ["laundry"],
    short: "Softens clothes and adds a fresh scent",
    description: "Used for softening clothes and providing a fresh scent after washing.",
    image: "assets/products/fabric-conditioner.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "500 ml", price: 149 },
      { label: "5 L",    price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "liquid-detergent",
    name: "Liquid Detergent",
    category: ["laundry"],
    short: "Liquid laundry detergent for clothes",
    description: "Liquid laundry detergent for washing clothes, in household and larger 5 L packs.",
    image: "assets/products/liquid-detergent.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "1 L", price: 125 },
      { label: "5 L", price: 599 }
    ],
    bulkAvailable: true
  },
  {
    id: "phenyl",
    name: "Phenyl",
    category: ["floor"],
    short: "General floor and surface cleaning",
    description: "General floor and surface cleaning solution, available in five fragrance options and in large commercial pack sizes.",
    image: "assets/products/phenyl.webp",
    flavourLabel: "Fragrance",
    flavours: ["Lemongrass", "Jasmine", "Sandal", "Lavender", "Citrus Lemon"],
    sizes: [
      { label: "1 L",  price: 99 },
      { label: "5 L",  price: 299 },
      { label: "20 L", price: null },
      { label: "50 L", price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "black-phenyl",
    name: "Black Phenyl",
    category: ["floor"],
    short: "Black phenyl for general cleaning",
    description: "Black phenyl for general floor and surface cleaning requirements.",
    image: "assets/products/black-phenyl.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "500 ml", price: 75 }
    ],
    bulkAvailable: false
  },
  {
    id: "drain-cleaner",
    name: "Drain Cleaner",
    category: ["bathroom"],
    short: "For drain-cleaning applications",
    description: "For drain-cleaning applications. Supplied as a 150 g pack.",
    image: "assets/products/drain-cleaner.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "150 g", price: 75 }
    ],
    bulkAvailable: false
  },
  {
    id: "cleanox-liquid-bleach",
    name: "Cleanox Liquid Bleach",
    category: ["bathroom"],
    short: "Liquid bleach for cleaning applications",
    description: "Liquid bleach for suitable cleaning applications. Also available in bulk quantities on enquiry.",
    image: "assets/products/cleanox-liquid-bleach.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "500 ml", price: 99 }
    ],
    bulkAvailable: true
  },
  {
    id: "cleanox-fabric-stain-remover",
    name: "Cleanox Fabric Stain Remover",
    category: ["laundry"],
    short: "For treating suitable fabric stains",
    description: "For treating suitable fabric stains before or during washing.",
    image: "assets/products/cleanox-fabric-stain-remover.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "500 ml", price: 99 }
    ],
    bulkAvailable: false
  },
  {
    id: "cleanox-stove-grill-cleaner",
    name: "Cleanox Stove & Grill Cleaner",
    category: ["kitchen"],
    short: "For stove and grill surfaces",
    description: "For cleaning suitable stove and grill surfaces in kitchens.",
    image: "assets/products/cleanox-stove-grill-cleaner.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "500 ml", price: 149 }
    ],
    bulkAvailable: false
  },
  {
    id: "all-purpose-cleaner",
    name: "All Purpose Cleaner",
    category: ["bathroom", "kitchen"],
    short: "Multipurpose cleaning for many surfaces",
    description: "Multipurpose cleaning solution for suitable household and commercial surfaces.",
    image: "assets/products/all-purpose-cleaner.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "500 ml", price: 149 },
      { label: "1 L",    price: 199 },
      { label: "5 L",    price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "dashboard-polish",
    name: "Dashboard Polish",
    category: ["auto"],
    short: "Automotive dashboard care",
    description: "Automotive dashboard-care product for vehicle interiors.",
    image: "assets/products/dashboard-polish.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "1 L", price: null },
      { label: "5 L", price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "tyre-polish",
    name: "Tyre Polish",
    category: ["auto"],
    short: "Automotive tyre care",
    description: "Automotive tyre-care product.",
    image: "assets/products/tyre-polish.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "1 L", price: null },
      { label: "5 L", price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "auto-cleanser",
    name: "Auto Cleanser",
    category: ["auto"],
    short: "Automotive cleaning solution",
    description: "Automotive cleaning solution supplied in larger pack sizes.",
    image: "assets/products/auto-cleanser.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "5 L",  price: null },
      { label: "20 L", price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "chassis-cleaner",
    name: "Chassis Cleaner",
    category: ["auto"],
    short: "Automotive chassis cleaning",
    description: "Automotive chassis-cleaning solution supplied in larger pack sizes.",
    image: "assets/products/chassis-cleaner.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "5 L",  price: null },
      { label: "20 L", price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "soap-oil",
    name: "Soap Oil",
    category: ["floor", "kitchen"],
    short: "Soap oil in household and bulk packs",
    description: "Soap oil available from 1 L household packs up to 50 L commercial quantities.",
    image: "assets/products/soap-oil.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "1 L",  price: 99 },
      { label: "5 L",  price: 299 },
      { label: "20 L", price: null },
      { label: "50 L", price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "room-freshener",
    name: "Room Freshener",
    category: ["air"],
    short: "Room freshener in two fragrances",
    description: "Room freshener available in two fragrance options, in household bottles and larger refill packs.",
    image: "assets/products/room-freshener.webp",
    flavourLabel: "Fragrance",
    flavours: ["Musky Magic", "Floral Essence"],
    sizes: [
      { label: "250 ml", price: 129 },
      { label: "5 L",    price: null }
    ],
    bulkAvailable: true
  },
  {
    id: "microfiber-mop-250",
    name: "Microfiber Mop — 250 g",
    category: ["accessories"],
    short: "Microfiber mop for floor cleaning",
    description: "Microfiber mop for everyday floor cleaning. 250 g variant.",
    image: "assets/products/microfiber-mop-250.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "250 g", price: 499 }
    ],
    bulkAvailable: false
  },
  {
    id: "microfiber-mop-premium",
    name: "Microfiber Mop Premium",
    category: ["accessories"],
    short: "Premium microfiber mop",
    description: "Premium microfiber mop for floor cleaning. 200 g variant.",
    image: "assets/products/microfiber-mop-premium.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "200 g", price: null }
    ],
    bulkAvailable: false
  },
  {
    id: "microfiber-mop-economy",
    name: "Microfiber Mop Economy",
    category: ["accessories"],
    short: "Economy microfiber mop",
    description: "Economy microfiber mop for floor cleaning. 200 g variant.",
    image: "assets/products/microfiber-mop-economy.webp",
    flavourLabel: "Fragrance",
    flavours: [],
    sizes: [
      { label: "200 g", price: 399 }
    ],
    bulkAvailable: false
  }
];
