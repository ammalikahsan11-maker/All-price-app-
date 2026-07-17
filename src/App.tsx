import React, { useState, useEffect } from "react";
import { Search, Scale, Bell, Landmark, AlertCircle, Sparkles } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { PriceSearch } from "./components/PriceSearch";
import { ComparePrices } from "./components/ComparePrices";
import { Watchlist } from "./components/Watchlist";
import { ToastContainer, ToastMessage } from "./components/Toast";
import { translations } from "./translations";
import { WatchlistItem, SearchHistoryItem, ProductDetails } from "./types";

export default function App() {
  // We default to Hinglish since the user asked in Hinglish! This is extremely helpful and tailored.
  const [language, setLanguage] = useState<"en" | "hinglish">(() => {
    const saved = localStorage.getItem("pf_lang");
    return (saved === "en" || saved === "hinglish") ? saved : "hinglish";
  });

  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem("pf_curr") || "INR";
  });

  const [activeTab, setActiveTab] = useState<"search" | "compare" | "watchlist">("search");

  // Load Watchlist and History from localStorage
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem("pf_watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    const saved = localStorage.getItem("pf_history");
    return saved ? JSON.parse(saved) : [];
  });

  // State to hold live toast alerts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state back to localStorage when changed
  useEffect(() => {
    localStorage.setItem("pf_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("pf_curr", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("pf_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem("pf_history", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const currencySymbol = (() => {
    switch (currency) {
      case "INR": return "₹";
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "AED": return "د.إ";
      case "CAD": return "C$";
      case "AUD": return "A$";
      case "PKR": return "₨";
      case "SAR": return "SR";
      default: return "$";
    }
  })();

  const t = translations[language];

  // Handler to add item to watchlist
  const handleAddToWatchlist = (product: ProductDetails) => {
    setWatchlist((prev) => {
      // Avoid duplicates
      if (prev.some((item) => item.query === product.itemName)) {
        return prev;
      }
      const newItem: WatchlistItem = {
        id: Date.now().toString(),
        query: product.itemName,
        currency: product.currency,
        addedAt: Date.now(),
        lastDetails: product
      };
      return [newItem, ...prev];
    });
  };

  // Handler to remove item from watchlist
  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const triggerPriceDropToast = (item: WatchlistItem, targetPrice: number) => {
    if (!item.lastDetails) return;
    const currentPrice = item.lastDetails.avgPrice;
    
    const isHinglish = language === "hinglish";
    const title = isHinglish 
      ? "🎯 Price Drop Alert! Target Mil Gaya!" 
      : "🎯 Price Drop Alert! Target Reached!";
    
    const message = isHinglish
      ? `"${item.query}" ka rate abhi घटकर ${currencySymbol}${currentPrice.toLocaleString()} ho gaya hai, jo aapke target ${currencySymbol}${targetPrice.toLocaleString()} se kam ya barabar hai!`
      : `"${item.query}" is now retailing at ${currencySymbol}${currentPrice.toLocaleString()}, which is below or equal to your target price of ${currencySymbol}${targetPrice.toLocaleString()}!`;

    const newToast: ToastMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      title,
      message,
      itemName: item.query,
      currentPrice,
      targetPrice,
      currencySymbol
    };

    setToasts((prev) => [newToast, ...prev]);
  };

  // Handler to set custom alert price
  const handleUpdateTargetPrice = (id: string, targetPrice: number) => {
    setWatchlist((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, targetPrice } : item));
      const targetItem = updated.find((item) => item.id === id);
      if (targetItem && targetItem.lastDetails && targetItem.lastDetails.avgPrice <= targetPrice) {
        triggerPriceDropToast(targetItem, targetPrice);
      }
      return updated;
    });
  };

  // Handler to update saved product details upon live refresh scan
  const handleRefreshWatchlistItem = (id: string, currentDetails: ProductDetails) => {
    setWatchlist((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, lastDetails: currentDetails } : item
      );
      const targetItem = updated.find((item) => item.id === id);
      if (targetItem && targetItem.targetPrice && currentDetails.avgPrice <= targetItem.targetPrice) {
        triggerPriceDropToast(targetItem, targetItem.targetPrice);
      }
      return updated;
    });
  };

  // Handler to append search queries into history tray
  const handleAddSearchHistory = (query: string) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: Date.now(),
        currency
      };
      return [newItem, ...filtered].slice(0, 10); // Keep max 10 recent items
    });
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 gradient-bg font-sans text-slate-800 pb-16" id="app-root-container">
      {/* Shared Nav Bar Header */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10" id="main-content-area">
        {/* Animated dynamic alert notice warning of iframe limitations or helpful setup details */}
        <div className="mb-6 bg-emerald-50 border border-emerald-100/80 rounded-2xl p-4 flex items-start space-x-3 shadow-sm" id="iframe-note-box">
          <Sparkles className="text-emerald-500 mt-0.5 shrink-0" size={18} />
          <div>
            <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">
              {language === "hinglish" ? "AI PRICE FINDER ACTIVE" : "SMART VALUATION ENGINE"}
            </h4>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5 leading-relaxed">
              {language === "hinglish" 
                ? "Yeh tool naye AI aur Google Search se judkar bilkul live market prices nikalta hai. Aap products, dhaan-gahu ke rate, services ya flat rent tak pata kar sakte hain!"
                : "Connected to Gemini AI and live Google Search indexes to pull the most accurate market price estimates on any physical item, subscription or service."}
            </p>
          </div>
        </div>

        {/* Tab Selection Bar with custom active glow indicators */}
        <div className="flex border-b border-slate-200/80 mb-8 overflow-x-auto gap-2.5 p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 max-w-lg mx-auto" id="tabs-bar">
          {/* Find Price Tab */}
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center justify-center space-x-2 flex-1 px-4 py-3 rounded-xl text-sm font-extrabold transition cursor-pointer select-none shrink-0 ${
              activeTab === "search"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 hover:bg-white"
            }`}
            id="tab-search-btn"
          >
            <Search size={16} />
            <span>{t.searchTab}</span>
          </button>

          {/* Compare Tab */}
          <button
            onClick={() => setActiveTab("compare")}
            className={`flex items-center justify-center space-x-2 flex-1 px-4 py-3 rounded-xl text-sm font-extrabold transition cursor-pointer select-none shrink-0 ${
              activeTab === "compare"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 hover:bg-white"
            }`}
            id="tab-compare-btn"
          >
            <Scale size={16} />
            <span>{t.compareTab}</span>
          </button>

          {/* Watchlist Tab */}
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`flex items-center justify-center space-x-2 flex-1 px-4 py-3 rounded-xl text-sm font-extrabold transition cursor-pointer select-none shrink-0 relative ${
              activeTab === "watchlist"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 hover:bg-white"
            }`}
            id="tab-watchlist-btn"
          >
            <Bell size={16} />
            <span>{t.watchlistTab}</span>
            {watchlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white animate-pulse">
                {watchlist.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab View Contents Renderer */}
        <div className="min-h-[500px]" id="tab-content-renderer">
          {activeTab === "search" && (
            <PriceSearch
              language={language}
              currency={currency}
              currencySymbol={currencySymbol}
              onAddToWatchlist={handleAddToWatchlist}
              watchlistIds={watchlist.map((item) => item.query)}
              searchHistory={searchHistory}
              onClearHistory={handleClearHistory}
              onSearchSelectHistory={handleAddSearchHistory}
            />
          )}

          {activeTab === "compare" && (
            <ComparePrices
              language={language}
              currency={currency}
            />
          )}

          {activeTab === "watchlist" && (
            <Watchlist
              language={language}
              currency={currency}
              currencySymbol={currencySymbol}
              watchlist={watchlist}
              onRemove={handleRemoveFromWatchlist}
              onUpdateTargetPrice={handleUpdateTargetPrice}
              onRefreshItem={handleRefreshWatchlistItem}
            />
          )}
        </div>
      </main>

      {/* Modern minimal footer */}
      <footer className="text-center text-[11px] text-slate-400 font-semibold mt-16 max-w-md mx-auto" id="app-footer">
        <p>© 2026 Price Finder. Powered by Gemini & Live Search Grounding.</p>
        <p className="mt-1">{language === "hinglish" ? "Sahi daam, bina kisi pareshaan." : "Know the fair price, buy with confidence."}</p>
      </footer>

      {/* Global Toast Alerts */}
      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onAction={() => setActiveTab("watchlist")}
        language={language}
      />
    </div>
  );
}
