import * as XLSX from 'xlsx';

const SURVEY_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-NItsCY9xi9JDGIgajOfUgL6_opJheqy3xU24zu1GsI/edit?usp=sharing";

async function run() {
  try {
    const spreadsheetId = SURVEY_SHEET_URL.match(/[-\w]{25,}/);
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId[0]}/export?format=xlsx`;
    const response = await fetch(exportUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const name = "Domande";
    if (!workbook.SheetNames.includes(name)) {
      console.log("No Domande sheet found!");
      return;
    }
    
    console.log(`\n--- Sheet: ${name} ---`);
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Total rows in sheet: ${rows.length}`);
    
    for (let i = 0; i < Math.min(rows.length, 250); i++) {
      const r = rows[i];
      if (r && r.length > 0 && r.some(cell => cell !== null && cell !== undefined && cell !== "")) {
        console.log(`Row ${i}:`, JSON.stringify(r));
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
