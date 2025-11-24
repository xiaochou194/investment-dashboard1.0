import React from 'react';
import { NewsItem } from '../types';
import { Newspaper } from 'lucide-react';

interface NewsTickerProps {
  news: NewsItem[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  return (
    <div className="bg-cardBg rounded-lg shadow-lg border border-slate-700 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <Newspaper className="text-blue-400" size={20} />
        <h2 className="text-lg font-bold text-white">实时快讯 (Global News)</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto news-scroll p-4 space-y-4 max-h-[400px]">
        {news.length === 0 ? (
          <div className="text-slate-500 text-center py-4">暂无新闻数据...</div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="group">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-16 text-xs text-slate-400 pt-1 font-mono">
                  {item.time}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200 group-hover:text-white transition-colors leading-relaxed">
                    {item.title}
                  </p>
                  <span className="text-xs text-slate-500 mt-1 block">
                    来源: {item.source}
                  </span>
                </div>
              </div>
              <div className="h-px bg-slate-800 mt-3 w-full" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsTicker;