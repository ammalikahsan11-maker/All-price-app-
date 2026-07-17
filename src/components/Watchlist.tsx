import React, { useState } from "react";
import { 
  Bell, 
  Trash2, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  TrendingDown, 
  TrendingUp, 
  Check, 
  AlertCircle,
  PiggyBank
} from "lucide-react";
import { translations } from "../translations";
import { WatchlistItem, ProductDetails } from "../types";
import { TrendChart } from "./TrendChart";

interface WatchlistProps {
  language: "en" | "hinglish";
  currency: string;
  currencySymbol: string;
  watchlist: WatchlistItem[];
  onRemove: (id: string) => void;
  onUpdateTargetPrice: (id: string, targetPrice: number) => void;
  onRefreshItem: (id: string, currentDetails: ProductDetails) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  language,
  currency,
  currencySymbol,
  watchlist,
  onRemove,
  onUpdateTargetPrice,
  onRefreshItem
}) => {
  const t = translations[language];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTarget, setTempTarget] = useState("");
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSaveTarget = (id: string) => {
    const numericValue = parseFloat(tempTarget);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onUpdateTargetPrice(id, numericValue);
    }
    setEditingId(null);
    setTempTarget("");
  };

  const handleRefresh = async (item: WatchlistItem) => {
    setRefreshingId(item.id);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: item.query,
          currency,
          language
        })
      });

      const json = await response.json();
      if (response.ok && json.data) {
        onRefreshItem(item.id, json.data);
      }
    } catch (err) {
      console.error("Failed to refresh watchlist item", err);
    } finally {
      setRefreshingId(null);
    }
  };

  // Determine status message for alert threshold
  const getAlertStatus = (item: WatchlistItem) => {
    if (!item.targetPrice || !item.lastDetails) return null;
    const current = item.lastDetails.avgPrice;
    const target = item.targetPrice;

    if (current <= target) {
      return {
        text: language === "hinglish" ? "ALERT! Target price se kam daam hai!" : "ALERT! Price is below target threshold!",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        icon: <TrendingDown size={14} className="text-emerald-600 mr-1 animate-bounce" />
      };
    } else {
      return {
        text: language === "hinglish" ? `Sahi daam target se ${currencySymbol}${(current - target).toLocaleString()} zyada hai.` : `Fair price is currently ${currencySymbol}${(current - target).toLocaleString()} above target.`,
        color: "bg-slate-50 text-slate-600 border-slate-200",
        icon: <AlertCircle size={14} className="text-slate-400 mr-1" />
      };
    }
  };

  return (
    <div className="space-y-6" id="watchlist-tab-container">
      {/* Intro box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6" id="watchlist-header">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center md:justify-start space-x-2">
            <Bell size={28} className="text-emerald-500 animate-bounce" />
            <span>{t.watchlistTab}</span>
          </h2>
          <p className="text-slate-500 text-sm font-semibold max-w-xl">
            {language === "hinglish" 
              ? "Apni pasand ki chijon ke daam monitor karein. Target daam set karke alert paien!"
              : "Track and monitor the prices of your favorite items. Set custom target alert prices to save big."}
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 flex items-center space-x-3 shrink-0">
          <PiggyBank size={32} className="text-emerald-600" />
          <div>
            <span className="text-xs uppercase font-extrabold text-emerald-600 block">TOTAL TRACKED</span>
            <span className="text-lg font-black">{watchlist.length} {language === "hinglish" ? "Items Saved" : "Products"}</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[300px] space-y-4" id="watchlist-empty">
          <div className="bg-slate-50 text-slate-300 p-6 rounded-3xl">
            <Bell size={48} />
          </div>
          <p className="text-slate-500 font-extrabold text-lg max-w-md leading-relaxed">
            {t.watchlistEmpty}
          </p>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 gap-4" id="watchlist-items-list">
          {watchlist.map((item) => {
            const status = getAlertStatus(item);
            const isRefreshing = refreshingId === item.id;

            return (
              <div 
                key={item.id} 
                className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-slate-200 transition space-y-4"
                id={`watchlist-item-${item.id}`}
              >
                {/* Row 1: Query & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{item.query}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {language === "hinglish" ? "Added on:" : "Added:"} {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Live Refresh button */}
                    <button
                      onClick={() => handleRefresh(item)}
                      disabled={isRefreshing}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition flex items-center justify-center disabled:opacity-50 cursor-pointer"
                      title="Check current price live"
                      id={`refresh-btn-${item.id}`}
                    >
                      <RefreshCw size={15} className={isRefreshing ? "animate-spin text-emerald-500" : ""} />
                    </button>
                    {/* Delete item button */}
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-2.5 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-500 transition flex items-center justify-center cursor-pointer"
                      title={t.delete}
                      id={`delete-btn-${item.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Row 2: Prices & Alert Setter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {/* Current Fair Price display */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t.currentPrice}</span>
                    <div className="mt-1 flex items-baseline space-x-1">
                      {item.lastDetails ? (
                        <>
                          <span className="text-xl font-black text-slate-900">
                            {currencySymbol}{item.lastDetails.avgPrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{item.currency}</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">
                          {language === "hinglish" ? "Refresh par click karein" : "Click refresh to scan"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Price Alarm */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t.watchTargetPrice}</span>
                    {editingId === item.id ? (
                      <div className="flex items-center space-x-1.5 mt-1">
                        <input
                          type="number"
                          value={tempTarget}
                          onChange={(e) => setTempTarget(e.target.value)}
                          className="w-full px-2.5 py-1 text-sm font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder={`${currencySymbol}1000`}
                          autoFocus
                          id={`target-input-${item.id}`}
                        />
                        <button
                          onClick={() => handleSaveTarget(item.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg transition shrink-0"
                          id={`target-save-${item.id}`}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xl font-black text-slate-950">
                          {item.targetPrice ? `${currencySymbol}${item.targetPrice.toLocaleString()}` : "—"}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setTempTarget(item.targetPrice ? item.targetPrice.toString() : "");
                          }}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline shrink-0"
                          id={`edit-target-btn-${item.id}`}
                        >
                          {item.targetPrice ? "Edit" : t.addAlert}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Market Direction / Alert status */}
                  {item.lastDetails && (
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col justify-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t.marketTrend}</span>
                      <span className="text-sm font-bold text-slate-800 mt-1 flex items-center space-x-1">
                        {item.lastDetails.marketTrend === "Rising" ? (
                          <TrendingUp className="text-red-500" size={16} />
                        ) : item.lastDetails.marketTrend === "Declining" ? (
                          <TrendingDown className="text-emerald-500" size={16} />
                        ) : (
                          <AlertCircle className="text-slate-400" size={16} />
                        )}
                        <span>{item.lastDetails.marketTrend}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Alert Status Banner */}
                {status && (
                  <div className={`border p-3.5 rounded-2xl flex items-center text-xs font-semibold ${status.color}`} id={`alert-banner-${item.id}`}>
                    {status.icon}
                    <span>{status.text}</span>
                  </div>
                )}

                {/* Collapsible details & trend history chart trigger */}
                {item.lastDetails && (
                  <div className="pt-2 border-t border-slate-50 flex justify-end">
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      id={`toggle-expand-${item.id}`}
                    >
                      <span>
                        {expandedId === item.id 
                          ? (language === "hinglish" ? "Details Chhupaein" : "Hide Details & Trend") 
                          : (language === "hinglish" ? "Details aur Trend Dekhein" : "View Details & Trend")}
                      </span>
                      {expandedId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                )}

                {/* Expanded Details Panel with Recharts Line Chart */}
                {expandedId === item.id && item.lastDetails && (
                  <div className="mt-4 p-4.5 bg-slate-50/70 rounded-2xl border border-slate-100/80 space-y-4" id={`expanded-panel-${item.id}`}>
                    {/* Low vs High Price Estimates */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-100 text-left">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {language === "hinglish" ? "Saste se sasta" : "Lowest Estimate"}
                        </span>
                        <span className="text-sm font-black text-emerald-600">
                          {currencySymbol}{item.lastDetails.priceMin.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100 text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {language === "hinglish" ? "Mehnge se mehnga" : "Highest Estimate"}
                        </span>
                        <span className="text-sm font-black text-red-600">
                          {currencySymbol}{item.lastDetails.priceMax.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Brief description */}
                    {item.lastDetails.description && (
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed bg-white/60 p-3 rounded-xl border border-slate-100">
                        {item.lastDetails.description}
                      </p>
                    )}

                    {/* Recharts Price History Line Chart */}
                    {item.lastDetails.trendHistory && item.lastDetails.trendHistory.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          {t.chartTitle}
                        </span>
                        <TrendChart
                          trendHistory={item.lastDetails.trendHistory}
                          currencySymbol={currencySymbol}
                          language={language}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic font-semibold">{t.noChartData}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
