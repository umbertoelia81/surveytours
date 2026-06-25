'use client';

import * as XLSX from 'xlsx';
import { SurveyResponse } from './types';

function parseCsvList(val: any): string[] {
  if (!val) return [];
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}

function parseQ2List(val: any): string[] {
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

function parseNumber(val: any): number {
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

// Mappings & Normalizations to match "Domande" sheet exactly
function normalizeQ1(val: any): string {
  const s = String(val || "").trim();
  if (s.includes("e li ho gia venduti") || s.includes("e li ho già venduti")) return "Sì, li conosco e li ho già venduti";
  if (s.includes("non li ho mai venduti")) return "Sì, li conosco ma non li ho mai venduti";
  if (s.includes("non li conosco bene")) return "Ne ho sentito parlare ma non li conosco bene";
  if (s.includes("non li conoscevo")) return "No, non li conoscevo";
  return s;
}

function normalizeQ2(val: string): string {
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

function normalizeBudget(val: any): string {
  const s = String(val || "").trim();
  if (s.includes("Fino a") || s.includes("fino a")) return "Economia: fino a € 800";
  if (s.includes("800 - 1.200") || s.includes("800 – 1.200")) return "Media: € 800 – 1.200";
  if (s.includes("1.200 - 1.800") || s.includes("1.200 – 1.800")) return "Medio-alta: € 1.200 – 1.800";
  if (s.includes("oltre") || s.includes("Oltre")) return "Premium: oltre € 1.800";
  return s;
}

function normalizeQ5Inclusioni(val: string): string {
  const s = val.trim();
  const lower = s.toLowerCase();
  if (lower === "bus gran turismo") return "Bus Gran Turismo";
  if (lower === "mezza pensione") return "Mezza pensione";
  if (lower === "pensione completa") return "Pensione completa";
  if (lower === "pranzi in escursione") return "Pranzi in escursione";
  if (lower === "ingressi ai siti") return "Ingressi ai siti";
  if (lower === "guida / accompagnatore" || lower === "guida/accompagnatore") return "Guida / accompagnatore";
  if (lower === "degustazioni tipiche") return "Degustazioni tipiche";
  if (lower === "escursioni in barca") return "Escursioni in barca";
  if (lower === "assicurazione viaggio") return "Assicurazione viaggio";
  if (lower === "bevande ai pasti") return "Bevande ai pasti";
  return s;
}

function normalizeQ6(val: any): string {
  const s = String(val || "").trim();
  if (s.includes("4 stelle centro") || s.includes("4★ centro")) return "Hotel centrale e ottima categoria (4★ centro)";
  if (s.includes("3 stelle centro") || s.includes("3★ centro")) return "Hotel centrale anche se categoria standard (3★ centro)";
  if (s.includes("4 stelle periferia") || s.includes("4★ periferia")) return "Hotel buono anche se fuori dal centro (4★ periferia)";
  if (s.includes("qualita/prezzo") || s.includes("qualità/prezzo")) return "Indifferente, purché il rapporto qualità/prezzo sia ottimo";
  return s;
}

function normalizeQ7(val: any): string {
  const s = String(val || "").trim();
  if (s.includes("poco tempo libero")) return "Programma fitto, poco tempo libero (max 1h/giorno)";
  if (s.includes("pomeriggio libero")) return "Bilanciato: mattina guidata, pomeriggio libero";
  if (s.includes("ampio tempo libero") || s.includes("Ampio tempo libero")) return "Ampio tempo libero con solo punti salienti guidati";
  if (s.includes("dipende dalla destinazione") || s.includes("Dipende dalla destinazione")) return "Dipende dalla destinazione";
  return s;
}

function normalizeQ8Attivita(val: string): string {
  const s = val.trim();
  const lower = s.toLowerCase();
  if (lower === "shopping e mercati locali") return "Shopping e mercati locali";
  if (lower === "enogastronomia in autonomia") return "Enogastronomia in autonomia";
  if (lower === "mare e spiaggia") return "Mare e spiaggia";
  if (lower === "relax in hotel") return "Relax in hotel";
  if (lower === "giro in centro in autonomia") return "Giro in centro in autonomia";
  if (lower === "escursioni opzionali a pagamento") return "Escursioni opzionali a pagamento";
  return s;
}

function normalizeQ9Rating(val: any): string {
  const s = String(val || "").trim();
  if (s.includes("Molto apprezzata")) return "Molto apprezzata — i clienti vogliono poter personalizzare";
  if (s.includes("Abbastanza utile")) return "Abbastanza utile, soprattutto per destinazioni specifiche";
  if (s.includes("Poco rilevante")) return "Poco rilevante — preferiscono un programma tutto incluso e fisso";
  if (s.includes("Non utile")) return "Non utile — complica la vendita del pacchetto";
  return s;
}

function normalizeQ9Tipologie(val: string): string {
  const s = val.trim();
  const lower = s.toLowerCase();
  if (lower.includes("barca")) return "Escursioni in barca / isole";
  if (lower.includes("degustazioni")) return "Degustazioni tematiche";
  if (lower.includes("cooking class")) return "Cooking class";
  if (lower.includes("trekking")) return "Trekking / natura";
  if (lower.includes("tour privato")) return "Tour privato con guida";
  if (lower.includes("ingressi museali")) return "Ingressi museali extra";
  return s;
}

function normalizeQ10(val: any): string {
  const s = String(val || "").trim();
  if (s.includes("transfer privato")) return "Preferirebbero un transfer privato dalla loro città";
  if (s.includes("bus collettivo")) return "Preferirebbero un bus collettivo da più città di partenza";
  if (s.includes("organizzano autonomamente")) return "Si organizzano autonomamente";
  if (s.includes("treno veloce") || s.includes("Treno veloce")) return "Treno veloce + transfer fino all'albergo";
  return s;
}

function normalizeQ11Utility(val: any): string {
  const s = String(val || "").trim();
  if (s.includes("molto utile")) return "Sì, molto utile — molti clienti vorrebbero estendere il soggiorno";
  if (s.includes("potrebbe interessare")) return "Sì, potrebbe interessare a qualcuno";
  if (s.includes("dipende dalla destinazione") || s.includes("Dipende dalla destinazione")) return "Dipende dalla destinazione";
  if (s.includes("preferiscono organizzarsi da soli") || s.includes("organizzarsi da soli")) return "No, i clienti preferiscono organizzarsi da soli";
  return s;
}

function normalizeQ11Esperienze(val: string): string {
  const s = val.trim();
  const lower = s.toLowerCase();
  if (lower.includes("notti extra")) return "Notti extra in hotel";
  if (lower.includes("spa")) return "Spa & benessere";
  if (lower.includes("cooking class")) return "Cooking class tipica";
  if (lower.includes("tour privato")) return "Tour privato con guida";
  if (lower.includes("degustazione")) return "Degustazione vino / olio";
  if (lower.includes("barca privata")) return "Gita in barca privata";
  if (lower.includes("ingressi")) return "Ingressi a siti museali non inclusi nel tour";
  if (lower.includes("transfer")) return "Transfer aeroporto incluso";
  return s;
}

function normalizeQ12(val: any): string {
  const s = String(val || "").trim();
  if (s.includes("Molto -") || s.includes("Molto —") || s.includes("Molto, e un ottimo") || s.includes("Molto - e un ottimo")) return "Molto — è un ottimo modo per personalizzare e aumentare la soddisfazione";
  if (s.includes("Abbastanza -") || s.includes("Abbastanza —") || s.includes("Abbastanza - su alcune")) return "Abbastanza — su alcune tipologie di clientela potrebbe funzionare";
  if (s.includes("Poco -") || s.includes("Poco —") || s.includes("Poco - i clienti")) return "Poco — i clienti preferiscono definire tutto al momento della prenotazione";
  if (s.includes("Non utile -") || s.includes("Non utile —") || s.includes("Non utile - rischia")) return "Non utile — rischia di creare confusione o aspettative";
  return s;
}

function normalizeQ12Servizi(val: string): string {
  const s = val.trim();
  const lower = s.toLowerCase();
  if (lower.includes("transfer alla partenza")) return "Transfer alla partenza";
  if (lower.includes("transfer al rientro")) return "Transfer al rientro";
  if (lower.includes("notti pre-tour")) return "Notti pre-tour";
  if (lower.includes("notti post-tour")) return "Notti post-tour";
  if (lower.includes("opzionali")) return "Escursioni opzionali";
  if (lower.includes("upgrade")) return "Upgrade camera hotel";
  if (lower.includes("esperienze locali")) return "Esperienze locali extra";
  if (lower.includes("assicurazione")) return "Estensione assicurazione";
  return s;
}

export async function fetchSurveyData(url: string): Promise<SurveyResponse[]> {
  try {
    const spreadsheetId = url.match(/[-\w]{25,}/);
    if (!spreadsheetId) throw new Error("URL Google Sheet non valido.");

    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId[0]}/export?format=xlsx`;
    const response = await fetch(exportUrl);
    if (!response.ok) throw new Error("Connessione al database sondaggi fallita.");

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames.find(n => 
      n.toLowerCase().includes("risposte") || 
      n.toLowerCase().includes("responses") ||
      n === workbook.SheetNames[0]
    );

    if (!sheetName) return [];

    const rows: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    // Filtriamo le righe vuote e le email da escludere
    const dataRows = dataRowsFilter(rows);

    return dataRows.map((row): SurveyResponse => {
      return {
        timestamp: String(row[0] || ""),
        surveyTitle: String(row[1] || ""),
        agenzia: String(row[2] || ""),
        nome: String(row[3] || ""),
        email: String(row[4] || ""),
        telefono: String(row[5] || ""),
        q1_conoscenza: normalizeQ1(row[6]),
        q2_aree: parseQ2List(row[7]).map(normalizeQ2),
        q3_rating_ovest: parseNumber(row[8]),
        q3_rating_est: parseNumber(row[9]),
        q3_rating_ricercata: parseNumber(row[10]),
        q4_durata: String(row[11] || ""),
        q4_budget: normalizeBudget(row[12]),
        q4_note_budget: String(row[13] || ""),
        q5_inclusioni: parseCsvList(row[14]).map(normalizeQ5Inclusioni),
        q5_note_inclusioni: String(row[15] || ""),
        q6_hotel: normalizeQ6(row[16]),
        q7_tempo_libero: normalizeQ7(row[17]),
        q8_attivita: parseCsvList(row[18]).map(normalizeQ8Attivita),
        q9_rating_escursioni: normalizeQ9Rating(row[19]),
        q9_tipologie: parseCsvList(row[20]).map(normalizeQ9Tipologie),
        q10_trasporto: normalizeQ10(row[21]),
        q10_importanza_trasporto: parseNumber(row[22]),
        q11_prepost_utilita: normalizeQ11Utility(row[23]),
        q11_esperienze: parseCsvList(row[24]).map(normalizeQ11Esperienze),
        q12_followup: normalizeQ12(row[25]),
        q12_servizi: parseCsvList(row[26]).map(normalizeQ12Servizi),
        q13_commenti: String(row[27] || "")
      } as SurveyResponse;
    });
  } catch (err: any) {
    console.error("Errore fetchSurveyData:", err);
    throw err;
  }
}

function dataRowsFilter(rows: any[][]) {
  return rows.slice(1).filter(row => {
    const hasTimestamp = !!row[0];
    const email = String(row[4] || "").toLowerCase().trim();
    const isInternal = email.endsWith("@imperatore.it");
    const isSpecificExcluded = email === "giorgiotiretti@gmail.com";
    return hasTimestamp && !isInternal && !isSpecificExcluded;
  });
}
