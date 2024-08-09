import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navigation.css'; // Adjust the path according to your project structure

const Navigation = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary fixed-top">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <NavLink className="navbar-brand" to="/">UCMAS</NavLink>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">HOME</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/events">EVENT</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/programs">PROGRAM</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">ABOUT US</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/gallery">GALLERY</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login">SIGN IN</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;