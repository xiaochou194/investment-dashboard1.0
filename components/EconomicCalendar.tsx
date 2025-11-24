import React from 'react';
import { CalendarEvent } from '../types';
import { CalendarDays, AlertCircle } from 'lucide-react';

interface EconomicCalendarProps {
  events: CalendarEvent[];
}

const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ events }) => {
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-900 text-red-200 border-red-700';
      case 'medium': return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="bg-cardBg rounded-lg shadow-lg border border-slate-700 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <CalendarDays className="text-purple-400" size={20} />
        <h2 className="text-lg font-bold text-white">财经日历 (Economic Calendar)</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto news-scroll p-4">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
            <tr>
              <th className="px-2 py-3">时间</th>
              <th className="px-2 py-3">事件</th>
              <th className="px-2 py-3 text-center">重要性</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {events.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-2 py-4 text-center text-slate-500">
                  暂无日历数据...
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-2 py-3 text-slate-300 font-mono text-xs whitespace-nowrap">
                    <div>{event.date}</div>
                    <div className="text-slate-500">{event.time}</div>
                  </td>
                  <td className="px-2 py-3 font-medium text-slate-200">
                    {event.event}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getImpactColor(event.impact)}`}>
                      {event.impact === 'High' ? '高' : event.impact === 'Medium' ? '中' : '低'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EconomicCalendar;