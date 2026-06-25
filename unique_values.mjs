import * as XLSX from 'xlsx';
import * as fs from 'fs';

const SURVEY_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-NItsCY9xi9JDGIgajOfUgL6_opJheqy3xU24zu1GsI/edit?usp=sharing";
const EXCLUDED_EMAILS = ["giorgiotiretti@gmail.com"];

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

    const headers = rows[0];
    const report = {};
    
    // Check columns G to AB (indices 6 to 27)
    for (let colIdx = 6; colIdx <= 27; colIdx++) {
      const headerName = headers[colIdx];
      const uniqueVals = new Set();
      dataRows.forEach(row => {
        const val = row[colIdx];
        if (val !== undefined && val !== null && val !== "") {
          uniqueVals.add(String(val).trim());
        }
      });
      report[`col_${colIdx}_${headerName}`] = Array.from(uniqueVals);
    }
    
    fs.writeFileSync('unique_values_report.json', JSON.stringify(report, null, 2));
    console.log("Written report to unique_values_report.json");
  } catch (err) {
    console.error(err);
  }
}

run();
