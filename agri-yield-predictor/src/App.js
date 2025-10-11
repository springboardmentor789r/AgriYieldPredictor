import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import components
import Home from './components/Home';
import CropPrediction from './components/CropPrediction/CropPredictionTemplate';
import TimeSeries from './components/TimeSeries';

// Import global styles
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Container fluid className="p-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crop-prediction" element={<CropPrediction />} />
            <Route path="/time-series" element={<TimeSeries />} />
            <Route path="*" element={<Home />} /> {/* Catch-all route */}
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;
