"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from "recharts";
import { SurveyResponse } from "@/lib/types";
import { 
  Users, CheckCircle2, MessageSquare, Clipboard, Star, BarChart3,
  Calendar, CreditCard, Shield, MapPin, Compass, Briefcase, HelpCircle,
  Truck, ArrowRight, Heart
} from "lucide-react";

interface SurveyDashboardProps {
  data: SurveyResponse[];
}

const CHART_COLORS = [
  "#4729A3", // Primary (deep royal purple)
  "#33D1ED", // Secondary (vibrant cyan)
  "#FFBF00", // Accent (warm gold)
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#F59E0B", // Amber
  "#14B8A6", // Teal
  "#EF4444", // Red
  "#8B5CF6", // Purple
];

// Predefined option values from the "Domande" sheet
const OPTIONS_Q1 = [
  "Sì, li conosco e li ho già venduti",
  "Sì, li conosco ma non li ho mai venduti",
  "Ne ho sentito parlare ma non li conosco bene",
  "No, non li conoscevo"
];

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

const OPTIONS_Q4_BUDGET = [
  "Economia: fino a € 800",
  "Media: € 800 – 1.200",
  "Medio-alta: € 1.200 – 1.800",
  "Premium: oltre € 1.800"
];

const OPTIONS_Q5 = [
  "Bus Gran Turismo",
  "Mezza pensione",
  "Pensione completa",
  "Pranzi in escursione",
  "Ingressi ai siti",
  "Guida / accompagnatore",
  "Degustazioni tipiche",
  "Escursioni in barca",
  "Assicurazione viaggio",
  "Bevande ai pasti"
];

const OPTIONS_Q6 = [
  "Hotel centrale e ottima categoria (4★ centro)",
  "Hotel centrale anche se categoria standard (3★ centro)",
  "Hotel buono anche se fuori dal centro (4★ periferia)",
  "Indifferente, purché il rapporto qualità/prezzo sia ottimo"
];

const OPTIONS_Q7 = [
  "Programma fitto, poco tempo libero (max 1h/giorno)",
  "Bilanciato: mattina guidata, pomeriggio libero",
  "Ampio tempo libero con solo punti salienti guidati",
  "Dipende dalla destinazione"
];

const OPTIONS_Q8 = [
  "Shopping e mercati locali",
  "Enogastronomia in autonomia",
  "Mare e spiaggia",
  "Relax in hotel",
  "Giro in centro in autonomia",
  "Escursioni opzionali a pagamento"
];

const OPTIONS_Q9_RATING = [
  "Molto apprezzata — i clienti vogliono poter personalizzare",
  "Abbastanza utile, soprattutto per destinazioni specifiche",
  "Poco rilevante — preferiscono un programma tutto incluso e fisso",
  "Non utile — complica la vendita del pacchetto"
];

const OPTIONS_Q9_TIPOLOGIE = [
  "Escursioni in barca / isole",
  "Degustazioni tematiche",
  "Cooking class",
  "Trekking / natura",
  "Tour privato con guida",
  "Ingressi museali extra"
];

const OPTIONS_Q10_TRASPORTO = [
  "Si organizzano autonomamente",
  "Preferirebbero un transfer privato dalla loro città",
  "Preferirebbero un bus collettivo da più città di partenza",
  "Treno veloce + transfer fino all'albergo"
];

const OPTIONS_Q10_IMPORTANZA = ["1", "2", "3", "4", "5"];

const OPTIONS_Q11_UTILITA = [
  "Sì, molto utile — molti clienti vorrebbero estendere il soggiorno",
  "Sì, potrebbe interessare a qualcuno",
  "No, i clienti preferiscono organizzarsi da soli",
  "Dipende dalla destinazione"
];

const OPTIONS_Q11_ESPERIENZE = [
  "Notti extra in hotel",
  "Spa & benessere",
  "Cooking class tipica",
  "Tour privato con guida",
  "Degustazione vino / olio",
  "Gita in barca privata",
  "Ingressi a siti museali non inclusi nel tour",
  "Transfer aeroporto incluso"
];

const OPTIONS_Q12_FOLLOWUP = [
  "Molto — è un ottimo modo per personalizzare e aumentare la soddisfazione",
  "Abbastanza — su alcune tipologie di clientela potrebbe funzionare",
  "Poco — i clienti preferiscono definire tutto al momento della prenotazione",
  "Non utile — rischia di creare confusione o aspettative"
];

