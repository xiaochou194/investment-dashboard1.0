import React from 'react';
import { MarketData } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketCardProps {
  data: MarketData;
}

const MarketCard: React.FC<MarketCardProps> = ({ data }) => {
  // Chinese Market Convention: Red = Rise, Green = Fall
  const colorClass = data.isUp ? 'text-marketRed' : 'text-marketGreen';
  const Icon = data.isUp ? TrendingUp : TrendingDown;
  
  // Clean formatting
  const formattedPrice = data.price;
  const formattedPercent = data.changePercent.includes('%') ? data.changePercent : `${data.changePercent}%`;

  return (
    <div className="bg-cardBg p-4 rounded-lg shadow-lg border border-slate-700 hover:border-slate-500 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-400 text-sm font-medium">{data.name}</h3>
        <span className="text-xs text-slate-500">{data.symbol}</span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${colorClass}`}>
          {formattedPrice}
        </span>
      </div>
      
      <div className={`flex items-center gap-1 text-sm font-semibold mt-1 ${colorClass}`}>
        <Icon size={16} />
        <span>{data.change}</span>
        <span>({formattedPercent})</span>
      </div>
      
      <div className="mt-2 text-xs text-slate-600 flex justify-end">
        {data.timestamp} 更新
      </div>
    </div>
  );
};

export default MarketCard;