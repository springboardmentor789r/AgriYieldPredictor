import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Spinner, Table } from 'react-bootstrap';
import { Download, ArrowRight, House } from 'react-bootstrap-icons';
import './TimeSeries.css';

const TimeSeries = () => {
  const [formData, setFormData] = useState({
    crop: 'Rice',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    season: 'Kharif',
    area: '100',
    production: '5000',
    annualRainfall: '1200',
    fertilizer: '200',
    pesticide: '50',
    temperature: '28'
  });
  
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [forecastData, setForecastData] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock forecast data generation
      const mockForecast = [];
      const today = new Date();
      
      for (let i = 1; i <= 12; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() + i);
        const baseYield = parseFloat(formData.production) / parseFloat(formData.area); // Yield in tons/hectare
        const trend = 1 + (i * 0.02); // 2% monthly increase
        const randomFactor = 0.9 + Math.random() * 0.2; // Random factor between 0.9 and 1.1
        const predictedYield = baseYield * trend * randomFactor;
        
        mockForecast.push({
          date: date.toISOString(),
          yield: Math.round(predictedYield * 100) / 100,
          confidence_lower: Math.round(predictedYield * 0.95 * 100) / 100, // 5% lower bound
          confidence_upper: Math.round(predictedYield * 1.05 * 100) / 100  // 5% upper bound
        });
      }
      
      setForecastData(mockForecast);
      setShowResults(true);
      setLoading(false);
    }, 1500);
  };

  const exportToExcel = () => {
    try {
      if (window.XLSX) {
        const ws = window.XLSX.utils.json_to_sheet(forecastData);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Forecast');
        window.XLSX.writeFile(wb, 'forecast_data.xlsx');
      } else {
        // If XLSX is not loaded, load it from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js';
        script.onload = () => {
          const ws = window.XLSX.utils.json_to_sheet(forecastData);
          const wb = window.XLSX.utils.book_new();
          window.XLSX.utils.book_append_sheet(wb, ws, 'Forecast');
          window.XLSX.writeFile(wb, 'forecast_data.xlsx');
        };
        script.onerror = () => {
          console.error('Failed to load XLSX library');
          alert('Failed to load Excel export functionality. Please try again.');
        };
        document.body.appendChild(script);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <Container className="time-series-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">Time Series Analysis</h2>
        <Link to="/" className="btn btn-outline-primary">
          <House className="me-1" /> Home
        </Link>
      </div>
      
      <Row>
        <Col lg={12}>
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Crop</Form.Label>
                      <Form.Select 
                        name="crop" 
                        value={formData.crop}
                        onChange={handleChange}
                        required
                      >
                        <option value="Rice">Rice</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Maize">Maize</option>
                        <option value="Sugarcane">Sugarcane</option>
                        <option value="Cotton">Cotton</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">State</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">District</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Season</Form.Label>
                      <Form.Select 
                        name="season" 
                        value={formData.season}
                        onChange={handleChange}
                        required
                      >
                        <option value="Kharif">Kharif</option>
                        <option value="Rabi">Rabi</option>
                        <option value="Zaid">Zaid</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Area (Hectares)</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Production (Tons)</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="production"
                        value={formData.production}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Annual Rainfall (mm)</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="annualRainfall"
                        value={formData.annualRainfall}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Fertilizer (kg/hectare)</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="fertilizer"
                        value={formData.fertilizer}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Pesticide (kg/hectare)</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="pesticide"
                        value={formData.pesticide}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Temperature (°C)</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} className="text-center mt-4">
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
                          Processing...
                        </>
                      ) : (
                        <>
                          Generate Forecast <ArrowRight className="ms-2" />
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
          
          {showResults && (
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Forecast Results</h4>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={exportToExcel}
                    >
                      <Download className="me-1" /> Export Data
                    </Button>
                    <Button variant="primary" size="sm">
                      View Detailed Analysis <ArrowRight className="ms-1" />
                    </Button>
                  </div>
                </div>
                
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Predicted Yield (tons/hectare)</th>
                        <th>Confidence Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.date}</td>
                          <td>{item.yield}</td>
                          <td>
                            {item.confidence_lower} - {item.confidence_upper}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TimeSeries;
