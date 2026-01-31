"use strict";

/*
  KAYSXO Price Calculator (Website)
  Synced to your C logic (main (10).c):
  - Wrapping: area (in^2) * cost per square inch, supports inches or cm
  - Floral tape cost: if totalFlowers<=5 => 200 else 200 + (totalFlowers-5)*40
  - Glue stick: 50 each
  - Tissue sheet: 40 each
  - Add-ons from flower table: stamensUsed, pearlsUsed
  - Profit: 30%
  - Final rounding: round UP to nearest 50
*/

// --------- Hook to your EXISTING HTML IDs ---------
const el = {
  totalFlowers: document.getElementById("totalFlowers"),
  wrapTypes: document.getElementById("wrapTypes"),
  ribbonInches: document.getElementById("ribbonInches"),
  glueSticks: document.getElementById("glueSticks"),
  tissueSheets: document.getElementById("tissueSheets"),

  flowerName: document.getElementById("flowerName"),
  flowerQty: document.getElementById("flowerQty"),
  addFlower: document.getElementById("addFlower"),
  flowerList: document.getElementById("flowerList"),

  wrapName: document.getElementById("wrapName"),
  wrapUnit: document.getElementById("wrapUnit"),     // "in" or "cm"
  wrapLength: document.getElementById("wrapLength"),
  wrapWidth: document.getElementById("wrapWidth"),
  addWrap: document.getElementById("addWrap"),
  wrapList: document.getElementById("wrapList"),

  calculate: document.getElementById("calculate"),
  reset: document.getElementById("reset"),
  output: document.getElementById("output"),
};

// Safety check: crash early if IDs are missing
for (const k in el) {
  if (!el[k]) throw new Error(`Missing HTML element for id="${k}"`);
}

// ------------ CONSTANT PRICES (match C) ------------
const onePipeCleanerPrice = 9.50;
const oneInchRibbon = 5.00;
const oneGlueStick = 50.00;
const payPerHour = 200.00;

const oneStamenPrice = 3.00;
const onePearlPrice = 2.00;
const oneTissueSheetPrice = 40.00;
const flowerBase = 100.00;

// NOTE: In your C you used INCH2_TO_CM2 = 0.155 to convert cm^2 -> in^2
const INCH2_TO_CM2 = 0.155;

