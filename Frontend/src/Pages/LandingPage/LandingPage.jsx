import React from 'react';
import { FaEnvelope, FaTasks, FaClock, FaChartLine, FaInstagram, FaGithub } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import './LandingPage.css';
import emailImage from '../../assets/email.jpg';
// import featureImage from '../../assets/features.jpg';
// import { HOME_API } from  '../../lib/constant';

const LandingPage = () => {
  return (
    <div className="landing-page">
     
     
     <br></br>
     <br></br>
     <br></br>
        <h1>Email Marketing Management System</h1>
        <p>Create, manage, and analyze your email campaigns</p>
     

      <div className="feature-container">
        <div className="feature-description">
          <h2>Features</h2>
          <ul>
            <li><FaEnvelope /> Create and customize email templates</li>
            <li><FaTasks /> Manage subscriber lists and segments</li>
            <li><FaClock /> Schedule and send automated campaigns</li>
            <li><FaChartLine /> Track and analyze campaign performance</li>
          </ul>
        </div>
        <div className="feature-image">
          <img src={emailImage} alt="Feature" />
        </div>
      </div>

      <div className="contact-container">
      <div className="contact-description">
      <h2>Contact Us</h2>
        <ul >
       
          <li><MdEmail /></li>
          <li><MdPhone /> </li>
          <li><FaInstagram /> <a href="" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><FaGithub /> <a href="" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
        </div>
        <div className="feature-image">
        
      </div>
    </div>

      <p>&copy; 2023 Email Marketing Management System. All rights reserved.</p>
    </div>
  );
}

export default LandingPage;
