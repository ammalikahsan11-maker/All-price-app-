import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize Gemini Client lazy
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in the Secrets panel in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback model router to bypass quota limits (e.g. Google Search Grounding rate-limits)
async function generateGeminiContentWithFallback(
  prompt: string,
  systemInstruction: string,
  responseSchema: any,
  useSearch: boolean = true
) {
  const ai = getGeminiClient();
  
  // Try models with or without search grounding successively
  const attempts = [];
  if (useSearch) {
    attempts.push({ model: "gemini-3.5-flash", search: true });
    attempts.push({ model: "gemini-3.1-flash-lite", search: true });
  }
  attempts.push({ model: "gemini-3.5-flash", search: false });
  attempts.push({ model: "gemini-3.1-flash-lite", search: false });

  let lastError: any = null;

  for (const attempt of attempts) {
    try {
      console.log(`Trying Gemini with model: ${attempt.model}, search: ${attempt.search}`);
      const config: any = {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2
      };
      
      if (attempt.search) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: attempt.model,
        contents: prompt,
        config
      });

      if (response && response.text) {
        return {
          text: response.text,
          modelUsed: attempt.model,
          searchUsed: attempt.search,
          response
        };
      }
    } catch (err: any) {
      const isQuotaError = (err.message || "").toLowerCase().includes("quota") || (err.message || "").toLowerCase().includes("limit") || err.status === "RESOURCE_EXHAUSTED";
      if (isQuotaError) {
        console.log(`[Backup Route] ${attempt.model} (search: ${attempt.search}) temporarily skipped due to quota limit.`);
      } else {
        console.log(`[Backup Route] ${attempt.model} (search: ${attempt.search}) currently skipped: ${err.message || "Unknown error"}`);
      }
      lastError = err;
      
      // Stop trying other models if it is a credential error
      const errMsg = (err.message || "").toLowerCase();
      if (errMsg.includes("key is missing") || errMsg.includes("invalid api key") || errMsg.includes("api_key")) {
        throw err;
      }
    }
  }

  throw lastError || new Error("All fallback models exhausted");
}