// ------------ FLOWER TABLE (copied from C) ------------
const flowerTable = [
  { name: "ladyRose", pipePerFlower: 24.00, minutesPerFlower: 70.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "gerbera", pipePerFlower: 10.00, minutesPerFlower: 45.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "flatGerbera", pipePerFlower: 10.00, minutesPerFlower: 45.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "sunflower*", pipePerFlower: 25.33, minutesPerFlower: 40.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "spiralFiller", pipePerFlower: 1.00, minutesPerFlower: 5.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "spiralRose", pipePerFlower: 11.00, minutesPerFlower: 30.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "spiralRoseWithGradient", pipePerFlower: 10.25, minutesPerFlower: 40.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "spiralRose1", pipePerFlower: 11.00, minutesPerFlower: 30.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "spiralRose2", pipePerFlower: 10.25, minutesPerFlower: 40.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "babyBreath", pipePerFlower: 7.00, minutesPerFlower: 50.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "daisyPipeMiddle*", pipePerFlower: 3.00, minutesPerFlower: 10.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "daisyPipeMiddleWithGradient*", pipePerFlower: 3.00, minutesPerFlower: 10.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "daisyPipe1", pipePerFlower: 3.00, minutesPerFlower: 10.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "daisyPipe2", pipePerFlower: 3.00, minutesPerFlower: 10.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "daisyWithPearl,", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "daisyWithPearlAndGradient,", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "daisyPearl1,", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "daisyPearl2,", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "daisyWithPipeMiddleAndStamen,", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "daisyWithPipeMiddleStamenAndGradient,", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "daisyPipeStamen1,", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "daisyPipeStamen2,", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "miniDaisyWithPipeMiddleBunch", pipePerFlower: 4.50, minutesPerFlower: 26.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "miniDaisyWithPipeMiddleAndGradientBunch", pipePerFlower: 3.00, minutesPerFlower: 26.0, stamensUsed: 0, pearlsUsed: 3 },
  { name: "miniDaisyPipeBunch1", pipePerFlower: 4.50, minutesPerFlower: 26.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "miniDaisyPipeBunch2", pipePerFlower: 3.00, minutesPerFlower: 26.0, stamensUsed: 0, pearlsUsed: 3 },
  { name: "miniDaisyPipeMiddle", pipePerFlower: 2.00, minutesPerFlower: 10.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "miniDaisyPipeMiddleWithGradient", pipePerFlower: 2.00, minutesPerFlower: 10.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "miniDaisyPipe1", pipePerFlower: 2.00, minutesPerFlower: 10.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "miniDaisyPipe2", pipePerFlower: 2.00, minutesPerFlower: 10.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "miniDaisyBunchWithPearlMiddle", pipePerFlower: 4.50, minutesPerFlower: 26.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "miniDaisyBunchWithPearlMiddleAndGradient", pipePerFlower: 3.00, minutesPerFlower: 26.0, stamensUsed: 0, pearlsUsed: 3 },
  { name: "miniDaisyPearlBunch1", pipePerFlower: 4.50, minutesPerFlower: 26.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "miniDaisyPearlBunch2", pipePerFlower: 3.00, minutesPerFlower: 26.0, stamensUsed: 0, pearlsUsed: 3 },
  { name: "miniDaisyWithPearl", pipePerFlower: 1.00, minutesPerFlower: 7.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "miniDaisyWithPearlAndGradient", pipePerFlower: 1.00, minutesPerFlower: 7.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "miniDaisyPearl1", pipePerFlower: 1.00, minutesPerFlower: 7.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "miniDaisyPearl2", pipePerFlower: 1.00, minutesPerFlower: 7.0, stamensUsed: 0, pearlsUsed: 1 },
  { name: "stargazerLilyWithPipeMiddle", pipePerFlower: 16.00, minutesPerFlower: 50.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "stargazerLilyWithPipeMiddleAndGradient", pipePerFlower: 16.00, minutesPerFlower: 50.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "stargazerLilyPipe1", pipePerFlower: 16.00, minutesPerFlower: 50.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "stargazerLilyPipe2", pipePerFlower: 16.00, minutesPerFlower: 50.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "stargazerLilyWithStamen", pipePerFlower: 15.00, minutesPerFlower: 40.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "stargazerLilyWithStamenAndGradient", pipePerFlower: 15.00, minutesPerFlower: 40.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "stargazerLilyStamen1", pipePerFlower: 15.00, minutesPerFlower: 40.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "stargazerLilyStamen2", pipePerFlower: 15.00, minutesPerFlower: 40.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "lilyWithPipeMiddle", pipePerFlower: 13.00, minutesPerFlower: 45.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "lilyWithPipeMiddleAndGradient", pipePerFlower: 13.00, minutesPerFlower: 45.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "lilyPipe1", pipePerFlower: 13.00, minutesPerFlower: 45.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "lilyPipe2", pipePerFlower: 13.00, minutesPerFlower: 45.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "lilyWithStamen", pipePerFlower: 12.00, minutesPerFlower: 40.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "lilyWithStamenAndGradient", pipePerFlower: 12.00, minutesPerFlower: 40.0, stamensUsed: 6, pearlsUsed: 0 },
  { name: "noGlueLavender", pipePerFlower: 2.00, minutesPerFlower: 15.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "lavender", pipePerFlower: 6.00, minutesPerFlower: 35.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "tulip8", pipePerFlower: 14.00, minutesPerFlower: 35.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "tulip4", pipePerFlower: 10.00, minutesPerFlower: 35.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "poppy", pipePerFlower: 18.50, minutesPerFlower: 70.0, stamensUsed: 10, pearlsUsed: 0 },
  { name: "narcissus", pipePerFlower: 25.00, minutesPerFlower: 90.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "orchid", pipePerFlower: 6.00, minutesPerFlower: 90.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "morningGlory", pipePerFlower: 6.00, minutesPerFlower: 90.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "peony", pipePerFlower: 6.00, minutesPerFlower: 90.0, stamensUsed: 0, pearlsUsed: 0 },
  { name: "dahlia", pipePerFlower: 6.00, minutesPerFlower: 90.0, stamensUsed: 0, pearlsUsed: 0 },
];

// ------------ WRAPPING TABLE (copied from C) ------------
const wrappingTable = [
  { name: "Honeycomb", costPerSquareInch: 3.00 },
  { name: "Embossed", costPerSquareInch: 2.00 },
  { name: "Paper", costPerSquareInch: 2.50 },
  { name: "Pearl", costPerSquareInch: 2.00 },
  { name: "Black", costPerSquareInch: 1500000.00 },
  { name: "Mesh", costPerSquareInch: 1.50 },
  { name: "Clear", costPerSquareInch: 1200000.00 },
];

// ------------------ Helpers ------------------
function n(value, fallback = 0) {
  const x = Number(value);
  return Number.isFinite(x) ? x : fallback;
}

function cleanName(s) {
  return String(s ?? "").trim();
}

