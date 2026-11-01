/* ==========================================================================
   HOUSE OF GINA — Demo catalogue + dashboard data
   All imagery is served from Unsplash. Prices are in USD.
   ========================================================================== */

const IMG = (id, w = 700) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const CATEGORY_LABELS = {
  women: "Women",
  men: "Men",
  accessories: "Accessories",
  bags: "Bags",
  shoes: "Shoes"
};

const PRODUCTS = [
  {
    id: "w1", name: "Satin Wrap Midi Dress", category: "women",
    price: 62, compareAt: 89, rating: 4.8, reviews: 214, tags: ["best", "top"],
    image: IMG("1594633312681-425c7b97ccd1"), stock: 18,
    colors: [{ name: "Violet", hex: "#7C3AED" }, { name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "A fluid satin wrap dress with a flattering V-neck and tie waist. Cut for movement, made for golden hour."
  },
  {
    id: "w2", name: "Oversized Linen Blazer", category: "women",
    price: 96, compareAt: 129, rating: 4.7, reviews: 168, tags: ["best"],
    image: IMG("1591047139829-d91aecb6caea"), stock: 24,
    colors: [{ name: "Beige", hex: "#D8C3A5" }, { name: "White", hex: "#F8F5EF" }, { name: "Black", hex: "#1F2937" }],
    sizes: ["S", "M", "L", "XL"],
    description: "Relaxed shoulders, a longline cut and breathable linen blend. The blazer that makes every outfit feel considered."
  },
  {
    id: "w3", name: "Ribbed Knit Co-ord Set", category: "women",
    price: 59, compareAt: 74, rating: 4.6, reviews: 92, tags: ["new"],
    image: IMG("1434389677669-e08b4cac3105"), stock: 31,
    colors: [{ name: "Pink", hex: "#EC4899" }, { name: "Beige", hex: "#D8C3A5" }, { name: "Black", hex: "#1F2937" }],
    sizes: ["XS", "S", "M", "L"],
    description: "Buttery-soft ribbed knit in a matching top and wide-leg trouser. Loungewear that’s ready for the street."
  },
  {
    id: "w4", name: "Pleated Midi Skirt", category: "women",
    price: 44, compareAt: 58, rating: 4.5, reviews: 76, tags: ["new"],
    image: IMG("1485968579580-b6d095142e6e"), stock: 22,
    colors: [{ name: "Violet", hex: "#7C3AED" }, { name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Knife pleats with a fluid drape and elasticated waist. Pair with a tee by day, a corset by night."
  },
  {
    id: "w5", name: "Cropped Denim Jacket", category: "women",
    price: 67, compareAt: 84, rating: 4.7, reviews: 143, tags: ["best"],
    image: IMG("1551028719-00167b16eac5"), stock: 16,
    colors: [{ name: "Black", hex: "#1F2937" }, { name: "White", hex: "#F8F5EF" }],
    sizes: ["S", "M", "L"],
    description: "A boxy, cropped take on the classic trucker jacket. Rigid denim that softens beautifully with wear."
  },
  {
    id: "w6", name: "Sunset Slip Dress", category: "women",
    price: 47, compareAt: 68, rating: 4.9, reviews: 301, tags: ["top", "best"],
    image: IMG("1566174053879-31528523f8ae"), stock: 9,
    colors: [{ name: "Pink", hex: "#EC4899" }, { name: "Yellow", hex: "#FACC15" }, { name: "Black", hex: "#1F2937" }],
    sizes: ["XS", "S", "M", "L"],
    description: "Bias-cut satin with delicate straps and a low back. Our most-photographed dress of the season."
  },
  {
    id: "m1", name: "Relaxed Cuban Shirt", category: "men",
    price: 43, compareAt: 54, rating: 4.6, reviews: 118, tags: ["new"],
    image: IMG("1620799140408-edc6dcb6d633"), stock: 34,
    colors: [{ name: "White", hex: "#F8F5EF" }, { name: "Beige", hex: "#D8C3A5" }, { name: "Black", hex: "#1F2937" }],
    sizes: ["S", "M", "L", "XL"],
    description: "A breathable camp-collar shirt with a boxy fit. Wear it buttoned, open or tied at the waist."
  },
  {
    id: "m2", name: "Tailored Wide-Leg Trousers", category: "men",
    price: 63, compareAt: 79, rating: 4.7, reviews: 84, tags: ["best"],
    image: IMG("1473966968600-fa801b869a1a"), stock: 19,
    colors: [{ name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }],
    sizes: ["S", "M", "L", "XL"],
    description: "Clean lines and an easy drape, finished with a hidden hook closure. Smart enough for work, soft enough for weekends."
  },
  {
    id: "m3", name: "Premium Cotton Tee", category: "men",
    price: 24, compareAt: 32, rating: 4.8, reviews: 402, tags: ["best", "top"],
    image: IMG("1521572163474-6864f9cf17ab"), stock: 58,
    colors: [{ name: "White", hex: "#F8F5EF" }, { name: "Black", hex: "#1F2937" }, { name: "Violet", hex: "#7C3AED" }],
    sizes: ["S", "M", "L", "XL"],
    description: "Heavyweight 240gsm cotton with a slightly boxy shoulder. The everyday tee, upgraded."
  },
  {
    id: "m4", name: "Utility Overshirt", category: "men",
    price: 69, compareAt: 92, rating: 4.5, reviews: 61, tags: ["new"],
    image: IMG("1618354691373-d851c5c3a990"), stock: 12,
    colors: [{ name: "Beige", hex: "#D8C3A5" }, { name: "Black", hex: "#1F2937" }],
    sizes: ["M", "L", "XL"],
    description: "A shirt-jacket hybrid with oversized pockets and a brushed finish. Layer it over everything."
  },
  {
    id: "m5", name: "Knit Polo", category: "men",
    price: 49, compareAt: 62, rating: 4.4, reviews: 57, tags: [],
    image: IMG("1583743814966-8936f5b7be1a"), stock: 27,
    colors: [{ name: "Beige", hex: "#D8C3A5" }, { name: "Black", hex: "#1F2937" }, { name: "White", hex: "#F8F5EF" }],
    sizes: ["S", "M", "L", "XL"],
    description: "A fine-gauge knit polo with a soft collar and mother-of-pearl buttons. Quiet luxury, everyday edition."
  },
  {
    id: "m6", name: "Relaxed Hoodie", category: "men",
    price: 52, compareAt: 68, rating: 4.6, reviews: 132, tags: ["best"],
    image: IMG("1556821840-3a63f95609a7"), stock: 21,
    colors: [{ name: "Violet", hex: "#7C3AED" }, { name: "Black", hex: "#1F2937" }, { name: "White", hex: "#F8F5EF" }],
    sizes: ["S", "M", "L", "XL"],
    description: "Garment-dyed fleece with dropped shoulders and a double-layer hood. Broken-in from day one."
  },
  {
    id: "a1", name: "Retro Oval Sunglasses", category: "accessories",
    price: 27, compareAt: 38, rating: 4.9, reviews: 512, tags: ["top", "best"],
    image: IMG("1511499767150-a48a237f0083"), stock: 40,
    colors: [{ name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }],
    sizes: ["One Size"],
    description: "Slim oval frames with tinted UV400 lenses. Instantly adds main-character energy to any look."
  },
  {
    id: "a2", name: "Gold Layer Necklace", category: "accessories",
    price: 34, compareAt: 45, rating: 4.8, reviews: 289, tags: ["best"],
    image: IMG("1599643478518-a784e5dc4c8f"), stock: 33,
    colors: [{ name: "Yellow", hex: "#FACC15" }, { name: "White", hex: "#F8F5EF" }],
    sizes: ["One Size"],
    description: "A triple-strand chain in 18k gold vermeil. Designed to sit at the collarbone and catch the light."
  },
  {
    id: "a3", name: "Leather Strap Watch", category: "accessories",
    price: 89, compareAt: 119, rating: 4.7, reviews: 176, tags: ["top"],
    image: IMG("1523170335258-f5ed11844a49"), stock: 14,
    colors: [{ name: "Beige", hex: "#D8C3A5" }, { name: "Black", hex: "#1F2937" }],
    sizes: ["One Size"],
    description: "A minimal dial on a supple Italian leather strap. Japanese quartz movement, two-year warranty."
  },
  {
    id: "a4", name: "Silk Twill Scarf", category: "accessories",
    price: 31, compareAt: 42, rating: 4.6, reviews: 64, tags: ["new"],
    image: IMG("1601924994987-69e26d50dc26"), stock: 25,
    colors: [{ name: "Pink", hex: "#EC4899" }, { name: "Violet", hex: "#7C3AED" }, { name: "Yellow", hex: "#FACC15" }],
    sizes: ["One Size"],
    description: "Hand-rolled silk twill in our seasonal print. Wear it at the neck, on your bag or in your hair."
  },
  {
    id: "a5", name: "Angular Frame Sunglasses", category: "accessories",
    price: 33, compareAt: 46, rating: 4.5, reviews: 88, tags: ["new"],
    image: IMG("1572635196237-14b3f281503f"), stock: 29,
    colors: [{ name: "Black", hex: "#1F2937" }, { name: "White", hex: "#F8F5EF" }],
    sizes: ["One Size"],
    description: "Sharp geometric frames with a lightweight acetate build. A little futuristic, a lot wearable."
  },
  {
    id: "b1", name: "Mini Crescent Shoulder Bag", category: "bags",
    price: 72, compareAt: 96, rating: 4.8, reviews: 233, tags: ["best", "top"],
    image: IMG("1584917865442-de89df76afd3"), stock: 11,
    colors: [{ name: "Violet", hex: "#7C3AED" }, { name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }],
    sizes: ["One Size"],
    description: "A sculptural crescent silhouette in vegan leather. Fits your phone, cardholder and lipstick — nothing more needed."
  },
  {
    id: "b2", name: "Woven Market Tote", category: "bags",
    price: 51, compareAt: 68, rating: 4.6, reviews: 98, tags: ["new"],
    image: IMG("1590874103328-eac38a683ce7"), stock: 17,
    colors: [{ name: "Beige", hex: "#D8C3A5" }, { name: "White", hex: "#F8F5EF" }],
    sizes: ["One Size"],
    description: "Hand-woven raffia with leather-trim handles. Roomy enough for market days and weekend escapes."
  },
  {
    id: "b3", name: "Structured Top-Handle Bag", category: "bags",
    price: 99, compareAt: 142, rating: 4.9, reviews: 187, tags: ["top"],
    image: IMG("1548036328-c9fa89d128fa"), stock: 7,
    colors: [{ name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }, { name: "Pink", hex: "#EC4899" }],
    sizes: ["One Size"],
    description: "A polished top-handle bag with gold hardware and a detachable crossbody strap. Boardroom to dinner, effortlessly."
  },
  {
    id: "b4", name: "Nylon Crossbody", category: "bags",
    price: 39, compareAt: 54, rating: 4.5, reviews: 121, tags: ["best"],
    image: IMG("1553062407-98eeb64c6a62"), stock: 36,
    colors: [{ name: "Black", hex: "#1F2937" }, { name: "Violet", hex: "#7C3AED" }],
    sizes: ["One Size"],
    description: "Lightweight recycled nylon with an adjustable webbing strap. The hands-free bag you’ll reach for daily."
  },
  {
    id: "s1", name: "Retro Court Sneakers", category: "shoes",
    price: 74, compareAt: 98, rating: 4.8, reviews: 324, tags: ["best", "top"],
    image: IMG("1549298916-b41d501d3772"), stock: 23,
    colors: [{ name: "White", hex: "#F8F5EF" }, { name: "Beige", hex: "#D8C3A5" }],
    sizes: ["37", "38", "39", "40", "41", "42"],
    description: "Low-profile court sneakers in soft leather with a cushioned footbed. Goes with denim, tailoring and everything between."
  },
  {
    id: "s2", name: "Strappy Heel Sandals", category: "shoes",
    price: 64, compareAt: 86, rating: 4.6, reviews: 142, tags: ["new"],
    image: IMG("1543163521-1bf539c55dd2"), stock: 15,
    colors: [{ name: "Pink", hex: "#EC4899" }, { name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }],
    sizes: ["36", "37", "38", "39", "40", "41"],
    description: "Barely-there straps on a sculpted 75mm heel. Designed to stay comfortable past midnight."
  },
  {
    id: "s3", name: "Chunky Loafers", category: "shoes",
    price: 84, compareAt: 112, rating: 4.7, reviews: 96, tags: ["best"],
    image: IMG("1560769629-975ec94e6a86"), stock: 13,
    colors: [{ name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }],
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    description: "A chunky lug sole with a classic penny-loafer upper. The shortcut to looking put-together."
  },
  {
    id: "s4", name: "Minimal Runner", category: "shoes",
    price: 87, compareAt: 124, rating: 4.9, reviews: 268, tags: ["top"],
    image: IMG("1542291026-7eec264c27ff"), stock: 20,
    colors: [{ name: "Pink", hex: "#EC4899" }, { name: "White", hex: "#F8F5EF" }, { name: "Black", hex: "#1F2937" }],
    sizes: ["37", "38", "39", "40", "41", "42"],
    description: "Engineered mesh and a featherlight foam sole. Built for city miles and everything after."
  },
  {
    id: "s5", name: "Everyday Ballet Flats", category: "shoes",
    price: 58, compareAt: 72, rating: 4.4, reviews: 54, tags: ["new"],
    image: IMG("1515347619252-60a4bf4fff4f"), stock: 18,
    colors: [{ name: "Black", hex: "#1F2937" }, { name: "Beige", hex: "#D8C3A5" }, { name: "Pink", hex: "#EC4899" }],
    sizes: ["36", "37", "38", "39", "40", "41"],
    description: "Soft square-toe ballet flats with a flexible sole. The polished alternative to your everyday sneaker."
  },
  {
    id: "s6", name: "Cloud Runner", category: "shoes",
    price: 83, compareAt: 118, rating: 4.6, reviews: 77, tags: ["new"],
    image: IMG("1608231387042-66d1773070a5"), stock: 26,
    colors: [{ name: "White", hex: "#F8F5EF" }, { name: "Violet", hex: "#7C3AED" }],
    sizes: ["38", "39", "40", "41", "42"],
    description: "A pillowy everyday runner with a breathable knit upper. All-day comfort, zero compromise on style."
  }
];

/* -------------------------------------------------------------------------- */
/* Hero slides                                                                */
/* -------------------------------------------------------------------------- */
const HERO_SLIDES = [
  {
    eyebrow: "New Season · SS26 Drop",
    title: "Refresh Your Fashion Vibe",
    desc: "Bold silhouettes, sunny hues and everyday essentials — curated for the woman who writes her own rules.",
    image: IMG("1539109136881-3be0616acf4b", 1100),
    badge: "Off",
    miniId: "w1",
    miniName: "Satin Wrap Midi Dress",
    miniPrice: "$62",
    miniCompare: "$89",
    miniImage: IMG("1594633312681-425c7b97ccd1", 180)
  },
  {
    eyebrow: "The Statement Edit",
    title: "Color Outside the Lines",
    desc: "Saturated separates, sculptural shapes and pieces that start conversations. This is fashion with a pulse.",
    image: IMG("1529139574466-a303027c1d8b", 1100),
    badge: "New",
    miniId: "w2",
    miniName: "Oversized Linen Blazer",
    miniPrice: "$96",
    miniCompare: "$129",
    miniImage: IMG("1591047139829-d91aecb6caea", 180)
  },
  {
    eyebrow: "Accessories That Speak",
    title: "Details Make the Look",
    desc: "The finishing touch is never an afterthought. Meet the bags, shades and gold-toned layers doing the most.",
    image: IMG("1483985988355-763728e1935b", 1100),
    badge: "From $27",
    miniId: "a1",
    miniName: "Retro Oval Sunglasses",
    miniPrice: "$27",
    miniCompare: "$38",
    miniImage: IMG("1511499767150-a48a237f0083", 180)
  }
];

/* -------------------------------------------------------------------------- */
/* Admin: orders                                                              */
/* -------------------------------------------------------------------------- */
const ORDERS = [
  { id: "HG-10482", customer: "Amina Nakato", email: "amina.n@example.com", date: "Oct 31, 2026", items: 2, total: 124, status: "Processing" },
  { id: "HG-10481", customer: "Daniel Okello", email: "d.okello@example.com", date: "Oct 31, 2026", items: 1, total: 62, status: "Shipped" },
  { id: "HG-10480", customer: "Sarah Kirabo", email: "s.kirabo@example.com", date: "Oct 30, 2026", items: 3, total: 189, status: "Delivered" },
  { id: "HG-10479", customer: "Brian Ssemakula", email: "brian.s@example.com", date: "Oct 30, 2026", items: 1, total: 89, status: "Paid" },
  { id: "HG-10478", customer: "Grace Atim", email: "grace.atim@example.com", date: "Oct 29, 2026", items: 2, total: 96, status: "Processing" },
  { id: "HG-10477", customer: "Peter Mwangi", email: "p.mwangi@example.com", date: "Oct 29, 2026", items: 1, total: 47, status: "Refunded" },
  { id: "HG-10476", customer: "Esther Nansubuga", email: "esther.n@example.com", date: "Oct 28, 2026", items: 4, total: 215, status: "Delivered" },
  { id: "HG-10475", customer: "Kevin Otim", email: "k.otim@example.com", date: "Oct 28, 2026", items: 2, total: 118, status: "Shipped" },
  { id: "HG-10474", customer: "Faith Adong", email: "faith.a@example.com", date: "Oct 27, 2026", items: 1, total: 33, status: "Paid" },
  { id: "HG-10473", customer: "Michael Kato", email: "m.kato@example.com", date: "Oct 27, 2026", items: 3, total: 156, status: "Delivered" }
];

/* -------------------------------------------------------------------------- */
/* Admin: revenue chart                                                       */
/* -------------------------------------------------------------------------- */
const REVENUE_DATA = {
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [8.2, 11.4, 9.8, 14.6, 12.2, 18.4, 16.1],
    delta: "+14.2%"
  },
  "30d": {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
    values: [42, 55, 48, 66, 59, 74],
    delta: "+9.8%"
  },
  "12m": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [52, 58, 64, 61, 72, 79, 75, 88, 92, 101, 112, 128],
    delta: "+22.6%"
  }
};

const RECENT_ACTIVITY = [
  { type: "order", title: "New order #HG-10482", meta: "Amina Nakato · $124.00", time: "2 min ago", color: "violet" },
  { type: "user", title: "New customer registered", meta: "sarah.k@example.com", time: "18 min ago", color: "pink" },
  { type: "stock", title: "Low stock: Sunset Slip Dress", meta: "9 units remaining", time: "46 min ago", color: "amber" },
  { type: "payout", title: "Payout completed", meta: "$2,840.00 to Stanbic Bank", time: "2 hrs ago", color: "emerald" },
  { type: "order", title: "Order #HG-10480 delivered", meta: "Sarah Kirabo · $189.00", time: "4 hrs ago", color: "violet" }
];

/* -------------------------------------------------------------------------- */
/* CMS defaults                                                               */
/* -------------------------------------------------------------------------- */
const CMS_DEFAULTS = {
  announcement: "Free Shipping on Orders Over $50 | Easy 30-Day Returns",
  eyebrow: "New Season · SS26 Drop",
  headline: "Refresh Your Fashion Vibe",
  subcopy: "Bold silhouettes, sunny hues and everyday essentials — curated for the woman who writes her own rules.",
  cta: "Shop Now"
};

const SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 6.95;

const ADMIN_DEMO = {
  email: "admin@houseofgina.com",
  password: "gina2026"
};