// -----------------------------------------------------------------------------
// HEURISTIC LOCAL BACKUP GENERATOR (To guarantee uninterrupted offline/quota experience)
// -----------------------------------------------------------------------------
function generateLocalSearchFallback(query: string, currency: string, language: string) {
  const q = query.toLowerCase();
  let basePrice = 15000;
  let name = query;

  if (q.includes("iphone") || q.includes("pro max")) {
    name = "Apple iPhone Pro Max Series";
    basePrice = currency === "INR" ? 140000 : 1300;
  } else if (q.includes("samsung") || q.includes("ultra")) {
    name = "Samsung Galaxy Ultra Series";
    basePrice = currency === "INR" ? 124000 : 1200;
  } else if (q.includes("gold") || q.includes("sona")) {
    name = "24K Gold (10 Grams)";
    basePrice = currency === "INR" ? 75000 : 720;
  } else if (q.includes("silver") || q.includes("chandi")) {
    name = "Pure Silver (1 KG)";
    basePrice = currency === "INR" ? 82000 : 950;
  } else if (q.includes("netflix") || q.includes("subscription")) {
    name = "Premium Streaming Subscription (Monthly)";
    basePrice = currency === "INR" ? 649 : 15;
  } else if (q.includes("rent") || q.includes("flat") || q.includes("bhk")) {
    name = "1 BHK Rental Flat (Premium Locality)";
    basePrice = currency === "INR" ? 25000 : 800;
  } else if (q.includes("petrol") || q.includes("fuel")) {
    name = "1 Litre Petrol / Gas";
    basePrice = currency === "INR" ? 104 : 1.2;
  } else if (q.includes("haircut") || q.includes("salon")) {
    name = "Professional Haircut & Styling";
    basePrice = currency === "INR" ? 350 : 25;
  } else {
    let hash = 0;
    for (let i = 0; i < q.length; i++) {
      hash = q.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = Math.abs(hash);
    basePrice = (val % 1500) + 15;
    if (currency === "INR") basePrice *= 40;
  }

  const min = Math.round(basePrice * 0.85);
  const max = Math.round(basePrice * 1.2);
  const avg = Math.round(basePrice);

  const isHinglish = language === "hinglish";

  return {
    itemName: name,
    currency: currency,
    avgPrice: avg,
    priceMin: min,
    priceMax: max,
    valueScore: "Fair Price",
    marketTrend: "Stable",
    description: isHinglish 
      ? `[⚠️ Quota Alert: Showing Local Estimate] ${name} ki estimated market price lagbhag ${currency} ${avg.toLocaleString()} hai. Aapke API account mein call limits / rate limits reach ho chuki hain, isliye yeh backup data dikhaya ja raha hai.`
      : `[⚠️ Quota Alert: Showing Local Estimate] The estimated market price of ${name} is around ${currency} ${avg.toLocaleString()}. Your Gemini API quota limit has been temporarily reached, so local calculated estimate is served.`,
    breakdown: isHinglish ? [
      "Tax aur regional rates isme shaamil ho sakte hain.",
      "Alag alag cities aur local sellers ke hisab se rate thoda badal sakta hai."
    ] : [
      "Includes regional taxes and standard dealer retail markups.",
      "Prices fluctuate marginally based on merchant rates and state taxes."
    ],
    pros: isHinglish ? [
      "Dekhne mein solid aur market mein kaafi popular choice hai.",
      "User feedback aur reliability badhiya hai."
    ] : [
      "Consistently high popularity index and product life.",
      "Positive standard customer reviews and solid manufacturer build."
    ],
    cons: isHinglish ? [
      "Bina credit card offer ke thoda premium daam lag sakta hai."
    ] : [
      "Can feel slightly costly without custom store discounts."
    ],
    alternatives: [
      { name: `${name} (Refurbished / Pre-owned)`, price: `${currency} ${(avg * 0.65).toLocaleString()} - ${(avg * 0.8).toLocaleString()}` },
      { name: `Budget-friendly alternative brand`, price: `${currency} ${(avg * 0.45).toLocaleString()}` }
    ],
    buyingTips: isHinglish ? [
      "Online festival discount ya bank card offers ka upyog karke aur paisa bacha sakte hain.",
      "Kharidne se pehle do teen shopping apps par prices confirm zaroor karein."
    ] : [
      "Utilize bank credit card discounts or online sales to save up to 10%.",
      "We recommend checking multiple retail applications before finalizing."
    ],
    whereToBuy: isHinglish ? [
      "Amazon India", "Flipkart", "Official Brand Outlets", "Local Retail Markets"
    ] : [
      "Amazon", "BestBuy", "Authorized Local Retailers", "Direct Brand Site"
    ],
    trendHistory: [
      { period: isHinglish ? "6 Mahine Pehle" : "6 Months Ago", price: Math.round(avg * 0.92) },
      { period: isHinglish ? "3 Mahine Pehle" : "3 Months Ago", price: Math.round(avg * 0.96) },
      { period: isHinglish ? "Abhi" : "Current", price: avg },
      { period: isHinglish ? "Aane Wala" : "Expected", price: Math.round(avg * 1.04) }
    ]
  };
}

function generateLocalCompareFallback(itemA: string, itemB: string, currency: string, language: string) {
  const isHinglish = language === "hinglish";
  
  return {
    comparisonText: isHinglish
      ? `[⚠️ Quota Alert: Showing Local Comparison] Humne "${itemA}" aur "${itemB}" ko high-level standard features aur segment rates par compare kiya hai. Donon hi apne segment mein behtareen hain par inke average market rates mein badlaav ho sakta hai.`
      : `[⚠️ Quota Alert: Showing Local Comparison] High-level overview of "${itemA}" vs "${itemB}". Both offer strong practical applications in their pricing brackets.`,
    recommendation: isHinglish
      ? `Agar aapka budget behtar hai toh premium build ke liye "${itemA}" select karein, par agar aap paisa bachana chahte hain toh "${itemB}" ek sasta aur solid alternative hai.`
      : `If you prioritize premium attributes, "${itemA}" is the recommended route. If you want maximum cost efficiency, "${itemB}" offers a superior alternative.`,
    itemADetails: {
      name: itemA,
      priceRange: `${currency} Est. Price`,
      pros: isHinglish ? ["Solid build aur premium quality", "Behtar customer reliability"] : ["Solid premium build quality", "Consistent user ratings"],
      cons: isHinglish ? ["Daam thoda zyada hai"] : ["Premium cost markup"],
      valueRating: "Good Value"
    },
    itemBDetails: {
      name: itemB,
      priceRange: `${currency} Est. Price`,
      pros: isHinglish ? ["Budget friendly price", "Vasta features"] : ["Highly cost-effective", "Strong utilitarian aspects"],
      cons: isHinglish ? ["Kuch premium features miss ho sakte hain"] : ["Lacks top-tier brand premium"],
      valueRating: "High Value"
    }
  };
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Price Search API
app.post("/api/search", async (req, res) => {
  const { query, currency = "INR", language = "hinglish" } = req.body;
  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Search query is required." });
  }

  try {
    const systemInstruction = `You are a professional, accurate real-world pricing assistant and valuation expert.
Your goal is to search and determine the real current price or estimated cost of any item, service, subscription, commodity, or real estate project.
Use your tools, especially Google Search Grounding, to fetch current real-world pricing data.
Always convert the estimated prices accurately into the target currency: "${currency}".
Respond strictly in JSON matching the requested schema.

If the user sets language = "hinglish", write the "description", "breakdown", "buyingTips", "pros", and "cons" in natural, friendly Hindi-Hinglish (Hindi written in Roman script, e.g., "Apple iPhone 16 Pro Max India mein lagbhag ₹1,44,900 ke price par launch hua hai. Yeh ek premium phone hai jismein dynamic island aur naya A18 chip milta hai.").
If the user sets language = "english", write the text in clear, professional English.`;

    const prompt = `Find current realistic and fair prices for the query: "${query}".
Convert all calculations and price ranges to the currency: "${currency}".
Deliver the response in JSON complying with the requested schema. Ensure the fields values are highly informative, descriptive, and accurate based on latest market research.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        itemName: { type: Type.STRING, description: "Official/recognized name of the searched product, service, or commodity." },
        currency: { type: Type.STRING, description: "The currency code used (e.g. INR, USD)." },
        avgPrice: { type: Type.NUMBER, description: "Average or fair-market price as a single numeric value." },
        priceMin: { type: Type.NUMBER, description: "Minimum estimated market price." },
        priceMax: { type: Type.NUMBER, description: "Maximum estimated market price." },
        valueScore: { 
          type: Type.STRING, 
          enum: ["Great Deal", "Fair Price", "Expensive", "Overpriced"],
          description: "Value assessment for the price."
        },
        marketTrend: {
          type: Type.STRING,
          enum: ["Declining", "Stable", "Rising"],
          description: "Current market direction/trend of this item's price."
        },
        description: { 
          type: Type.STRING, 
          description: "Brief detailed introduction and summary in the selected language (Hinglish or English)." 
        },
        breakdown: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of details explaining the pricing factors, variations, taxes, or specifications."
        },
        pros: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key advantages or why it is worth this price."
        },
        cons: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Disadvantages or factors that make it less value-for-money."
        },
        alternatives: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the alternative item or option." },
              price: { type: Type.STRING, description: "Estimated price range of the alternative." }
            },
            required: ["name", "price"]
          },
          description: "List of other relevant products or options at similar or better prices."
        },
        buyingTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Smart hacks, online deals, or seasonal advice to save money."
        },
        whereToBuy: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Popular places, websites (like Amazon, Flipkart, local retailers, etc.), or offline stores to purchase."
        },
        trendHistory: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              period: { type: Type.STRING, description: "Period labels like '6 Months Ago', '3 Months Ago', 'Current', 'Expected' or monthly names." },
              price: { type: Type.NUMBER, description: "Estimated price value during that period in the target currency." }
            },
            required: ["period", "price"]
          },
          description: "Historical price trend sequence of 4-6 data points to draw a chart."
        }
      },
      required: [
        "itemName", "currency", "avgPrice", "priceMin", "priceMax", 
        "valueScore", "marketTrend", "description", "breakdown", 
        "pros", "cons", "alternatives", "buyingTips", "whereToBuy", "trendHistory"
      ]
    };

    const fallbackResult = await generateGeminiContentWithFallback(
      prompt,
      systemInstruction,
      responseSchema,
      true // Try search grounding first
    );

    const parsedData = JSON.parse(fallbackResult.text.trim());

    // Extract search grounding metadata if available to supply actual links
    const chunks = fallbackResult.response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks ? chunks.map((c: any) => ({
      title: c.web?.title || "Market Source",
      url: c.web?.uri || "#"
    })).filter((s: any) => s.url !== "#") : [];

    // Deduplicate sources
    const uniqueSources = sources.filter((value: any, index: number, self: any[]) =>
      self.findIndex((t) => t.url === value.url) === index
    ).slice(0, 5);

    res.json({
      data: parsedData,
      sources: uniqueSources
    });

  } catch (error: any) {
    console.log("[Backup Mode] Loading local heuristic backup data due to connection or quota limits.");
    
    // Check if error is due to completely missing API key
    const errorText = (error.message || "").toLowerCase();
    if (errorText.includes("variable is missing") || errorText.includes("api_key") || errorText.includes("secrets panel")) {
      return res.status(500).json({ error: error.message });
    }

    // Serve gorgeous responsive mock fallback
    const fallbackData = generateLocalSearchFallback(query, currency, language);
    res.json({
      data: fallbackData,
      sources: [
        { title: "Standard Market Estimate (Local Backup)", url: "#" }
      ]
    });
  }
});

// Price Comparison API
app.post("/api/compare", async (req, res) => {
  const { itemA, itemB, currency = "INR", language = "hinglish" } = req.body;
  if (!itemA || !itemB) {
    return res.status(400).json({ error: "Both items are required for comparison." });
  }

  try {
    const systemInstruction = `You are a detailed market analyst and price-comparison expert.
Compare item "${itemA}" and item "${itemB}" comprehensively.
Convert all pricing information to target currency "${currency}".
Analyze cost-to-performance ratio, specs, advantages, disadvantages, and provide a clear final recommendation.

If language = "hinglish", write the descriptions, pros, cons, comparisonText and recommendation in a natural, direct Hinglish dialect (Hindi words in Roman script).
If language = "english", write it in professional clear English.`;

    const prompt = `Compare "${itemA}" vs "${itemB}" in target currency "${currency}". Keep it accurate and structured according to the requested JSON schema.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        comparisonText: { type: Type.STRING, description: "Detailed summary contrasting both products or services, explaining key differences." },
        recommendation: { type: Type.STRING, description: "Final expert verdict on which option is better value-for-money and why." },
        itemADetails: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            priceRange: { type: Type.STRING, description: "Estimated price range in target currency." },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            valueRating: { type: Type.STRING, description: "Value rating (e.g., 'Excellent Value', 'Average', 'Overpriced')." }
          },
          required: ["name", "priceRange", "pros", "cons", "valueRating"]
        },
        itemBDetails: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            priceRange: { type: Type.STRING, description: "Estimated price range in target currency." },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            valueRating: { type: Type.STRING, description: "Value rating (e.g., 'Excellent Value', 'Average', 'Overpriced')." }
          },
          required: ["name", "priceRange", "pros", "cons", "valueRating"]
        }
      },
      required: ["comparisonText", "recommendation", "itemADetails", "itemBDetails"]
    };

    const fallbackResult = await generateGeminiContentWithFallback(
      prompt,
      systemInstruction,
      responseSchema,
      true
    );

    const parsedData = JSON.parse(fallbackResult.text.trim());

    // Extract grounding sources
    const chunks = fallbackResult.response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks ? chunks.map((c: any) => ({
      title: c.web?.title || "Market Source",
      url: c.web?.uri || "#"
    })).filter((s: any) => s.url !== "#") : [];

    const uniqueSources = sources.filter((value: any, index: number, self: any[]) =>
      self.findIndex((t) => t.url === value.url) === index
    ).slice(0, 5);

    res.json({
      data: parsedData,
      sources: uniqueSources
    });

  } catch (error: any) {
    console.log("[Backup Mode] Loading local heuristic comparison due to connection or quota limits.");
    
    const errorText = (error.message || "").toLowerCase();
    if (errorText.includes("variable is missing") || errorText.includes("api_key") || errorText.includes("secrets panel")) {
      return res.status(500).json({ error: error.message });
    }

    const fallbackData = generateLocalCompareFallback(itemA, itemB, currency, language);
    res.json({
      data: fallbackData,
      sources: [
        { title: "Standard Comparison (Local Backup)", url: "#" }
      ]
    });
  }
});

// -----------------------------------------------------------------------------
// Vite and Static File Server Configuration
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
