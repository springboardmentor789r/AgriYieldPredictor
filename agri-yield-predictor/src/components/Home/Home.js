import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { ArrowRightCircle, GraphUpArrow } from 'react-bootstrap-icons';
import Sections from './Sections';
import '../../styles/Home.css';

const Home = () => {
  // Animation on scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-on-scroll');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    // Observe all elements with the 'fade-in' class
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4 fade-in">
                Smart Agriculture Yield Prediction
              </h1>
              <p className="lead mb-4 fade-in" style={{ animationDelay: '0.2s' }}>
                Leverage advanced machine learning to predict crop yields with 
                unprecedented accuracy and plan your agricultural activities 
                more effectively.
              </p>
              <div className="d-flex gap-3 fade-in" style={{ animationDelay: '0.4s' }}>
                <Link to="/crop-prediction" className="btn btn-primary btn-lg">
                  Predict Now <ArrowRightCircle className="ms-2" />
                </Link>
                <Link to="/time-series" className="btn btn-outline-secondary btn-lg">
                  View TimeSeriesAnalysis <GraphUpArrow className="ms-2" />
                </Link>
              </div>
            </Col>
            <Col lg={6} className="fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="hero-image-container">
                <img 
                  href="https://ibb.co/nt7WsQs" 
                  alt="Smart Agriculture" 
                  className="img-fluid rounded shadow"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Sections />

      {/* CTA Section */}
      <section className="cta-section py-5 bg-light">
        <Container className="text-center">
          <h2 className="mb-4">Ready to optimize your crop yields?</h2>
          <p className="lead mb-4">
            Start making data-driven decisions for your farm today.
          </p>
          <Link to="/crop-prediction" className="btn btn-primary btn-lg">
            Get Started <ArrowRightCircle className="ms-2" />
          </Link>
        </Container>
      </section>
    </div>
  );
};

export default Home;
