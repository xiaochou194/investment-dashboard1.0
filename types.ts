export interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isUp: boolean;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  time: string;
  title: string;
  source: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface DashboardState {
  marketData: MarketData[];
  news: NewsItem[];
  events: CalendarEvent[];
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}