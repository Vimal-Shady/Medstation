import { useState } from 'react';
import './App.css';

function App() {
  const [role, setRole] = useState('');
  const [isHovered, setIsHovered] = useState(false); // State to track hover status

  const handleRedirect = () => {
    if (role === 'doctor') window.location.href = 'http://localhost:3002';
    else if (role === 'admin') window.location.href = 'http://localhost:3001';
    else if (role === 'patient') window.location.href = 'http://localhost:3003';
    else alert('Please select a role to continue');
  };

  // Styles for the select element with glowing effect on hover
  const selectStyle = {
    padding: "15px 40px",
    background: "#e3b313",
    border: "2px solid #fff",
    outline: "none",
    borderRadius: "8px",
    boxShadow: isHovered ? "0 0 40px #ffac09" : "0 0 40px #7d2ae8", // Gold glow on hover
    fontSize: "18px",
    color: "#fff",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "background-color 0.3s, box-shadow 0.3s"
  };

  return (
    <div className="container home-page">
      <header className="main-header">
        <div className="logo">
          <h1 className="glow">Medstation</h1>
        </div>

        <nav className="navigation-bar">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <h2>Welcome to Medstation</h2>
          <p>Your unified portal for efficient healthcare access.</p>
          <div className="button-group">
            <select
              id="poki"
              onChange={(e) => setRole(e.target.value)}
              defaultValue=""
              style={selectStyle} // Apply styles here
              onMouseEnter={() => setIsHovered(true)} // Set hovered state
              onMouseLeave={() => setIsHovered(false)} // Reset hovered state
            >
              <option value="" disabled>Select Your Panel</option>
              <option value="admin">Admin Panel</option>
              <option value="doctor">Doctor Panel</option>
              <option value="patient">Patient Panel</option>
            </select>

            <button onClick={handleRedirect}>Enter</button>
          </div>
        </section>

        <section className="features-section">
          <h2 className="text-center" style={{color:'whitesmoke'}}>Why MedicoTrack?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h4>Unified Access</h4>
              <p>Doctors, Admins, and Patients – all on a single platform.</p>
            </div>
            <div className="feature-item">
              <h4>Real-Time Sync</h4>
              <p>Seamless updates and prescription tracking.</p>
            </div>
            <div className="feature-item">
              <h4>Secure & Reliable</h4>
              <p>Built with security and user experience in mind.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <p>© 2025 MedicoTrack. All rights reserved.</p>
          <div className="footer-nav">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
