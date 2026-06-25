import * as XLSX from 'xlsx';

const SURVEY_SHEET_URL = "https://docs.google.com/spreadsheets/d/10ExEWThLFG4YndMT4oymgOgMo6yCYSCHFJR-SrkN7Nw/edit?gid=1328934761#gid=1328934761";

async function run() {
  try {
    const spreadsheetId = SURVEY_SHEET_URL.match(/[-\w]{25,}/);
    console.log("Spreadsheet ID:", spreadsheetId ? spreadsheetId[0] : null);
    if (!spreadsheetId) {
      console.log("No spreadsheet ID found in URL!");
      return;
    }
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId[0]}/export?format=xlsx`;
    console.log("Fetching spreadsheet from:", exportUrl);
    const response = await fetch(exportUrl);
    if (!response.ok) {
      console.log(`Failed to fetch: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log("Response body:", text.substring(0, 1000));
      return;
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    console.log("Workbook sheet names:", workbook.SheetNames);
  } catch (err) {
    console.error("Error fetching or parsing:", err);
  }
}

run();
