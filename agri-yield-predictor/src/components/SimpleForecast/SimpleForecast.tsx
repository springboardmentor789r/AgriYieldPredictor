import React from 'react';
import { Card } from 'react-bootstrap';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { format, parseISO } from 'date-fns';
import type { Data, Layout } from 'plotly.js';
import '../../styles/SimpleForecast.css';

// Create Plot component
const Plot = createPlotlyComponent(Plotly);

export interface ForecastData {
  date: string;
  yield: number;
  confidence_lower: number;
  confidence_upper: number;
}

interface SimpleForecastProps {
  forecastData: ForecastData[];
  cropType?: string;
  showResults?: boolean;
}

const SimpleForecast: React.FC<SimpleForecastProps> = ({ 
  forecastData = [], 
  cropType = 'Crop',
  showResults = false 
}) => {
  if (!showResults || !forecastData.length) return null;

  // Create the main line trace
  const mainTrace: Partial<Data> = {
    x: forecastData.map(d => format(parseISO(d.date), 'MMM d')),
    y: forecastData.map(d => d.yield),
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Predicted Yield',
    line: { color: '#4CAF50', width: 3 },
    marker: { size: 8 }
  };

  // Create the confidence interval trace
  const confidenceTrace: Partial<Data> = {
    x: [
      ...forecastData.map(d => format(parseISO(d.date), 'MMM d')), 
      ...forecastData.map(d => format(parseISO(d.date), 'MMM d')).reverse()
    ],
    y: [
      ...forecastData.map(d => d.confidence_upper), 
      ...forecastData.map(d => d.confidence_lower).reverse()
    ],
    type: 'scatter',
    mode: 'lines',
    fill: 'toself',
    fillcolor: 'rgba(76, 175, 80, 0.2)',
    line: { color: 'transparent', width: 0 },
    showlegend: false,
    hoverinfo: 'skip',
    name: 'Confidence Interval'
  };

  const chartData: Partial<Data>[] = [mainTrace, confidenceTrace];

  const chartLayout: Partial<Layout> = {
    title: { 
      text: `${cropType} Yield Forecast`, 
      font: { size: 18 } 
    },
    xaxis: { 
      title: { text: 'Date' }, 
      type: 'category',
      automargin: true
    },
    yaxis: { 
      title: { text: 'Yield (tons/ha)' }, 
      rangemode: 'tozero',
      automargin: true
    },
    showlegend: true,
    height: 400,
    margin: { l: 60, r: 20, b: 60, t: 40, pad: 4 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  return (
    <div className="mt-4">
      <Card className="mb-4">
        <Card.Body>
          <div className="forecast-chart">
            <Plot
              data={chartData}
              layout={chartLayout}
              config={{ displayModeBar: false }}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SimpleForecast;