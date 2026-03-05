
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
  chatResponse: string;
  trendData: TrendDataPoint[];
  keyInsights: string[];
  targetDemographic: string;
  bestSellingChannels: string[];
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