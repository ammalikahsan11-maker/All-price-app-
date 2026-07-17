export interface ProductDetails {
  itemName: string;
  currency: string;
  avgPrice: number;
  priceMin: number;
  priceMax: number;
  valueScore: "Great Deal" | "Fair Price" | "Expensive" | "Overpriced";
  marketTrend: "Declining" | "Stable" | "Rising";
  description: string;
  breakdown: string[];
  pros: string[];
  cons: string[];
  alternatives: {
    name: string;
    price: string;
  }[];
  buyingTips: string[];
  whereToBuy: string[];
  trendHistory: {
    period: string;
    price: number;
  }[];
}

export interface ComparisonResult {
  comparisonText: string;
  recommendation: string;
  itemADetails: {
    name: string;
    priceRange: string;
    pros: string[];
    cons: string[];
    valueRating: string;
  };
  itemBDetails: {
    name: string;
    priceRange: string;
    pros: string[];
    cons: string[];
    valueRating: string;
  };
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  category?: string;
  currency: string;
  avgPrice?: number;
}

export interface WatchlistItem {
  id: string;
  query: string;
  targetPrice?: number;
  currency: string;
  addedAt: number;
  lastDetails?: ProductDetails;
}