function keyName(s) {
  // case-insensitive matching for web input (more forgiving than C)
  return cleanName(s).toLowerCase();
}

function findFlower(name) {
  const k = keyName(name);
  return flowerTable.find((f) => f.name.toLowerCase() === k) || null;
}

function findWrap(name) {
  const k = keyName(name);
  return wrappingTable.find((w) => w.name.toLowerCase() === k) || null;
}

function roundUpToNearest50(value) {
  return Math.ceil(value / 50) * 50;
}

function calcFloralTapeCost(totalFlowers) {
  if (totalFlowers <= 5) return 200;
  return 200 + (totalFlowers - 5) * 40;
}

function renderList(container, items, fmt) {
  container.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "(none)";
    container.appendChild(li);
    return;
  }
  for (let i = 0; i < items.length; i++) {
    const li = document.createElement("li");
    li.textContent = fmt(items[i], i);
    container.appendChild(li);
  }
}

// ------------------ State ------------------
let flowers = []; // { name, qty }
let wraps = []; // { name, unit, length, width }

// ------------------ UI actions ------------------
function renderAll() {
  renderList(el.flowerList, flowers, (f, i) => `${i + 1}. ${f.name} × ${f.qty}`);
  renderList(el.wrapList, wraps, (w, i) => `${i + 1}. ${w.name} — ${w.unit} ${w.length} × ${w.width}`);
}

el.addFlower.addEventListener("click", () => {
  const name = cleanName(el.flowerName.value);
  const qty = Math.trunc(n(el.flowerQty.value, -1));

  if (!name) return (el.output.textContent = "Enter a flower name.");
  if (qty <= 0) return (el.output.textContent = "Flower quantity must be 1 or more.");

  const info = findFlower(name);
  if (!info) {
    el.output.textContent =
      `Flower not found: "${name}".\n` +
      `Tip: copy the exact name from your C table (e.g., "ladyRose", "flatGerbera", "sunflower*").`;
    return;
  }

  flowers.push({ name: info.name, qty });
  el.flowerName.value = "";
  el.flowerQty.value = "";
  el.output.textContent = "";
  renderAll();
});

el.addWrap.addEventListener("click", () => {
  const name = cleanName(el.wrapName.value);
  const unit = cleanName(el.wrapUnit.value) || "in"; // "in" or "cm"
  const length = n(el.wrapLength.value, -1);
  const width = n(el.wrapWidth.value, -1);

  if (!name) return (el.output.textContent = "Enter a wrapping name.");
  if (length < 0 || width < 0) return (el.output.textContent = "Wrap length and width must be 0 or more.");
  if (unit !== "in" && unit !== "cm") return (el.output.textContent = 'Wrap unit must be "in" or "cm".');

  const info = findWrap(name);
  if (!info) {
    el.output.textContent =
      `Wrapping not found: "${name}".\n` +
      `Available: ${wrappingTable.map((w) => w.name).join(", ")}`;
    return;
  }

  wraps.push({ name: info.name, unit, length, width });
  el.wrapName.value = "";
  el.wrapUnit.value = "in";
  el.wrapLength.value = "";
  el.wrapWidth.value = "";
  el.output.textContent = "";
  renderAll();
});

