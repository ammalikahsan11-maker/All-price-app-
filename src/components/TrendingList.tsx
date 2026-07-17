import React from "react";
import { Sparkles, Smartphone, Landmark, Fuel, Film, Home, Briefcase } from "lucide-react";
import { translations } from "../translations";

interface TrendingListProps {
  language: "en" | "hinglish";
  onSelect: (query: string) => void;
}

export const TrendingList: React.FC<TrendingListProps> = ({ language, onSelect }) => {
  const t = translations[language];

  const popularSearches = [
    {
      query: "iPhone 16 Pro Max (256GB)",
      label: language === "hinglish" ? "iPhone 16 Pro Max" : "iPhone 16 Pro Max",
      icon: <Smartphone className="text-blue-500" size={16} />,
      bg: "bg-blue-50 border-blue-100 text-blue-900"
    },
    {
      query: "24 Karat Gold (10 Grams)",
      label: language === "hinglish" ? "Sona / Gold (10g)" : "24K Gold (10g)",
      icon: <Landmark className="text-amber-500" size={16} />,
      bg: "bg-amber-50 border-amber-100 text-amber-900"
    },
    {
      query: "1 Litre Petrol Price",
      label: language === "hinglish" ? "Petrol Ka Daam" : "1 Litre Petrol",
      icon: <Fuel className="text-emerald-500" size={16} />,
      bg: "bg-emerald-50 border-emerald-100 text-emerald-900"
    },
    {
      query: "Netflix Premium Subscription (India / 1 Month)",
      label: language === "hinglish" ? "Netflix Premium Fees" : "Netflix Premium",
      icon: <Film className="text-red-500" size={16} />,
      bg: "bg-red-50 border-red-100 text-red-900"
    },
    {
      query: "1 BHK Flat Rent in Bangalore Indiranagar",
      label: language === "hinglish" ? "Bangalore 1 BHK Rent" : "1 BHK Bangalore Rent",
      icon: <Home className="text-indigo-500" size={16} />,
      bg: "bg-indigo-50 border-indigo-100 text-indigo-900"
    },
    {
      query: "CA Consultation Fee per hour",
      label: language === "hinglish" ? "CA ki Fees" : "CA Consultation Fee",
      icon: <Briefcase className="text-slate-500" size={16} />,
      bg: "bg-slate-50 border-slate-100 text-slate-900"
    }
  ];

  return (
    <div className="mt-6" id="trending-searches-box">
      <div className="flex items-center space-x-2 mb-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
        <Sparkles size={14} className="text-emerald-500" />
        <span>{t.trendingLabel}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5" id="trending-grid">
        {popularSearches.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item.query)}
            className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-left transition hover:scale-[1.02] active:scale-[0.98] ${item.bg}`}
            id={`trending-item-${idx}`}
          >
            <div className="p-1 bg-white rounded-lg shadow-sm shrink-0">
              {item.icon}
            </div>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
