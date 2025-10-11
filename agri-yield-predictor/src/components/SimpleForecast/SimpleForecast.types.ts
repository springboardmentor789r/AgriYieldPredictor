export interface ForecastData {
  date: string;
  yield: number;
  confidence_lower: number;
  confidence_upper: number;
}

export interface SimpleForecastProps {
  forecastData: ForecastData[];
  cropType: string;
  showResults: boolean;
}
