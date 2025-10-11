import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Card } from 'react-bootstrap';
import { BiHome, BiLineChart } from 'react-icons/bi';
import Plot from 'react-plotly.js';
import './CropPredictionPage.css';

const CropPredictionPage = () => {
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    rainfall: '',
    soilType: '',
    cropType: '',
    weatherCondition: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [forecastDate, setForecastDate] = useState('');
  const [showForecast, setShowForecast] = useState(false);
  const [forecastData, setForecastData] = useState({ dates: [], yields: [] });

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setForecastDate(today);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock prediction logic
      const baseYield = 5.5;
      const tempFactor = 0.9 + (Math.random() * 0.2);
      const rainFactor = 0.9 + (Math.random() * 0.2);
      const humidityFactor = 0.9 + (Math.random() * 0.2);
      
      const predictedYield = (baseYield * tempFactor * rainFactor * humidityFactor).toFixed(2);
      const confidence = Math.floor(85 + Math.random() * 15);
      
      setResult({
        value: predictedYield,
        confidence: confidence
      });
      setLoading(false);
    }, 1500);
  };

  const generateForecast = () => {
    if (!forecastDate) {
      alert('Please select a date for the forecast');
      return;
    }
    
    // Generate 10-day forecast data
    const dates = [];
    const yields = [];
    const startDate = new Date(forecastDate);
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
      
      // Generate realistic yield forecast with some variation
      const baseYield = 5.5;
      const variation = Math.sin(i * 0.5) * 0.8 + (Math.random() - 0.5) * 0.4;
      yields.push(Math.max(2.0, baseYield + variation));
    }
    
    setForecastData({ dates, yields });
    setShowForecast(true);
  };

  return (
    <div className="crop-prediction-page">
      <div className="nav-buttons">
        <a href="/" className="nav-btn">
          <BiHome className="me-1" /> Home
        </a>
        <a href="/arima-forecast" className="nav-btn">
          <BiLineChart className="me-1" /> Go to Forecast
        </a>
      </div>

      <Container fluid>
        <div className="main-container">
          <h1 className="title">🌾 Crop Yield Prediction</h1>
          <p className="subtitle">Enter environmental conditions to predict crop yield</p>
          
          <Row>
            <Col md={{ span: 8, offset: 2 }}>
              <Card className="prediction-form">
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Temperature (°C):</Form.Label>
                          <Form.Control
                            type="number"
                            name="temperature"
                            value={formData.temperature}
                            onChange={handleInputChange}
                            placeholder="e.g., 25"
                            step="0.1"
                            min="-10"
                            max="50"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Humidity (%):</Form.Label>
                          <Form.Control
                            type="number"
                            name="humidity"
                            value={formData.humidity}
                            onChange={handleInputChange}
                            placeholder="e.g., 65"
                            step="0.1"
                            min="0"
                            max="100"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Rainfall (mm):</Form.Label>
                          <Form.Control
                            type="number"
                            name="rainfall"
                            value={formData.rainfall}
                            onChange={handleInputChange}
                            placeholder="e.g., 150"
                            step="0.1"
                            min="0"
                            max="2000"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Soil Type:</Form.Label>
                          <Form.Select
                            name="soilType"
                            value={formData.soilType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">-- Select Soil Type --</option>
                            <option value="Sandy">Sandy</option>
                            <option value="Loamy">Loamy</option>
                            <option value="Clay">Clay</option>
                            <option value="Silt">Silt</option>
                            <option value="Peaty">Peaty</option>
                            <option value="Chalky">Chalky</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Crop Type:</Form.Label>
                          <Form.Select
                            name="cropType"
                            value={formData.cropType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">-- Select Crop Type --</option>
                            <option value="Rice">Rice</option>
                            <option value="Wheat">Wheat</option>
                            <option value="Maize">Maize</option>
                            <option value="Barley">Barley</option>
                            <option value="Sugarcane">Sugarcane</option>
                            <option value="Cotton">Cotton</option>
                            <option value="Jute">Jute</option>
                            <option value="Groundnut">Groundnut</option>
                            <option value="Pulses">Pulses</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Weather Condition:</Form.Label>
                          <Form.Select
                            name="weatherCondition"
                            value={formData.weatherCondition}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">-- Select Weather --</option>
                            <option value="Sunny">Sunny</option>
                            <option value="Cloudy">Cloudy</option>
                            <option value="Rainy">Rainy</option>
                            <option value="Stormy">Stormy</option>
                            <option value="Foggy">Foggy</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className="text-center mt-4">
                      <Button 
                        type="submit" 
                        className="predict-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Predicting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-lightning-charge me-2"></i>
                            Predict Yield
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                  
                  {loading && (
                    <div className="text-center my-4">
                      <Spinner animation="border" variant="success" />
                      <p className="mt-2">Analyzing conditions and predicting yield...</p>
                    </div>
                  )}
                  
                  {result && (
                    <div className="result-card">
                      <h3>Predicted Crop Yield</h3>
                      <div className="result-value">{result.value}</div>
                      <div className="result-label">Tons per Hectare</div>
                      <div className="mt-3">
                        <small>Confidence: {result.confidence}%</small>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Forecast Section */}
          <Row className="mt-4">
            <Col md={{ span: 8, offset: 2 }}>
              <Card className="forecast-section">
                <Card.Body>
                  <h3 className="text-center mb-4">⚡ Crop Yield 10-Day Forecast</h3>
                  <Row className="align-items-center">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Select Date:</Form.Label>
                        <Form.Control
                          type="date"
                          value={forecastDate}
                          onChange={(e) => setForecastDate(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="text-center">
                      <Button 
                        variant="primary" 
                        className="forecast-btn"
                        onClick={generateForecast}
                      >
                        <i className="bi bi-calendar-week me-2"></i>
                        Get Forecast
                      </Button>
                    </Col>
                  </Row>
                  
                  {showForecast && (
                    <div className="mt-4">
                      <Plot
                        data={[
                          {
                            x: forecastData.dates,
                            y: forecastData.yields,
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: 'Predicted Yield',
                            line: { color: '#28a745', width: 3 },
                            marker: { color: '#28a745', size: 8 }
                          }
                        ]}
                        layout={{
                          title: '10-Day Crop Yield Forecast',
                          xaxis: { title: 'Date', type: 'date' },
                          yaxis: { title: 'Predicted Yield (Tons/Ha)' },
                          margin: { t: 50, b: 50, l: 60, r: 30 },
                          plot_bgcolor: '#f8f9fa',
                          paper_bgcolor: 'white'
                        }}
                        style={{ width: '100%', height: '400px' }}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default CropPredictionPage;
