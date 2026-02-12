
export interface Business {
  id: string;
  name: string;
  location: string;
  rating: number;
  complaints: string[];
  sources: { title: string; uri: string }[];
}

export interface CompetitorData {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AnalysisReport {
  summary: string;
  recurringThemes: string[];
  competitorAnalysis: CompetitorData[];
  recommendations: string[];
  painPoints: {
    area: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
  }[];
  improvementSteps: {
    step: string;
    impact: string;
    timeline: string;
  }[];
  customerSentiment: {
    category: string;
    score: number; // 0-100
  }[];
  competitorBenchmark: string;
}

export enum AnalysisState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  ERROR = 'ERROR'
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '16:9' | '9:16';