const OPTIONS_Q12_SERVIZI = [
  "Transfer alla partenza",
  "Transfer al rientro",
  "Notti pre-tour",
  "Notti post-tour",
  "Escursioni opzionali",
  "Upgrade camera hotel",
  "Esperienze locali extra",
  "Estensione assicurazione"
];

// Helper to aggregate data based on predefined choices
function aggregate(data: any[], key: string, options: string[], isArray: boolean = false) {
  const counts: Record<string, number> = {};
  options.forEach(opt => {
    counts[opt] = 0;
  });

  data.forEach(d => {
    const val = d[key as keyof typeof d];
    if (isArray && Array.isArray(val)) {
      const uniqueVals = Array.from(new Set(val as any[]));
      uniqueVals.forEach(v => {
        if (counts[v] !== undefined) {
          counts[v]++;
        }
      });
    } else if (val) {
      const s = String(val).trim();
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    }
  });

  const baseTotal = data.length;
  return options.map(opt => {
    const count = counts[opt];
    const pct = baseTotal > 0 ? (count / baseTotal) : 0;
    return { name: opt, value: count, percent: pct, total: baseTotal };
  });
}

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label, valueSuffix = "Risposte" }: any) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const percentStr = item.payload.percent !== undefined 
      ? ` (${(item.payload.percent * 100).toFixed(1)}%)` 
      : item.payload.value !== undefined && item.payload.total !== undefined
        ? ` (${(item.payload.value / item.payload.total * 100).toFixed(1)}%)`
        : '';
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-xl text-xs font-semibold leading-relaxed">
        <p className="text-slate-400 font-bold mb-1 uppercase tracking-wider">{item.name || label}</p>
        <p className="text-sm font-black text-white">
          {item.value} <span className="text-xs text-slate-300 font-normal">{valueSuffix}</span>
          {percentStr && <span className="text-xs text-amber-400 font-black ml-1">{percentStr}</span>}
        </p>
      </div>
    );
  }
  return null;
}

// Clean filter for open feedback answers
function filterFeedback(comments: { agency: string; email: string; text?: string }[]) {
  return comments.filter(c => {
    if (!c.text) return false;
    const clean = c.text.trim().toLowerCase();
    return (
      clean.length > 2 &&
      clean !== "no" &&
      clean !== "none" &&
      clean !== "-" &&
      clean !== "nessuno" &&
      clean !== "nessuna" &&
      clean !== "no grazie"
    );
  });
}

