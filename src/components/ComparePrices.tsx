import React, { useState } from "react";
import { Scale, ArrowRight, ShieldCheck, AlertTriangle, MessageSquare, ExternalLink, RefreshCw } from "lucide-react";
import { translations } from "../translations";
import { ComparisonResult } from "../types";

interface ComparePricesProps {
  language: "en" | "hinglish";
  currency: string;
}

export const ComparePrices: React.FC<ComparePricesProps> = ({ language, currency }) => {
  const t = translations[language];
  const [itemA, setItemA] = useState("");
  const [itemB, setItemB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemA.trim() || !itemB.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSources([]);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemA,
          itemB,
          currency,
          language
        })
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to compare products.");
      }

      setResult(json.data);
      setSources(json.sources || []);
    } catch (err: any) {
      setError(err.message || "Failed to analyze comparison.");
    } finally {
      setLoading(false);
    }
  };

  const getValueColor = (rating: string) => {
    const r = rating.toLowerCase();
    if (r.includes("excellent") || r.includes("high") || r.includes("acha") || r.includes("paisa vasool")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-100";
    }
    if (r.includes("overpriced") || r.includes("mehnga") || r.includes("bad")) {
      return "bg-red-50 text-red-800 border-red-100";
    }
    return "bg-slate-50 text-slate-800 border-slate-100";
  };

  return (
    <div className="space-y-6" id="compare-prices-tab">
      {/* Search Inputs Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm" id="compare-card">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center justify-center space-x-2">
            <Scale className="text-emerald-500 animate-spin-slow" size={28} />
            <span>{t.compareTab}</span>
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            {language === "hinglish" 
              ? "Donon chijon ke daam aur value ka aamne-saamne compare karein."
              : "Compare the actual pricing structures, pros, and cons of any two products side-by-side."}
          </p>
        </div>

        <form onSubmit={handleCompare} className="space-y-4 max-w-3xl mx-auto" id="compare-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Product A */}
            <div className="relative">
              <input
                type="text"
                value={itemA}
                onChange={(e) => setItemA(e.target.value)}
                placeholder={t.comparePlaceholderA}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold transition bg-slate-50/50 text-sm"
                required
                id="compare-input-a"
              />
            </div>

            {/* Input Product B */}
            <div className="relative">
              <input
                type="text"
                value={itemB}
                onChange={(e) => setItemB(e.target.value)}
                placeholder={t.comparePlaceholderB}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold transition bg-slate-50/50 text-sm"
                required
                id="compare-input-b"
              />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-10 py-4 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 text-base cursor-pointer"
              id="compare-submit-btn"
            >
              <Scale size={18} />
              <span>{loading ? t.comparing : t.compareBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading analysis state */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px] space-y-4" id="compare-loading">
          <RefreshCw className="text-emerald-500 animate-spin" size={40} />
          <h3 className="font-extrabold text-lg text-slate-900 animate-pulse">
            {t.comparing}
          </h3>
          <p className="text-sm text-slate-400 font-semibold">
            {language === "hinglish" 
              ? "Gemini AI dono products ka live data scan karke compare kar raha hai..."
              : "Scanning web sources to structure and calculate comparative metrics..."}
          </p>
        </div>
      )}

      {/* Error container */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-900 max-w-2xl mx-auto space-y-3" id="compare-error">
          <AlertTriangle className="mx-auto text-red-500" size={32} />
          <p className="font-extrabold">{language === "hinglish" ? "Kuch Kharabi Aa Gayi!" : "Comparison Error"}</p>
          <p className="text-xs font-semibold text-red-700 bg-white/60 p-3 rounded-xl border border-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Comparison Results Area */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-in" id="compare-results">
          {/* Sahi Expert Verdict Callout Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4" id="verdict-card">
            <h3 className="text-lg font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
              <MessageSquare size={20} />
              <span>{t.comparisonVerdict}</span>
            </h3>
            <p className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed">
              {result.comparisonText}
            </p>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 mt-4 space-y-1">
              <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-widest block">
                {language === "hinglish" ? "BESHAK RECOMMENDATION (MUSHWARA)" : "FINAL EXPERT RECOMMENDATION"}
              </span>
              <p className="text-sm font-bold text-white leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Side-by-Side Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="side-by-side-grid">
            {/* Item A Column */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6 flex flex-col justify-between" id="compare-item-a-box">
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">OPTION A</span>
                  <h4 className="text-xl font-extrabold text-slate-900 mt-1">{result.itemADetails.name}</h4>
                  <span className="text-lg font-black text-emerald-600 block mt-1.5">{result.itemADetails.priceRange}</span>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Value rating:</span>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${getValueColor(result.itemADetails.valueRating)}`}>
                    {result.itemADetails.valueRating}
                  </span>
                </div>

                {/* Pros List */}
                <div className="space-y-2.5">
                  <span className="text-xs uppercase font-black text-emerald-700 tracking-wider flex items-center space-x-1">
                    <ShieldCheck size={14} />
                    <span>Pros / Khas Baatein</span>
                  </span>
                  <ul className="space-y-2">
                    {result.itemADetails.pros.map((pro, idx) => (
                      <li key={idx} className="text-sm font-semibold text-slate-600 leading-relaxed flex items-start space-x-1.5">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs uppercase font-black text-amber-700 tracking-wider flex items-center space-x-1">
                    <AlertTriangle size={14} />
                    <span>Cons / Nuksan</span>
                  </span>
                  <ul className="space-y-2">
                    {result.itemADetails.cons.map((con, idx) => (
                      <li key={idx} className="text-sm font-semibold text-slate-600 leading-relaxed flex items-start space-x-1.5">
                        <span className="text-amber-500 mt-0.5">!</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Item B Column */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6 flex flex-col justify-between" id="compare-item-b-box">
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">OPTION B</span>
                  <h4 className="text-xl font-extrabold text-slate-900 mt-1">{result.itemBDetails.name}</h4>
                  <span className="text-lg font-black text-emerald-600 block mt-1.5">{result.itemBDetails.priceRange}</span>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Value rating:</span>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${getValueColor(result.itemBDetails.valueRating)}`}>
                    {result.itemBDetails.valueRating}
                  </span>
                </div>

                {/* Pros List */}
                <div className="space-y-2.5">
                  <span className="text-xs uppercase font-black text-emerald-700 tracking-wider flex items-center space-x-1">
                    <ShieldCheck size={14} />
                    <span>Pros / Khas Baatein</span>
                  </span>
                  <ul className="space-y-2">
                    {result.itemBDetails.pros.map((pro, idx) => (
                      <li key={idx} className="text-sm font-semibold text-slate-600 leading-relaxed flex items-start space-x-1.5">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs uppercase font-black text-amber-700 tracking-wider flex items-center space-x-1">
                    <AlertTriangle size={14} />
                    <span>Cons / Nuksan</span>
                  </span>
                  <ul className="space-y-2">
                    {result.itemBDetails.cons.map((con, idx) => (
                      <li key={idx} className="text-sm font-semibold text-slate-600 leading-relaxed flex items-start space-x-1.5">
                        <span className="text-amber-500 mt-0.5">!</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Web search citations sources */}
          {sources.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-3" id="compare-sources">
              <div className="border-b border-slate-50 pb-3">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <ExternalLink size={16} className="text-blue-500" />
                  <span>{t.sourcesTitle}</span>
                </h4>
                <p className="text-xs text-slate-400 font-medium">{t.sourcesSubtitle}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1" id="compare-sources-grid">
                {sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    <span className="truncate max-w-[85%]">{src.title}</span>
                    <ExternalLink size={12} className="shrink-0 text-slate-400 ml-1" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
