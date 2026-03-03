
export interface TrendDataPoint {
  period: string;
  interestLevel: number;
}

export interface AnalysisResult {
  productName: string;
  location: string;
  priceRange: string;
  demandScore: number; // 0-100
  saturationLevel: 'Low' | 'Medium' | 'High';
  competitionLevel: 'Low' | 'Medium' | 'High';
  timingStatus: 'Early' | 'On-time' | 'Late';
  recommendation: 'GO' | 'BE CAREFUL' | 'AVOID';
  explanation: string;
  chatResponse: string; // The conversational summary for the chat bubble
  trendData: TrendDataPoint[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface AnalysisHistoryItem extends AnalysisResult {
  id: string;
  userQuestion: string;
  createdDate: Date;
}

export interface SubscriptionState {
  credits: number;
  expiryDate: string | null; // ISO Date string
  isPremium: boolean;
}
