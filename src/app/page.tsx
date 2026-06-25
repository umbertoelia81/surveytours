"use client";

import { useEffect, useState } from "react";
import { SurveyResponse } from "@/lib/types";
import { fetchSurveyData } from "@/lib/survey-parser";
import { SurveyDashboard } from "@/components/SurveyDashboard";
import { RefreshCw, AlertCircle } from "lucide-react";

const SURVEY_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-NItsCY9xi9JDGIgajOfUgL6_opJheqy3xU24zu1GsI/edit?usp=sharing";

export default function Home() {
  const [data, setData] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchSurveyData(SURVEY_SHEET_URL);
        setData(result);
        setError(null);
      } catch (err) {
        setError("Errore nel caricamento dei dati dal Google Sheet.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Sincronizzazione in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-black text-slate-900 uppercase">Ops! Qualcosa è andato storto</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  return <SurveyDashboard data={data} />;
}
