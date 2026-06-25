import * as XLSX from 'xlsx';

const SURVEY_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-NItsCY9xi9JDGIgajOfUgL6_opJheqy3xU24zu1GsI/edit?usp=sharing";
const EXCLUDED_EMAILS = ["giorgiotiretti@gmail.com"];

const OPTIONS_Q2 = [
  "Napoli & Costiera Amalfitana",
  "Ischia & Costiera Sorrentina",
  "Napoli e Palermo",
  "Taormina & Etna",
  "Taormina e Isole Eolie",
  "Val di Noto (Ragusa, Modica, Noto)",
  "Chianti & Toscana classica",
  "Cinque Terre & Liguria",
  "Puglia e Matera",
  "Tropea & Calabria",
  "Roma e Umbria",
  "Sardegna"
];

function parseQ2List(val) {
  if (!val) return [];
  let s = String(val);
  s = s.replace(/Val di Noto\s*\(\s*Ragusa\s*,\s*Modica\s*,\s*Noto\s*\)/gi, "__VAL_DI_NOTO__");
  return s.split(',')
    .map(item => {
      let cleaned = item.trim();
      if (cleaned === "__VAL_DI_NOTO__") {
        return "Val di Noto (Ragusa, Modica, Noto)";
      }
      return cleaned;
    })
    .filter(Boolean);
}

function normalizeQ2(val) {
  const s = val.trim();
  const lower = s.toLowerCase();
  if (lower === "napoli & costiera amalfitana") return "Napoli & Costiera Amalfitana";
  if (lower === "ischia & costiera sorrentina" || (lower.includes("ischia") && lower.includes("amalfi"))) return "Ischia & Costiera Sorrentina";
  if (lower === "napoli e palermo") return "Napoli e Palermo";
  if (lower === "taormina & etna") return "Taormina & Etna";
  if (lower === "taormina e isole eolie") return "Taormina e Isole Eolie";
  if (lower === "val di noto (ragusa, modica, noto)") return "Val di Noto (Ragusa, Modica, Noto)";
  if (lower === "chianti & toscana classica") return "Chianti & Toscana classica";
  if (lower === "cinque terre & liguria") return "Cinque Terre & Liguria";
  if (lower === "puglia e matera") return "Puglia e Matera";
  if (lower === "tropea & calabria") return "Tropea & Calabria";
  if (lower === "roma e umbria") return "Roma e Umbria";
  if (lower === "sardegna") return "Sardegna";
  return s;
}

async function run() {
  try {
    const spreadsheetId = SURVEY_SHEET_URL.match(/[-\w]{25,}/);
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId[0]}/export?format=xlsx`;
    const response = await fetch(exportUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames.find(n => 
      n.toLowerCase().includes("risposte") || 
      n.toLowerCase().includes("responses") ||
      n === workbook.SheetNames[0]
    );

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const dataRows = rows.slice(1).filter(row => {
      const hasTimestamp = !!row[0];
      const email = String(row[4] || "").toLowerCase().trim();
      const isInternal = email.endsWith("@imperatore.it");
      const isExcluded = EXCLUDED_EMAILS.includes(email);
      return hasTimestamp && !isInternal && !isExcluded;
    });

    console.log("Filtered responses total:", dataRows.length);

    const unrecognized = {};
    const counts = {};
    OPTIONS_Q2.forEach(o => counts[o] = 0);

    dataRows.forEach((row, rIdx) => {
      const val = row[7]; // Col H (index 7)
      if (!val) return;
      const parsed = parseQ2List(val);
      parsed.forEach(item => {
        const norm = normalizeQ2(item);
        if (counts[norm] !== undefined) {
          counts[norm]++;
        } else {
          unrecognized[norm] = (unrecognized[norm] || 0) + 1;
        }
      });
    });

    console.log("\nCounts for Q2 options:");
    console.log(JSON.stringify(counts, null, 2));

    console.log("\nUnrecognized items summary:");
    console.log(JSON.stringify(unrecognized, null, 2));

  } catch (err) {
    console.error(err);
  }
}

run();
