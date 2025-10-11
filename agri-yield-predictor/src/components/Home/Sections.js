import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Speedometer2, GraphUp, CloudSun, Droplet, Thermometer } from 'react-bootstrap-icons';

const Sections = () => {
  return (
    <>
      {/* Statistics Section */}
      <div className="stats-section py-5">
        <Container>
          <Row>
            <Col md={3} xs={6} className="mb-4">
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Prediction Accuracy</span>
              </div>
            </Col>
            <Col md={3} xs={6} className="mb-4">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Crop Types Supported</span>
              </div>
            </Col>
            <Col md={3} xs={6} className="mb-4">
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Real-time Monitoring</span>
              </div>
            </Col>
            <Col md={3} xs={6} className="mb-4">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Farmers Trust Us</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <section className="features-section py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Our Powerful Features</h2>
            <p className="section-subtitle text-muted">Everything you need to optimize your agricultural yields</p>
          </div>
          
          <Row className="g-4">
            <Col md={4} className="fade-in">
              <Card className="h-100 feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <Speedometer2 size={40} className="text-primary" />
                  </div>
                  <h4>Fast Predictions</h4>
                  <p className="text-muted">
                    Get instant yield predictions using our advanced machine learning models.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="fade-in" style={{ animationDelay: '0.2s' }}>
              <Card className="h-100 feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <GraphUp size={40} className="text-primary" />
                  </div>
                  <h4>Time Series Analysis</h4>
                  <p className="text-muted">
                    Analyze historical data and forecast future trends with our time series tools.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="fade-in" style={{ animationDelay: '0.4s' }}>
              <Card className="h-100 feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <CloudSun size={40} className="text-primary" />
                  </div>
                  <h4>Weather Integration</h4>
                  <p className="text-muted">
                    Get accurate predictions by incorporating real-time weather data.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section className="how-it-works py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle text-muted">Get started in just a few simple steps</p>
          </div>
          
          <Row className="g-4">
            <Col md={4} className="fade-in">
              <div className="step-card">
                <div className="step-number">1</div>
                <h4>Input Your Data</h4>
                <p>Enter details about your crops, soil type, and environmental conditions.</p>
                <div className="step-icon">
                  <Thermometer size={30} />
                </div>
              </div>
            </Col>
            
            <Col md={4} className="fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="step-card">
                <div className="step-number">2</div>
                <h4>Run Analysis</h4>
                <p>Our algorithms process your data using advanced machine learning models.</p>
                <div className="step-icon">
                  <GraphUp size={30} />
                </div>
              </div>
            </Col>
            
            <Col md={4} className="fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="step-card">
                <div className="step-number">3</div>
                <h4>Get Insights</h4>
                <p>Receive detailed reports and predictions to optimize your yields.</p>
                <div className="step-icon">
                  <Droplet size={30} />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Sections;
