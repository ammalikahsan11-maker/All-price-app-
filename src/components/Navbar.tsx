import React from "react";
import { DollarSign, Globe, Award, TrendingUp } from "lucide-react";
import { translations } from "../translations";

interface NavbarProps {
  language: "en" | "hinglish";
  setLanguage: (lang: "en" | "hinglish") => void;
  currency: string;
  setCurrency: (curr: string) => void;
}

export const currencies = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "PKR", symbol: "₨", label: "Pakistani Rupee" },
  { code: "SAR", symbol: "SR", label: "Saudi Riyal" }
];

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  currency,
  setCurrency
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3" id="brand-logo">
          <div className="bg-emerald-500 text-white p-2.5 rounded-2xl shadow-md flex items-center justify-center animate-pulse">
            <TrendingUp size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center">
              Price Finder <span className="ml-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">Live</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              {language === "hinglish" ? "Duniya Ka Har Price Ek Jagah" : "Global Valuation Engine"}
            </p>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="flex items-center space-x-3" id="header-controls">
          {/* Language Switcher Button */}
          <button
            onClick={() => setLanguage(language === "en" ? "hinglish" : "en")}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-sm font-semibold text-slate-700"
            title={t.languageLabel}
            id="lang-toggle-btn"
          >
            <Globe size={15} className="text-slate-400" />
            <span>{language === "en" ? "Hinglish" : "English"}</span>
          </button>

          {/* Currency Dropdown Selector */}
          <div className="relative flex items-center" id="currency-select-container">
            <div className="absolute left-3 pointer-events-none text-slate-400">
              <DollarSign size={15} />
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-sm font-semibold text-slate-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              id="currency-select-dropdown"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