export function SurveyDashboard({ data }: SurveyDashboardProps) {
  const stats = useMemo(() => {
    if (!data.length) return null;

    // Q3 averages
    const avgOvest = data.reduce((acc, d) => acc + d.q3_rating_ovest, 0) / data.length;
    const avgEst = data.reduce((acc, d) => acc + d.q3_rating_est, 0) / data.length;
    const avgRicercata = data.reduce((acc, d) => acc + d.q3_rating_ricercata, 0) / data.length;

    // Q3 detailed matrix distribution (from score 10 down to 1)
    const q3Matrix = Array.from({ length: 10 }, (_, i) => {
      const score = 10 - i;
      const ovestCount = data.filter(d => d.q3_rating_ovest === score).length;
      const estCount = data.filter(d => d.q3_rating_est === score).length;
      const ricCount = data.filter(d => d.q3_rating_ricercata === score).length;
      return {
        score: String(score),
        ovestValue: ovestCount,
        ovestPct: (ovestCount / data.length * 100).toFixed(0),
        estValue: estCount,
        estPct: (estCount / data.length * 100).toFixed(0),
        ricValue: ricCount,
        ricPct: (ricCount / data.length * 100).toFixed(0),
      };
    });

    // Q10 average importance
    const avgImportance = data.reduce((acc, d) => acc + d.q10_importanza_trasporto, 0) / data.length;

    // Open responses listings
    const feedbackQ4 = filterFeedback(data.map(d => ({ agency: d.agenzia, email: d.email, text: d.q4_note_budget })));
    const feedbackQ5 = filterFeedback(data.map(d => ({ agency: d.agenzia, email: d.email, text: d.q5_note_inclusioni })));
    const feedbackQ13 = filterFeedback(data.map(d => ({ agency: d.agenzia, email: d.email, text: d.q13_commenti })));

    // Durata preference sorting dynamically (e.g. 6, 7, 8, 10, etc.)
    const rawDurataCounts = aggregate(data, 'q4_durata', Array.from({ length: 13 }, (_, i) => String(3 + i)));
    // Filter only those durations that have > 0 counts for clean presentation in chart
    const q4DurataFiltered = rawDurataCounts.filter(d => d.value > 0);

    return {
      total: data.length,
      q1: aggregate(data, 'q1_conoscenza', OPTIONS_Q1),
      q2: aggregate(data, 'q2_aree', OPTIONS_Q2, true).sort((a, b) => b.value - a.value),
      q3Averages: [
        { name: "🏛 Ricercata Sicilia Ovest", value: parseFloat(avgOvest.toFixed(2)) },
        { name: "🌋 Ricercata Sicilia Est", value: parseFloat(avgEst.toFixed(2)) },
        { name: "🔍 Sicilia Ricercata", value: parseFloat(avgRicercata.toFixed(2)) },
      ],
      q3Matrix,
      q4Durata: q4DurataFiltered,
      q4Budget: aggregate(data, 'q4_budget', OPTIONS_Q4_BUDGET),
      q5Inclusioni: aggregate(data, 'q5_inclusioni', OPTIONS_Q5, true).sort((a, b) => b.value - a.value),
      q6Hotel: aggregate(data, 'q6_hotel', OPTIONS_Q6),
      q7TempoLibero: aggregate(data, 'q7_tempo_libero', OPTIONS_Q7),
      q8Attivita: aggregate(data, 'q8_attivita', OPTIONS_Q8, true).sort((a, b) => b.value - a.value),
      q9Rating: aggregate(data, 'q9_rating_escursioni', OPTIONS_Q9_RATING),
      q9Tipologie: aggregate(data, 'q9_tipologie', OPTIONS_Q9_TIPOLOGIE, true).sort((a, b) => b.value - a.value),
      q10Trasporto: aggregate(data, 'q10_trasporto', OPTIONS_Q10_TRASPORTO),
      q10Importanza: aggregate(data, 'q10_importanza_trasporto', OPTIONS_Q10_IMPORTANZA),
      avgImportance: parseFloat(avgImportance.toFixed(2)),
      q11Utility: aggregate(data, 'q11_prepost_utilita', OPTIONS_Q11_UTILITA),
      q11Esperienze: aggregate(data, 'q11_esperienze', OPTIONS_Q11_ESPERIENZE, true).sort((a, b) => b.value - a.value),
      q12FollowUp: aggregate(data, 'q12_followup', OPTIONS_Q12_FOLLOWUP),
      q12Servizi: aggregate(data, 'q12_servizi', OPTIONS_Q12_SERVIZI, true).sort((a, b) => b.value - a.value),
      feedbackQ4,
      feedbackQ5,
      feedbackQ13
    };
  }, [data]);

  if (!stats) return null;

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 uppercase tracking-widest rounded-md">Official Dashboard</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Confidential</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
              Statistica Turismo Italia<br />
              <span className="text-secondary italic font-serif capitalize">Tour Classici 2026</span>
            </h1>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Agenzie Partecipanti</span>
              <span className="text-4xl font-black text-white mt-1 leading-none">{stats.total}</span>
            </div>
            <div className="h-10 w-[1px] bg-white/20" />
            <Users className="h-10 w-10 text-secondary opacity-80" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:w-72 shrink-0 hidden lg:block">
          <div className="sticky top-8 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm glow-card">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Indice Questionario
            </h3>
            <nav className="space-y-1 text-sm font-medium">
              {[
                { id: "q1", label: "Q1. Conoscenza Prodotto" },
                { id: "q2", label: "Q2. Aree Geografiche" },
                { id: "q3", label: "Q3. Gradimento Sicilia" },
                { id: "q4", label: "Q4. Durata & Budget" },
                { id: "q5", label: "Q5. Servizi & Inclusioni" },
                { id: "q6", label: "Q6. Standard Hotel" },
                { id: "q7", label: "Q7. Frequenza Pause" },
                { id: "q8", label: "Q8. Attività Tempo Libero" },
                { id: "q9", label: "Q9. Escursioni Opzionali" },
                { id: "q10", label: "Q10. Trasporto & Importanza" },
                { id: "q11", label: "Q11. Servizi Pre & Post" },
                { id: "q12", label: "Q12. Email Follow-up" },
                { id: "q13", label: "Q13. Suggerimenti Agenzie" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.id)}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-600 hover:text-primary hover:bg-slate-50 transition-all flex items-center justify-between group font-semibold text-xs"
                >
                  {item.label}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Linear Question Cards */}
        <main className="flex-1 space-y-8">

          {/* Q1 */}
          <div id="q1" className="scroll-mt-6">
            <QuestionCard 
              number="01" 
              title="Conoscenza dei Tour Classici" 
              question="Conosci i Tour Classici in bus Gran Turismo di Imperatore Travel World?"
              desc="Scegli l'opzione che descrive meglio la tua situazione."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[280px] flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={stats.q1} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={65} 
                        outerRadius={95} 
                        paddingAngle={4} 
                        dataKey="value"
                      >
                        {stats.q1.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <DataTable data={stats.q1} colors={CHART_COLORS} />
              </div>
            </QuestionCard>
          </div>

          {/* Q2 */}
          <div id="q2" className="scroll-mt-6">
            <QuestionCard 
              number="02" 
              title="Aree Geografiche più Richieste" 
              question="Su quali aree i tuoi clienti chiedono maggiormente tour in bus?"
              desc="Seleziona tutte le destinazioni applicabili (ordinato per frequenza)."
            >
              <div className="space-y-6">
                <div className="h-[420px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={stats.q2} margin={{ left: 180, right: 30, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#0f172a" 
                        fontSize={10} 
                        width={170} 
                        tickLine={false} 
                        axisLine={false}
                        className="font-bold"
                      />
                      <Tooltip content={<CustomTooltip valueSuffix="Selezionato da" />} />
                      <Bar 
                        dataKey="value" 
                        fill="#4729A3" 
                        radius={[0, 8, 8, 0]} 
                        barSize={20} 
                        label={{ position: 'right', fontSize: 10, fontWeight: 'bold', fill: '#0f172a' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <DataTable data={stats.q2} countLabel="Agenzie" />
              </div>
            </QuestionCard>
          </div>

          {/* Q3 */}
          <div id="q3" className="scroll-mt-6">
            <QuestionCard 
              number="03" 
              title="Sicilia — Gradimento Itinerari" 
              question="Valuta i seguenti itinerari settimanali in Sicilia"
              desc="Voto da 1 a 10 (1 = Non interesserebbe · 10 = Lo amerebbero)."
            >
              <div className="space-y-8">
                {/* Averages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.q3Averages.map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wide leading-tight">{item.name}</span>
                      <div className="flex items-end justify-between mt-4">
                        <span className="text-3xl font-black text-primary italic leading-none">
                          {item.value}
                          <span className="text-xs text-slate-400 font-bold not-italic ml-1">/10</span>
                        </span>
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400 opacity-80" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rating matrix */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest text-center">Voto</th>
                          <th className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest text-center">🏛 Sicilia Ovest</th>
                          <th className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest text-center">🌋 Sicilia Est</th>
                          <th className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest text-center">🔍 Sicilia Ricercata</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-center font-medium">
                        {stats.q3Matrix.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-2.5 font-bold text-slate-900 bg-slate-50/30">{item.score}</td>
                            <td className="px-6 py-2.5">
                              <span className="font-bold text-slate-700">{item.ovestValue}</span>{" "}
                              <span className="text-[10px] text-slate-400 font-semibold">({item.ovestPct}%)</span>
                            </td>
                            <td className="px-6 py-2.5">
                              <span className="font-bold text-slate-700">{item.estValue}</span>{" "}
                              <span className="text-[10px] text-slate-400 font-semibold">({item.estPct}%)</span>
                            </td>
                            <td className="px-6 py-2.5">
                              <span className="font-bold text-slate-700">{item.ricValue}</span>{" "}
                              <span className="text-[10px] text-slate-400 font-semibold">({item.ricPct}%)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </QuestionCard>
          </div>

          {/* Q4 */}
          <div id="q4" className="scroll-mt-6">
            <QuestionCard 
              number="04" 
              title="Durata & Budget Preferito" 
              question="Durata e budget ideali per un tour"
              desc="Indica la combinazione che i tuoi clienti richiedono più spesso."
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Durata */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      Durata Richiesta (Giorni)
                    </h4>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.q4Durata}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                          <YAxis stroke="#94a3b8" fontSize={9} />
                          <Tooltip content={<CustomTooltip valueSuffix="Agenzie" />} />
                          <Bar dataKey="value" fill="#33D1ED" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q4Durata} countLabel="Agenzie" />
                  </div>

                  {/* Budget */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Fascia Budget
                    </h4>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.q4Budget}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                          <YAxis stroke="#94a3b8" fontSize={9} />
                          <Tooltip content={<CustomTooltip valueSuffix="Agenzie" />} />
                          <Bar dataKey="value" fill="#FFBF00" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q4Budget} />
                  </div>
                </div>

                {/* Open budget comments */}
                {stats.feedbackQ4.length > 0 && (
                  <FeedbackList 
                    title="Riferimenti di budget specifici (Risposte Aperte)" 
                    feedback={stats.feedbackQ4} 
                  />
                )}
              </div>
            </QuestionCard>
          </div>

          {/* Q5 */}
          <div id="q5" className="scroll-mt-6">
            <QuestionCard 
              number="05" 
              title="Servizi e Inclusioni nel Prezzo" 
              question="Cosa dovrebbe includere il prezzo del tour?"
              desc="Elementi che i tuoi clienti si aspettano sempre inclusi."
            >
              <div className="space-y-6">
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={stats.q5Inclusioni} margin={{ left: 140, right: 30, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#0f172a" 
                        fontSize={10} 
                        width={130} 
                        tickLine={false} 
                        axisLine={false}
                        className="font-bold"
                      />
                      <Tooltip content={<CustomTooltip valueSuffix="Richiesto da" />} />
                      <Bar 
                        dataKey="value" 
                        fill="#10B981" 
                        radius={[0, 8, 8, 0]} 
                        barSize={18}
                        label={{ position: 'right', fontSize: 10, fontWeight: 'bold', fill: '#0f172a' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <DataTable data={stats.q5Inclusioni} countLabel="Agenzie" />

                {/* Open comments */}
                {stats.feedbackQ5.length > 0 && (
                  <FeedbackList 
                    title="Aggiunte o commenti sulle inclusioni (Risposte Aperte)" 
                    feedback={stats.feedbackQ5} 
                  />
                )}
              </div>
            </QuestionCard>
          </div>

          {/* Q6 */}
          <div id="q6" className="scroll-mt-6">
            <QuestionCard 
              number="06" 
              title="Tipologia di Hotel Preferita" 
              question="Che tipologia di hotel preferiscono i tuoi clienti?"
              desc="Scegli la risposta più rappresentativa."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[280px] flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={stats.q6Hotel} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={65} 
                        outerRadius={95} 
                        paddingAngle={4} 
                        dataKey="value"
                      >
                        {stats.q6Hotel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <DataTable data={stats.q6Hotel} colors={CHART_COLORS} />
              </div>
            </QuestionCard>
          </div>

          {/* Q7 */}
          <div id="q7" className="scroll-mt-6">
            <QuestionCard 
              number="07" 
              title="Tempo Libero nel Programma" 
              question="Quanto tempo libero si aspettano i tuoi clienti durante il tour?"
              desc="Scegli l'equilibrio ideale tra attività guidate e autonomia personale."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[280px] flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={stats.q7TempoLibero} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={65} 
                        outerRadius={95} 
                        paddingAngle={4} 
                        dataKey="value"
                      >
                        {stats.q7TempoLibero.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <DataTable data={stats.q7TempoLibero} colors={CHART_COLORS.slice(2)} />
              </div>
            </QuestionCard>
          </div>

          {/* Q8 */}
          <div id="q8" className="scroll-mt-6">
            <QuestionCard 
              number="08" 
              title="Attività nel Tempo Libero" 
              question="Cosa vogliono fare i clienti nel tempo libero?"
              desc="Seleziona tutte le attività che i tuoi clienti richiedono o si aspettano."
            >
              <div className="space-y-6">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={stats.q8Attivita} margin={{ left: 160, right: 30, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#0f172a" 
                        fontSize={10} 
                        width={150} 
                        tickLine={false} 
                        axisLine={false}
                        className="font-bold"
                      />
                      <Tooltip content={<CustomTooltip valueSuffix="Richiesto da" />} />
                      <Bar 
                        dataKey="value" 
                        fill="#EC4899" 
                        radius={[0, 8, 8, 0]} 
                        barSize={18}
                        label={{ position: 'right', fontSize: 10, fontWeight: 'bold', fill: '#0f172a' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <DataTable data={stats.q8Attivita} countLabel="Agenzie" />
              </div>
            </QuestionCard>
          </div>

          {/* Q9 */}
          <div id="q9" className="scroll-mt-6">
            <QuestionCard 
              number="09" 
              title="Escursioni Opzionali" 
              question="Escursioni opzionali nel programma"
              desc="Valuta l'utilità del tempo personalizzabile e le tipologie più richieste."
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Rating */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2">
                      Apprezzamento Escursioni
                    </h4>
                    <div className="h-[220px] flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={stats.q9Rating} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={55} 
                            outerRadius={85} 
                            paddingAngle={4} 
                            dataKey="value"
                          >
                            {stats.q9Rating.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q9Rating} colors={CHART_COLORS} />
                  </div>

                  {/* Tipologie */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2">
                      Tipologie più Richieste
                    </h4>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stats.q9Tipologie} margin={{ left: 120, right: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="#0f172a" 
                            fontSize={9} 
                            width={110} 
                            tickLine={false} 
                            axisLine={false}
                            className="font-bold"
                          />
                          <Tooltip content={<CustomTooltip valueSuffix="Richiesto da" />} />
                          <Bar dataKey="value" fill="#6366F1" radius={[0, 6, 6, 0]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q9Tipologie} countLabel="Agenzie" />
                  </div>
                </div>
              </div>
            </QuestionCard>
          </div>

          {/* Q10 */}
          <div id="q10" className="scroll-mt-6">
            <QuestionCard 
              number="10" 
              title="Trasporto alla Partenza" 
              question="Trasporto verso il punto di partenza"
              desc="Valuta modalità preferita e importanza commerciale del trasporto incluso."
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Modalita */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-primary" />
                      Modalità Preferita
                    </h4>
                    <div className="h-[220px] flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={stats.q10Trasporto} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={55} 
                            outerRadius={85} 
                            paddingAngle={4} 
                            dataKey="value"
                          >
                            {stats.q10Trasporto.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q10Trasporto} colors={CHART_COLORS} />
                  </div>

                  {/* Importanza */}
                  <div className="space-y-4 flex flex-col">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span>Importanza Commerciale del Trasporto</span>
                      <span className="text-primary font-black lowercase tracking-normal">Avg: {stats.avgImportance}/5</span>
                    </h4>
                    <div className="h-[180px] mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.q10Importanza}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" label={{ value: "Punteggio (1-5)", position: "insideBottom", offset: -5, fontSize: 9 }} />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip content={<CustomTooltip valueSuffix="Agenzie" />} />
                          <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={35} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-auto">
                      <DataTable data={stats.q10Importanza} countLabel="Agenzie" />
                    </div>
                  </div>
                </div>
              </div>
            </QuestionCard>
          </div>

          {/* Q11 */}
          <div id="q11" className="scroll-mt-6">
            <QuestionCard 
              number="11" 
              title="Pacchetti Estensioni Pre & Post" 
              question="Pacchetti pre e post tour"
              desc="Valuta l'utilità di pacchetti predefiniti e le esperienze da includere."
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Utility */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2">
                      Utilità delle Estensioni
                    </h4>
                    <div className="h-[220px] flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={stats.q11Utility} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={55} 
                            outerRadius={85} 
                            paddingAngle={4} 
                            dataKey="value"
                          >
                            {stats.q11Utility.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q11Utility} colors={CHART_COLORS} />
                  </div>

                  {/* Esperienze */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2">
                      Esperienze Richieste
                    </h4>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stats.q11Esperienze} margin={{ left: 140, right: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="#0f172a" 
                            fontSize={9} 
                            width={130} 
                            tickLine={false} 
                            axisLine={false}
                            className="font-bold"
                          />
                          <Tooltip content={<CustomTooltip valueSuffix="Richiesto da" />} />
                          <Bar dataKey="value" fill="#14B8A6" radius={[0, 6, 6, 0]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q11Esperienze} countLabel="Agenzie" />
                  </div>
                </div>
              </div>
            </QuestionCard>
          </div>

          {/* Q12 */}
          <div id="q12" className="scroll-mt-6">
            <QuestionCard 
              number="12" 
              title="Follow-up e Servizi Extra" 
              question="Comunicazioni personalizzate prima della partenza"
              desc="Valuta l'interesse per una mail di follow-up con possibilità di aggiungere servizi extra."
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Interest */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2">
                      Interesse per Comunicazioni
                    </h4>
                    <div className="h-[220px] flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={stats.q12FollowUp} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={55} 
                            outerRadius={85} 
                            paddingAngle={4} 
                            dataKey="value"
                          >
                            {stats.q12FollowUp.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q12FollowUp} colors={CHART_COLORS} />
                  </div>

                  {/* Servizi */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-2">
                      Servizi da Proporre
                    </h4>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stats.q12Servizi} margin={{ left: 130, right: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="#0f172a" 
                            fontSize={9} 
                            width={120} 
                            tickLine={false} 
                            axisLine={false}
                            className="font-bold"
                          />
                          <Tooltip content={<CustomTooltip valueSuffix="Richiesto da" />} />
                          <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <DataTable data={stats.q12Servizi} countLabel="Agenzie" />
                  </div>
                </div>
              </div>
            </QuestionCard>
          </div>

          {/* Q13 - Voice of the Agency */}
          <div id="q13" className="scroll-mt-6">
            <QuestionCard 
              number="13" 
              title="Suggerimenti sul Prodotto (Voice of the Agency)" 
              question="Hai suggerimenti o richieste specifiche sul prodotto Tour?"
              desc="Feedback testuale e osservazioni libere dalle agenzie."
            >
              {stats.feedbackQ13.length > 0 ? (
                <div className="space-y-4">
                  {stats.feedbackQ13.map((item, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm hover:shadow transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary opacity-60" />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.agency}</span>
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md">{item.email}</span>
                      </div>
                      <blockquote className="text-slate-600 text-xs leading-relaxed italic font-medium whitespace-pre-line border-l-2 border-slate-300 pl-4">
                        "{item.text}"
                      </blockquote>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-bold text-center py-6">Nessun commento inserito.</p>
              )}
            </QuestionCard>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[1em]">© 2026 Imperatore Travel - BI Division</p>
      </footer>
    </div>
  );
}

// Sub-component: Elegant Card wrapper for each question
interface QuestionCardProps {
  number: string;
  title: string;
  question: string;
  desc: string;
  children: React.ReactNode;
}

function QuestionCard({ number, title, question, desc, children }: QuestionCardProps) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm glow-card transition-all duration-300 hover:border-slate-300/80">
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="text-3xl font-black text-primary/30 leading-none shrink-0">{number}</div>
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1.5">{title}</span>
          <h2 className="text-lg md:text-xl font-black text-slate-900 leading-tight">{question}</h2>
          {desc && <p className="text-xs font-semibold text-slate-400 mt-1 italic">{desc}</p>}
        </div>
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}

// Sub-component: Pre-formatted Data Table
interface DataTableProps {
  data: any[];
  colors?: string[];
  countLabel?: string;
}

function DataTable({ data, colors, countLabel = "Risposte" }: DataTableProps) {
  const sum = data.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm text-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest">Risposta</th>
            <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-right">{countLabel}</th>
            <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Quota %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {data.map((item, i) => (
            <tr key={i} className="hover:bg-slate-50/40 transition-colors">
              <td className="px-5 py-2.5 text-slate-700 flex items-center gap-2">
                {colors && (
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: colors[i % colors.length] }} 
                  />
                )}
                <span>{item.name}</span>
              </td>
              <td className="px-5 py-2.5 text-slate-950 font-black text-right">{item.value}</td>
              <td className="px-5 py-2.5 text-right font-black text-primary">
                {item.percent !== undefined 
                  ? `${(item.percent * 100).toFixed(0)}%`
                  : sum > 0 ? `${(item.value / sum * 100).toFixed(0)}%` : "0%"
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Sub-component: Pre-formatted open feedback list
interface FeedbackListProps {
  title: string;
  feedback: { agency: string; email: string; text?: string }[];
}

function FeedbackList({ title, feedback }: FeedbackListProps) {
  return (
    <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-50/50">
      <div className="bg-slate-100/80 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{title}</h5>
        <span className="bg-white px-2 py-0.5 rounded-md text-[9px] font-black text-slate-600 border shadow-sm">
          {feedback.length} commenti
        </span>
      </div>
      <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-200">
        {feedback.map((item, index) => (
          <div key={index} className="p-4 hover:bg-slate-100/20 transition-colors">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>{item.agency}</span>
              <span className="text-slate-400 font-semibold">{item.email}</span>
            </div>
            <p className="text-xs text-slate-700 font-medium italic whitespace-pre-line leading-relaxed">
              "{item.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
