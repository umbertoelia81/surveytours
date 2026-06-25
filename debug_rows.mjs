import * as XLSX from 'xlsx';

const SURVEY_SHEET_URL = "https://docs.google.com/spreadsheets/d/10ExEWThLFG4YndMT4oymgOgMo6yCYSCHFJR-SrkN7Nw/edit?usp=sharing";
const EXCLUDED_EMAILS = ["giorgiotiretti@gmail.com"];

async function run() {
  try {
    const spreadsheetId = SURVEY_SHEET_URL.match(/[-\w]{25,}/);
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId[0]}/export?format=xlsx`;
    const response = await fetch(exportUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Fix: Search for target sheet names first, fall back to first sheet only if none match
    let sheetName = workbook.SheetNames.find(n => 
      n.toLowerCase().includes("risposte") || 
      n.toLowerCase().includes("responses")
    );
    if (!sheetName) {
      sheetName = workbook.SheetNames[0];
    }

    console.log("Reading sheet:", sheetName);
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log("Total rows in sheet (including empty):", rows.length);
    
    if (rows.length > 0) {
      console.log("Headers:", JSON.stringify(rows[0], null, 2));
    }
    
    // Count valid filtered rows
    const dataRows = rows.slice(1).filter(row => {
      const hasTimestamp = !!row[0];
      const email = String(row[4] || "").toLowerCase().trim();
      const isInternal = email.endsWith("@imperatore.it");
      const isSpecificExcluded = email === "giorgiotiretti@gmail.com";
      return hasTimestamp && !isInternal && !isSpecificExcluded;
    });

    console.log("Total valid filtered responses:", dataRows.length);

  } catch (err) {
    console.error(err);
  }
}

run();
