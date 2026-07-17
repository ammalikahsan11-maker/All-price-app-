import React, { useState } from "react";
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  ExternalLink, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  ShoppingBag,
  Bell,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { translations } from "../translations";
import { ProductDetails, SearchHistoryItem } from "../types";
import { TrendingList } from "./TrendingList";
import { TrendChart } from "./TrendChart";

interface PriceSearchProps {
  language: "en" | "hinglish";
  currency: string;
  currencySymbol: string;
  onAddToWatchlist: (product: ProductDetails) => void;
  watchlistIds: string[];
  searchHistory: SearchHistoryItem[];
  onClearHistory: () => void;
  onSearchSelectHistory: (query: string) => void;
}

export const PriceSearch: React.FC<PriceSearchProps> = ({
  language,
  currency,
  currencySymbol,
  onAddToWatchlist,
  watchlistIds,
  searchHistory,
  onClearHistory,
  onSearchSelectHistory
}) => {
  const t = translations[language];
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductDetails | null>(null);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);

  // Simulation of staggered loading messages
  const loadingMessages = language === "hinglish" ? [
    "Google Search se sabse naye daam dhoondh rahe hain...",
    "Vividh shopping platforms ke rates compare kar rahe hain...",
    "Grahon ke reviews aur value-for-money score calculate kar rahe hain...",
    "Price trends aur aane wale badlaav ka pata laga rahe hain..."
  ] : [
    "Searching the web for the latest pricing indexes...",
    "Comparing rates across different retail platforms...",
    "Calculating the customer value-for-money rating...",
    "Analyzing historical price trends and market direction..."
  ];

  const runLoadingAnimation = () => {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingMessages.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return interval;
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSources([]);

    const animInterval = runLoadingAnimation();

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          currency,
          language
        })
      });

      const json = await response.json();
      clearInterval(animInterval);

      if (!response.ok) {
        throw new Error(json.error || "Failed to search price index.");
      }

      setResult(json.data);
      setSources(json.sources || []);
      
      // Update local storage history (done in parent App component)
      onSearchSelectHistory(searchQuery);

    } catch (err: any) {
      clearInterval(animInterval);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case "Great Deal":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Fair Price":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Expensive":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Overpriced":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Rising":
        return <TrendingUp className="text-red-500" size={16} />;
      case "Declining":
        return <TrendingDown className="text-emerald-500" size={16} />;
      default:
        return <Minus className="text-slate-500" size={16} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Rising":
        return "bg-red-50 text-red-700 border-red-100";
      case "Declining":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="space-y-6" id="price-search-tab">
      {/* Search Header Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm" id="search-card">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            {language === "hinglish" ? "Har Chij Ka Price Pata Karein" : t.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Input Control bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3"
          id="search-form"
        >
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold transition placeholder:text-slate-400 text-base shadow-inner bg-slate-50/50"
              required
              id="search-input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 text-base cursor-pointer shrink-0"
            id="search-submit-btn"
          >
            <span>{loading ? t.searching : t.searchBtn}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Hint helper */}
        <p className="text-center text-[11px] text-slate-400 mt-3 font-semibold flex items-center justify-center space-x-1">
          <HelpCircle size={12} />
          <span>{t.helpHint}</span>
        </p>

        {/* Popular Searches Presets */}
        {!loading && !result && (
          <TrendingList 
            language={language} 
            onSelect={(selectedQuery) => {
              setQuery(selectedQuery);
              handleSearch(selectedQuery);
            }} 
          />
        )}
      </div>

      {/* Loading Block */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px] space-y-6" id="search-loading-container">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 font-bold">
              AI
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900 animate-pulse">
              {t.searching}
            </h3>
            <p className="text-sm text-slate-400 font-semibold max-w-md transition-all duration-300">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        </div>
      )}

      {/* Error state display */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-900 max-w-2xl mx-auto space-y-3" id="search-error-container">
          <AlertTriangle className="mx-auto text-red-500" size={36} />
          <p className="font-extrabold">{language === "hinglish" ? "Kuch Gadbad Ho Gayi!" : "Error Loading Prices"}</p>
          <p className="text-xs font-semibold text-red-700 bg-white/60 p-3 rounded-xl border border-red-200">
            {error.includes("GEMINI_API_KEY") ? t.unconfiguredApiKey : error}
          </p>
        </div>
      )}

      {/* Pricing Data Results Block */}
      {result && !loading && (
        <div className="space-y-6" id="price-result-wrapper">
          {/* Main Pricing Core card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="core-result-card">
            {/* Header with Title and Watchlist controls */}
            <div className="px-6 py-6 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                  {language === "hinglish" ? "DHOONDHA GAYA DAAM" : "VERIFIED PRICING INDEX"}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {result.itemName}
                </h3>
              </div>
              <button
                onClick={() => onAddToWatchlist(result)}
                className={`flex items-center space-x-1.5 px-4.5 py-2.5 rounded-2xl font-bold text-sm transition active:scale-95 cursor-pointer border ${
                  watchlistIds.includes(result.itemName)
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-900 hover:bg-slate-800 text-white border-transparent shadow-md"
                }`}
                id="add-watchlist-btn"
              >
                {watchlistIds.includes(result.itemName) ? (
                  <>
                    <CheckCircle size={16} />
                    <span>{t.watchlistAdded}</span>
                  </>
                ) : (
                  <>
                    <Bell size={16} className="animate-bounce" />
                    <span>{t.watchlistAdd}</span>
                  </>
                )}
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Core metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="metrics-grid">
                {/* Average Sahi Price Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.fairPrice}</span>
                  <div className="my-2.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {currencySymbol}{result.avgPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500 ml-1.5">{result.currency}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {language === "hinglish" 
                      ? "Yeh is chij ka sabse santulit aur sahi market rate hai."
                      : "This represents the calculated balanced market rate globally."}
                  </p>
                </div>

                {/* Value Score Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.valueScore}</span>
                  <div className="my-3 flex items-center space-x-2">
                    <span className={`px-4 py-1.5 rounded-xl text-sm font-extrabold border ${getScoreColor(result.valueScore)}`}>
                      {result.valueScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {language === "hinglish"
                      ? `Abhi kharidne par iska paisa-vasool rating: ${result.valueScore}`
                      : `The calculated rating of value-for-money at current price indices.`}
                  </p>
                </div>

                {/* Market Trend Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.marketTrend}</span>
                  <div className="my-3 flex items-center space-x-2">
                    <span className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-sm font-extrabold border ${getTrendColor(result.marketTrend)}`}>
                      {getTrendIcon(result.marketTrend)}
                      <span>{result.marketTrend}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {language === "hinglish"
                      ? `Is item ka daam market mein abhi: ${result.marketTrend === "Rising" ? "Badh raha hai" : result.marketTrend === "Declining" ? "Ghat raha hai" : "Sthir (Stable) hai"}`
                      : `The price direction in retail spaces is currently ${result.marketTrend.toLowerCase()}.`}
                  </p>
                </div>
              </div>

              {/* Graphical Speedometer Gauge of Price Range */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-4" id="price-gauge-wrapper">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  <span>{t.priceRange}</span>
                </div>

                <div className="relative pt-2">
                  {/* Gauge bar */}
                  <div className="h-3.5 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 rounded-full shadow-inner relative">
                    {/* Mark for Average Price */}
                    <div 
                      className="absolute w-1 h-6 bg-slate-900 top-1/2 -translate-y-1/2"
                      style={{ 
                        left: `${((result.avgPrice - result.priceMin) / (result.priceMax - result.priceMin || 1)) * 100}%` 
                      }}
                      title="Average Fair Price"
                    />
                  </div>

                  {/* Marker Labels */}
                  <div className="flex items-center justify-between mt-3 text-xs sm:text-sm font-extrabold">
                    <div className="text-left text-emerald-600">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">{language === "hinglish" ? "Saste se Sasta" : "Lowest Estimate"}</span>
                      <span>{currencySymbol}{result.priceMin.toLocaleString()}</span>
                    </div>
                    <div className="text-center text-slate-800 bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-100">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">{language === "hinglish" ? "Average Daam" : "Fair Average"}</span>
                      <span>{currencySymbol}{result.avgPrice.toLocaleString()}</span>
                    </div>
                    <div className="text-right text-red-600">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">{language === "hinglish" ? "Mehnge se Mehnga" : "Highest Estimate"}</span>
                      <span>{currencySymbol}{result.priceMax.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Block */}
              <div className="prose max-w-none border-t border-slate-50 pt-6" id="product-description">
                <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed">
                  {result.description}
                </p>
              </div>

              {/* Dynamic Recharts Price Trend History Chart */}
              {result.trendHistory && result.trendHistory.length > 0 && (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-4" id="historical-chart-box">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <History size={16} className="text-emerald-500" />
                    <span>{t.chartTitle}</span>
                  </h4>

                  <TrendChart
                    trendHistory={result.trendHistory}
                    currencySymbol={currencySymbol}
                    language={language}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pros and Cons Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="pros-cons-section">
            {/* Pros box */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-xl inline-flex items-center space-x-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>{t.prosTitle}</span>
              </h4>
              <ul className="space-y-3 pt-2" id="pros-list">
                {result.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-slate-700 font-semibold leading-relaxed">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons box */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-amber-800 bg-amber-50 border border-amber-100 px-3.5 py-1.5 rounded-xl inline-flex items-center space-x-2">
                <AlertTriangle size={18} className="text-amber-600" />
                <span>{t.consTitle}</span>
              </h4>
              <ul className="space-y-3 pt-2" id="cons-list">
                {result.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-slate-700 font-semibold leading-relaxed">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">!</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed breakdown factors & Buying tips section */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6" id="pricing-details-tips">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Factors Column */}
              <div className="space-y-4">
                <h4 className="text-lg font-extrabold text-slate-900 border-l-4 border-emerald-500 pl-3">
                  {t.breakdownTitle}
                </h4>
                <ul className="space-y-2.5 pt-1">
                  {result.breakdown.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-600 font-semibold leading-relaxed flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buying Hacks Column */}
              <div className="space-y-4">
                <h4 className="text-lg font-extrabold text-slate-900 border-l-4 border-emerald-500 pl-3">
                  {t.tipsTitle}
                </h4>
                <div className="space-y-3">
                  {result.buyingTips.map((tip, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start space-x-3">
                      <div className="bg-emerald-50 text-emerald-600 p-1 rounded-lg shrink-0 mt-0.5">
                        <Lightbulb size={16} />
                      </div>
                      <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Smarter Alternatives & Where to buy Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="alternatives-buy-section">
            {/* Sasta Alternatives */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Star className="text-yellow-400 fill-yellow-400" size={18} />
                <span>{t.alternativesTitle}</span>
              </h4>
              <div className="grid grid-cols-1 gap-3 pt-2" id="alternatives-list">
                {result.alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-800">{alt.name}</span>
                    <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl">
                      ~ {alt.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Where to buy / Subscriptions list */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <ShoppingBag className="text-emerald-500" size={18} />
                <span>{t.whereToBuyTitle}</span>
              </h4>
              <div className="flex flex-wrap gap-2 pt-2" id="where-to-buy-list">
                {result.whereToBuy.map((retailer, idx) => (
                  <span key={idx} className="text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl">
                    {retailer}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Google Grounding Sources (Actual Live Links!) */}
          {sources.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-3" id="verified-sources">
              <div className="border-b border-slate-50 pb-3">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <ExternalLink size={16} className="text-blue-500" />
                  <span>{t.sourcesTitle}</span>
                </h4>
                <p className="text-xs text-slate-400 font-medium">{t.sourcesSubtitle}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1" id="sources-grid">
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

      {/* Recent searches history tray */}
      {searchHistory.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3" id="recent-history-box">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {t.historyTitle}
            </h4>
            <button
              onClick={onClearHistory}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
            >
              {t.clearHistory}
            </button>
          </div>
          <div className="flex flex-wrap gap-2" id="history-items-row">
            {searchHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setQuery(item.query);
                  handleSearch(item.query);
                }}
                className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
