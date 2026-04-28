//Represents a predictive stock analysis result.
export interface StockPrediction {
  name: string;
  daysLeft: number;
  urgency: 'Critical' | 'Warning';
}

//Encapsulated intelligence data for the analytics dashboard.
export interface StockIntelligence {
  healthScore: number;
  predictions: StockPrediction[];
}
