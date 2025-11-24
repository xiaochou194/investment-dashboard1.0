import { GoogleGenAI } from "@google/genai";
import { MarketData, NewsItem, CalendarEvent } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize Gemini client
// Note: We create a new instance per call in the components to ensure fresh key if needed, 
// but here we export a helper function.
const getClient = () => new GoogleGenAI({ apiKey: API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to parse code blocks from response
const extractJson = (text: string): any => {
  try {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    // Try to find just the JSON array/object if code block is missing
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response", e);
    return null;
  }
};

export const fetchDashboardData = async (): Promise<{
  marketData: MarketData[];
  news: NewsItem[];
  events: CalendarEvent[];
}> => {
  const ai = getClient();

  const prompt = `
    Role: Financial Data Aggregator for a Chinese Investment Dashboard.
    Task: Retrieve real-time market data, latest financial news (China/US), and upcoming economic events.
    
    1. **Market Data**: Find current price and daily percentage change for:
       - Shanghai Composite (000001.SS)
       - Shenzhen Component (399001.SZ)
       - CBOE VIX (^VIX)
       - Gold Futures (GC=F)
       - Bitcoin (BTC-USD)
       - USD/CNY (CNY=X)
    
    2. **News**: Find 5 latest key financial headlines impacting Chinese or US markets.
    
    3. **Calendar**: Find 3-5 key economic events for this week (e.g., US CPI, Non-Farm, Fed Rates, China GDP, PMI).

    Output Format: Provide a single JSON object inside a \`\`\`json code block.
    Structure:
    {
      "marketData": [
        { "name": "上证指数", "symbol": "000001.SS", "price": "3000.00", "change": "+10.00", "changePercent": "+0.33%" },
        ...
      ],
      "news": [
        { "time": "10:00", "title": "Headline in Chinese", "source": "Source Name" }
      ],
      "events": [
        { "date": "2023-10-27", "time": "20:30", "event": "Event Name in Chinese", "impact": "High" }
      ]
    }
    Ensure all text is in Simplified Chinese.
    For 'changePercent', ensure the sign (+/-) is present.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" // NOT allowed with googleSearch
      },
    });

    const text = response.text || '';
    const data = extractJson(text);

    if (!data) {
      throw new Error("Failed to parse market data.");
    }

    // Process Market Data to add isUp flag logic
    const processedMarketData: MarketData[] = (data.marketData || []).map((item: any) => {
      const changeVal = parseFloat(item.changePercent?.replace('%', '') || '0');
      return {
        ...item,
        isUp: changeVal >= 0, // In China: Red (Up) if >= 0, Green (Down) if < 0
        timestamp: new Date().toLocaleTimeString('zh-CN'),
      };
    });

    const processedNews: NewsItem[] = (data.news || []).map((item: any, index: number) => ({
      ...item,
      id: `news-${index}`,
    }));

    const processedEvents: CalendarEvent[] = (data.events || []).map((item: any, index: number) => ({
      ...item,
      id: `event-${index}`,
    }));

    return {
      marketData: processedMarketData,
      news: processedNews,
      events: processedEvents,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