el.calculate.addEventListener("click", () => {
  // Inputs
  const totalFlowers = Math.trunc(n(el.totalFlowers.value, 0));
  const wrapTypes = Math.trunc(n(el.wrapTypes.value, 0));
  const ribbonInches = n(el.ribbonInches.value, 0);
  const glueSticks = Math.trunc(n(el.glueSticks.value, 0));
  const tissueSheets = Math.trunc(n(el.tissueSheets.value, 0));

  if (totalFlowers < 0) return (el.output.textContent = "Total flowers must be 0 or more.");
  if (wrapTypes < 0) return (el.output.textContent = "Wrapping types must be 0 or more.");
  if (ribbonInches < 0) return (el.output.textContent = "Ribbon inches must be 0 or more.");
  if (glueSticks < 0) return (el.output.textContent = "Glue sticks must be 0 or more.");
  if (tissueSheets < 0) return (el.output.textContent = "Tissue sheets must be 0 or more.");

  // ---- Flowers totals (match C) ----
  let totalPipes = 0.0;
  let totalMinutes = 0.0;
  let totalStamens = 0;
  let totalPearls = 0;

  for (const f of flowers) {
    const info = findFlower(f.name);
    if (!info) continue;

    totalPipes += info.pipePerFlower * f.qty;
    totalMinutes += info.minutesPerFlower * f.qty;

    totalStamens += (info.stamensUsed || 0) * f.qty;
    totalPearls += (info.pearlsUsed || 0) * f.qty;
  }

  const pipeCost = totalPipes * onePipeCleanerPrice;
  const labourCost = (totalMinutes / 60.0) * payPerHour;

  const stamenCost = totalStamens * oneStamenPrice;
  const pearlCost = totalPearls * onePearlPrice;

  // ---- Wrapping totals (area-based, match C) ----
  let totalWrappingCost = 0.0;
  let totalWrappingAreaIn2 = 0.0;

  for (const w of wraps) {
    const info = findWrap(w.name);
    if (!info) continue;

    let areaInInches2 = 0.0;
    if (w.unit === "in") {
      areaInInches2 = w.length * w.width;
    } else {
      // cm^2 -> in^2, using your C constant
      areaInInches2 = (w.length * w.width) * INCH2_TO_CM2;
    }

    totalWrappingAreaIn2 += areaInInches2;
    totalWrappingCost += areaInInches2 * info.costPerSquareInch;
  }

  // ---- Other costs ----
  const ribbonCost = ribbonInches * oneInchRibbon;
  const glueCost = glueSticks * oneGlueStick;
  const tissueCost = tissueSheets * oneTissueSheetPrice;
  const floralTapeCost = calcFloralTapeCost(totalFlowers);

  // ---- Final totals (match C) ----
  const baseTotalCost =
    labourCost +
    pipeCost +
    totalWrappingCost +
    ribbonCost +
    glueCost +
    tissueCost +
    floralTapeCost +
    stamenCost +
    pearlCost +
    flowerBase;

  const profitAmount = baseTotalCost * 0.30;
  let finalTotalCost = baseTotalCost + profitAmount;
  finalTotalCost = roundUpToNearest50(finalTotalCost);

  // ---- Output ----
  let text = "";
  text += "================================\n";
  text += "========= TOTALS TABLE =========\n";
  text += "================================\n\n";

  text += `Total flowers (input): ${totalFlowers}\n`;
  text += `Flowers listed: ${flowers.reduce((s, f) => s + f.qty, 0)}\n\n`;

  text += `Wrapping types (input): ${wrapTypes}\n`;
  text += `Wrapping entries added: ${wraps.length}\n`;
  if (wrapTypes !== wraps.length) {
    text += `⚠️ Note: wrapTypes != wraps.length (you can ignore, but C expects them to match)\n`;
  }
  text += `Total wrapping area (in^2): ${totalWrappingAreaIn2.toFixed(2)}\n`;
  text += `Total wrapping cost: $${totalWrappingCost.toFixed(2)}\n\n`;

  text += `Total pipe cleaners: ${totalPipes.toFixed(2)}\n`;
  text += `Pipe cleaner cost: $${pipeCost.toFixed(2)}\n`;
  text += `Total minutes (from table): ${totalMinutes.toFixed(2)}\n`;
  text += `Labour cost: $${labourCost.toFixed(2)}\n\n`;

  text += `Ribbon inches: ${ribbonInches.toFixed(2)}\n`;
  text += `Ribbon cost: $${ribbonCost.toFixed(2)}\n`;
  text += `Glue sticks: ${glueSticks}\n`;
  text += `Glue cost: $${glueCost.toFixed(2)}\n`;
  text += `Tissue sheets: ${tissueSheets}\n`;
  text += `Tissue cost: $${tissueCost.toFixed(2)}\n`;
  text += `Floral tape cost: $${floralTapeCost.toFixed(2)}\n\n`;

  text += `Stamens used (from flower table): ${totalStamens}\n`;
  text += `Stamens cost: $${stamenCost.toFixed(2)}\n`;
  text += `Pearls used (from flower table): ${totalPearls}\n`;
  text += `Pearls cost: $${pearlCost.toFixed(2)}\n\n`;

  text += `Flower base charge: $${flowerBase.toFixed(2)}\n\n`;

  text += `Base total cost: $${baseTotalCost.toFixed(2)}\n`;
  text += `Profit (30%): $${profitAmount.toFixed(2)}\n`;
  text += `FINAL (rounded up to nearest 50): $${finalTotalCost.toFixed(2)}\n`;

  el.output.textContent = text;
});

el.reset.addEventListener("click", () => {
  flowers = [];
  wraps = [];

  el.totalFlowers.value = "";
  el.wrapTypes.value = "";
  el.ribbonInches.value = "";
  el.glueSticks.value = "";
  el.tissueSheets.value = "";

  el.flowerName.value = "";
  el.flowerQty.value = "";

  el.wrapName.value = "";
  el.wrapUnit.value = "in";
  el.wrapLength.value = "";
  el.wrapWidth.value = "";

  el.output.textContent = "";
  renderAll();
});

// Initial render
renderAll();
