const fs = require("node:fs");
const path = require("node:path");

const icons = {
  menu: "menu",
  close: "x",
  search: "search",
  heart: "heart",
  bag: "shopping-bag",
  user: "user-round",
  "arrow-right": "arrow-right",
  "arrow-left": "arrow-left",
  "arrow-up": "arrow-up",
  "chevron-down": "chevron-down",
  "chevron-right": "chevron-right",
  "chevron-left": "chevron-left",
  star: "star",
  truck: "truck",
  shield: "shield-check",
  headset: "headset",
  refresh: "refresh-cw",
  whatsapp: "message-circle",
  phone: "phone",
  mail: "mail",
  pin: "map-pin",
  instagram: "camera",
  facebook: "users-round",
  tiktok: "music",
  x: "x",
  plus: "plus",
  minus: "minus",
  trash: "trash-2",
  eye: "eye",
  filter: "list-filter",
  check: "check",
  "check-circle": "circle-check",
  sparkles: "sparkles",
  sunglasses: "glasses",
  shoe: "footprints",
  tag: "tag",
  trend: "trending-up",
  users: "users",
  dollar: "dollar-sign",
  chart: "chart-no-axes-column-increasing",
  logout: "log-out",
  settings: "settings",
  database: "database",
  cloud: "cloud",
  lock: "lock",
  edit: "pen-line",
  external: "external-link",
  calendar: "calendar-days",
  bell: "bell",
  play: "circle-play",
  card: "credit-card",
  gift: "gift",
  globe: "globe",
  code: "code",
  "alert-circle": "circle-alert",
  clock: "clock-3",
  box: "box",
  download: "download",
  send: "send",
  grid: "grid-2x2",
  list: "list",
};

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const iconsPath = path.join(root, "node_modules", "lucide-static", "icons");
const html = fs.readFileSync(indexPath, "utf8");
const existingIds = [...html.matchAll(/<symbol id="i-([^"]+)"/g)].map((match) => match[1]);
const missingMappings = existingIds.filter((id) => !icons[id]);

if (missingMappings.length) {
  throw new Error(`Missing Lucide mappings for: ${missingMappings.join(", ")}`);
}

const symbols = Object.entries(icons).map(([id, iconName]) => {
  const iconPath = path.join(iconsPath, `${iconName}.svg`);
  if (!fs.existsSync(iconPath)) {
    throw new Error(`Lucide icon not found: ${iconName}`);
  }

  const source = fs.readFileSync(iconPath, "utf8");
  const match = source.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/);
  if (!match) {
    throw new Error(`Invalid Lucide SVG: ${iconName}`);
  }

  const fill = id === "star" ? "currentColor" : "none";
  return `      <symbol id="i-${id}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${match[1].trim()}</symbol>`;
});

const sprite = `  <!-- ============ SVG ICON SPRITE ============ -->\n  <svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">\n    <defs>\n${symbols.join("\n")}\n    </defs>\n  </svg>`;
const updatedHtml = html.replace(
  /  <!-- ============ SVG ICON SPRITE ============ -->[\s\S]*?<\/svg>/,
  sprite,
);

if (updatedHtml === html && !html.includes(sprite)) {
  throw new Error("Unable to find the inline SVG sprite to update.");
}

if (updatedHtml !== html) {
  fs.writeFileSync(indexPath, updatedHtml);
}
