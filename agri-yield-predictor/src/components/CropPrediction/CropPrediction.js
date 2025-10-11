import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Button, 
  Card, 
  Spinner,
  Form
} from 'react-bootstrap';
import SimpleForecast from '../SimpleForecast/SimpleForecast';
import './CropPrediction.css';

// Form options for dropdowns
const formOptions = {
  soilTypes: ['Sandy', 'Loamy', 'Clay', 'Silt', 'Peaty', 'Chalky'],
  cropTypes: ['Rice', 'Wheat', 'Maize', 'Barley', 'Sugarcane', 'Cotton', 'Jute', 'Groundnut', 'Pulses'],
  weatherConditions: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy']
};

const CropPrediction = () => {
  const [formData, setFormData] = useState({
    temperature: '',
    rainfall: '',
    humidity: '',
    soilType: 'Sandy',
    weatherCondition: 'Sunny',
    cropType: 'Wheat',
    area: '',
    production: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
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
      const baseYield = 7.5; // Base yield in tons/hectare
      const tempFactor = 0.9 + (Math.random() * 0.2); // 0.9-1.1
      const rainFactor = 0.9 + (Math.random() * 0.2); // 0.9-1.1
      const humidityFactor = 0.9 + (Math.random() * 0.2); // 0.9-1.1
      
      const predictedYield = baseYield * tempFactor * rainFactor * humidityFactor;
      
      setResult(predictedYield.toFixed(2));
      setLoading(false);
    }, 1000);
  };

  // Generate forecast data based on form inputs
  const getForecastData = () => {
    if (!result) return [];
    
    const baseYield = parseFloat(result);
    const forecast = [];
    const today = new Date();
    
    for (let i = 1; i <= 6; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() + i);
      const trend = 1 + (i * 0.02); // 2% monthly increase
      const randomFactor = 0.95 + Math.random() * 0.1; // Random factor between 0.95 and 1.05
      const predictedYield = baseYield * trend * randomFactor;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        yield: Math.round(predictedYield * 100) / 100,
        confidence_lower: Math.round(predictedYield * 0.95 * 100) / 100,
        confidence_upper: Math.round(predictedYield * 1.05 * 100) / 100
      });
    }
    
    return forecast;
  };

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Crop Yield Prediction</h2>
      <Row>
        {/* Left Column - Input Form */}
        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Input Parameters</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* First Row */}
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Temperature (°C)</Form.Label>
                      <Form.Control
                        type="number"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        placeholder="e.g., 25"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rainfall (mm)</Form.Label>
                      <Form.Control
                        type="number"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleInputChange}
                        placeholder="e.g., 120"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Humidity (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleInputChange}
                        placeholder="e.g., 65"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Second Row */}
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Soil Type</Form.Label>
                      <Form.Select
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleInputChange}
                        required
                      >
                        {formOptions.soilTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Weather Condition</Form.Label>
                      <Form.Select
                        name="weatherCondition"
                        value={formData.weatherCondition}
                        onChange={handleInputChange}
                        required
                      >
                        {formOptions.weatherConditions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Crop Type</Form.Label>
                      <Form.Select
                        name="cropType"
                        value={formData.cropType}
                        onChange={handleInputChange}
                        required
                      >
                        {formOptions.cropTypes.map(crop => (
                          <option key={crop} value={crop}>{crop}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Third Row */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Area (Hectares)</Form.Label>
                      <Form.Control
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="e.g., 10"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Production (Tons)</Form.Label>
                      <Form.Control
                        type="number"
                        name="production"
                        value={formData.production}
                        onChange={handleInputChange}
                        placeholder="e.g., 50"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-center mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="px-5"
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
                      'Predict Yield'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Result Display */}
          {result !== null && (
            <Card className="mt-4 shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Prediction Result</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <h4>Predicted Yield: {result} tons/hectare</h4>
                  <div className="mt-3">
                    <h6>Input Summary</h6>
                    <ul className="list-unstyled">
                      <li><strong>Crop Type:</strong> {formData.cropType}</li>
                      <li><strong>Soil Type:</strong> {formData.soilType}</li>
                      <li><strong>Temperature:</strong> {formData.temperature}°C</li>
                      <li><strong>Rainfall:</strong> {formData.rainfall} mm</li>
                      <li><strong>Humidity:</strong> {formData.humidity}%</li>
                      <li><strong>Weather:</strong> {formData.weatherCondition}</li>
                    </ul>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Column - Forecast */}
        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Yield Forecast</h5>
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    <Form.Control
                      type="date"
                      name="start"
                      value={dateRange.start}
                      onChange={handleDateChange}
                      className="form-control-sm"
                    />
                  </div>
                  <span className="mx-2">to</span>
                  <div>
                    <Form.Control
                      type="date"
                      name="end"
                      value={dateRange.end}
                      onChange={handleDateChange}
                      min={dateRange.start}
                      className="form-control-sm"
                    />
                  </div>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <SimpleForecast 
                forecastData={getForecastData()}
                cropType={formData.cropType}
                showResults={true}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CropPrediction;
