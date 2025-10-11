import React from 'react';
import { Link } from 'react-router-dom';
import { BiHome, BiLineChart } from 'react-icons/bi';
import './Navigation.css';

const Navigation = () => {
  return (
    <div className="nav-container">
      <div className="nav-buttons">
        <Link to="/" className="nav-btn">
          <BiHome className="me-1" /> Home
        </Link>
        <Link to="/crop-prediction" className="nav-btn">
          <BiLineChart className="me-1" /> Crop Prediction
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
