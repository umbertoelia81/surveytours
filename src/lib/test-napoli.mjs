import * as XLSX from 'xlsx';

const SURVEY_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-NItsCY9xi9JDGIgajOfUgL6_opJheqy3xU24zu1GsI/edit?usp=sharing";
const EXCLUDED_EMAILS = ["giorgiotiretti@gmail.com"];

async function checkOnlyNapoli() {
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

    const onlyNapoli = dataRows.filter(row => {
      const areas = String(row[7] || "").split(',').map(s => s.trim()).filter(Boolean);
      return areas.length === 1 && areas[0] === "Napoli & Costiera Amalfitana";
    });

    console.log("Total Filtered Agencies:", dataRows.length);
    console.log("Agencies choosing ONLY Napoli:", onlyNapoli.length);
    onlyNapoli.forEach(row => console.log(`- ${row[2]} (${row[4]})`));
  } catch (err) {
    console.error(err);
  }
}

checkOnlyNapoli();
