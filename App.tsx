import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { MarketData, NewsItem, CalendarEvent, DashboardState } from './types';
import { fetchDashboardData } from './services/geminiService';
import MarketCard from './components/MarketCard';
import NewsTicker from './components/NewsTicker';
import EconomicCalendar from './components/EconomicCalendar';

const App: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    marketData: [],
    news: [],
    events: [],
    lastUpdated: null,
    isLoading: true,
    error: null,
  });

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetchDashboardData();
      setState({
        marketData: data.marketData,
        news: data.news,
        events: data.events,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "数据更新失败，请检查网络或 API Key (Failed to update data)",
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      loadData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [loadData]);

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-marketRed to-purple-600 p-2 rounded-lg shadow-lg">
            <Activity className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">全球投资指挥中心</h1>
            <p className="text-slate-400 text-sm">Global Investment Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-500">上次更新 (Last Updated)</p>
            <p className="font-mono text-sm text-emerald-400">
              {state.lastUpdated ? state.lastUpdated.toLocaleTimeString('zh-CN') : '--:--:--'}
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={state.isLoading}
            className={`p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-600 ${state.isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:rotate-180'}`}
            title="Refresh Data"
          >
            <RefreshCw size={20} className={state.isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* Error Message */}
        {state.error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} />
            <span>{state.error}</span>
          </div>
        )}

        {/* Market Indicators Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white border-l-4 border-marketRed pl-3">
              核心市场行情 (Key Indicators)
            </h2>
          </div>
          
          {state.isLoading && state.marketData.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-pulse">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {state.marketData.map((data) => (
                <MarketCard key={data.symbol} data={data} />
              ))}
            </div>
          )}
        </section>

        {/* News & Calendar Split View */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
          {/* News Ticker (Left/Top) */}
          <div className="lg:col-span-8 h-full">
            <NewsTicker news={state.news} />
          </div>

          {/* Economic Calendar (Right/Bottom) */}
          <div className="lg:col-span-4 h-full">
            <EconomicCalendar events={state.events} />
          </div>
        </section>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 text-center text-slate-500 text-xs">
        <p>数据来源：Google Search Grounding (AI 聚合) | 仅供参考，不作为投资建议</p>
        <p className="mt-1">Powered by Gemini API & React</p>
      </footer>
    </div>
  );
};

export default App;