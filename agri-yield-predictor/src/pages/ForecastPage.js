import React from 'react';
import { Container } from 'react-bootstrap';
import SimpleForecast from '../components/SimpleForecast/SimpleForecast';

const ForecastPage = () => {
  // Mock data - replace with actual data from your state/API
  const mockForecastData = [
    {
      date: new Date().toISOString().split('T')[0],
      yield: 7.5,
      confidence_lower: 7.0,
      confidence_upper: 8.0
    },
    {
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      yield: 7.6,
      confidence_lower: 7.1,
      confidence_upper: 8.1
    },
    {
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      yield: 7.7,
      confidence_lower: 7.2,
      confidence_upper: 8.2
    }
  ];

  return (
    <Container className="mt-4">
      <SimpleForecast 
        forecastData={mockForecastData}
        cropType="Wheat"
        showResults={mockForecastData.length > 0}
      />
    </Container>
  );
};

export default ForecastPage;
