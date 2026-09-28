import React, { useRef, useMemo, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { FaArrowRight, FaChartLine, FaRobot, FaMapMarkedAlt, FaDatabase, FaServer, FaShieldAlt, FaUsers, FaBus, FaClock } from 'react-icons/fa';
import Plot from 'react-plotly.js';

import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/common/Logo';
import KPICard from '../components/common/KPICard';
import { getPlotlyLayout, defaultPlotlyConfig } from '../utils/plotlyTheme';
import './LandingPage.css';

// --- Three.js Background Component ---
const ParticleField = (props) => {
  const ref = useRef();
  
  const sphere = useMemo(() => {
    const points = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * 2.0 * Math.PI;
      const phi = Math.acos((Math.random() * 2.0) - 1.0);
      const r = Math.cbrt(Math.random()) * 2.0;
      
      points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      points[i * 3 + 2] = r * Math.cos(phi);
    }
    return points;
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 20;
    ref.current.rotation.y -= delta / 30;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="var(--color-accent)"
          size={0.007}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
};

const ThreeBackground = () => (
  <div className="landing-canvas-container">
    <Canvas camera={{ position: [0, 0, 1] }}>
      <ParticleField />
    </Canvas>
  </div>
);

// --- Dummy Data for Plotly Graphs ---
const mockTimeSeriesX = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
const mockDemandY = [12, 15, 25, 45, 85, 130, 240, 310, 280, 210, 180, 150, 160, 190, 200, 230, 290, 340, 260, 180, 110, 70, 40, 20];
const mockPredictedY = mockDemandY.map(y => Math.max(0, y + (Math.random() * 30 - 15)));

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Monitor theme changes for Plotly
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(currentTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated, navigate]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const chartLayout = getPlotlyLayout(theme, { 
    title: false,
    margin: { t: 20, r: 20, b: 40, l: 40 },
    height: 300,
    showlegend: true,
    legend: { orientation: 'h', y: -0.2 }
  });

  return (
    <div className="landing-page-container">
      <ThreeBackground />
      
      {/* Navbar matching Dashboard Theme */}
      <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-brand">
          <Logo size={32} />
          <h2>UrbanTransit <span>IQ</span></h2>
        </div>
        
        <div className="landing-nav-links">
          <button onClick={() => scrollToSection('hero')}>Overview</button>
          <button onClick={() => scrollToSection('capabilities')}>Capabilities</button>
          <button onClick={() => scrollToSection('ai')}>AI Engine</button>
          <button onClick={() => scrollToSection('spatial')}>Spatial</button>
          <button onClick={() => scrollToSection('system')}>System</button>
        </div>
        
        <div className="landing-nav-actions">
          <button className="btn-secondary-hud" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary-hud" onClick={() => navigate('/dashboard')}>Launch App</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="hero" className="landing-section hero-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="hero-content-wrapper"
        >
          <div className="hero-super-tag" style={{ margin: '0 auto 1.5rem' }}>
            <span className="pulse-dot"></span>
            UrbanTransit IQ v2.0 Live
          </div>
          
          <h1 className="hero-main-title text-center" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
            The Intelligent Nervous System <br/>for Modern Transit
          </h1>
          
          <p className="hero-desc text-center" style={{ margin: '0 auto 2.5rem', maxWidth: '800px', fontSize: '1.25rem' }}>
            Harness real-time telemetry, spatial analytics, and AI predictive pipelines to optimize passenger flow, eliminate congestion, and automate fleet deployment. Explore the most advanced transit dashboard ever built.
          </p>
          
          <div className="landing-hero-actions">
            <button className="btn-primary-hud l-btn" onClick={() => navigate('/dashboard')}>
              Explore Dashboard <FaArrowRight style={{ marginLeft: '10px' }} />
            </button>
            <button className="btn-secondary-hud l-btn" onClick={() => navigate('/login')}>
              System Administrator
            </button>
          </div>
        </motion.div>
      </main>

      {/* Capabilities: Live Metrics */}
      <section id="capabilities" className="landing-section">
        <div className="landing-section-header">
          <h2 className="hero-main-title" style={{ fontSize: '2.5rem' }}>Real-Time Fleet Telemetry</h2>
          <p className="hero-desc">Monitor millions of data points instantly. The dashboard ingests live feeds directly from PostgreSQL.</p>
        </div>
        <div className="landing-grid-4">
          <KPICard 
            title="TOTAL PASSENGERS TODAY" 
            value="3,214,892" 
            icon={<FaUsers />} 
            change={12.4} 
            changeDirection="up" 
            techCode="VOL_LIVE"
            progress={85}
            colorScheme="cyan" 
          />
          <KPICard 
            title="ACTIVE BUSES" 
            value="1,402" 
            icon={<FaBus />} 
            techCode="FLT_OPS"
            progress={94}
            colorScheme="emerald" 
          />
          <KPICard 
            title="ON-TIME PERFORMANCE" 
            value="91.2%" 
            icon={<FaClock />} 
            change={2.1} 
            changeDirection="up" 
            techCode="SLO_TRGT"
            progress={91}
            colorScheme="gold" 
          />
          <KPICard 
            title="SYSTEM HEALTH" 
            value="NOMINAL" 
            icon={<FaServer />} 
            techCode="API_OK"
            colorScheme="cyan" 
          />
        </div>
      </section>

      {/* Detailed AI Section with Graph */}
      <section id="ai" className="landing-section alt-bg">
        <div className="landing-split-section">
          <div className="landing-split-text">
            <div className="hero-super-tag" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <FaRobot style={{ marginRight: '8px' }} /> Predictive Machine Learning
            </div>
            <h2 className="hero-main-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              Anticipate Delays Before They Happen
            </h2>
            <p className="hero-desc" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              Our dual-engine AI pipeline runs Apache Spark MLlib and XGBoost concurrently. By analyzing over 3 million historical transit records, the system accurately predicts passenger surges and calculates precise delay probabilities 30 minutes in advance.
            </p>
            <ul className="landing-feature-list">
              <li><strong>Distributed Spark Forest:</strong> Processes global network congestion patterns.</li>
              <li><strong>XGBoost Gradient Boosting:</strong> Achieves 88% precision on localized route delays.</li>
              <li><strong>Live Inference:</strong> Sub-10ms model execution via FastAPI.</li>
            </ul>
          </div>
          
          <div className="landing-split-visual hud-panel">
            <h3 style={{ padding: '1rem 1.5rem', fontSize: '1rem', borderBottom: '1px solid var(--color-border-subtle)', margin: 0 }}>Live Demand vs XGBoost Prediction</h3>
            <div style={{ padding: '1rem' }}>
              <Plot
                data={[
                  {
                    x: mockTimeSeriesX,
                    y: mockDemandY,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Actual Passenger Load',
                    line: { color: '#007AFF', width: 3 },
                    marker: { size: 6 }
                  },
                  {
                    x: mockTimeSeriesX,
                    y: mockPredictedY,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'AI Forecast',
                    line: { color: '#FF9500', width: 2, dash: 'dot' }
                  }
                ]}
                layout={chartLayout}
                config={defaultPlotlyConfig}
                style={{ width: '100%', height: '100%' }}
                useResizeHandler={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Spatial Section with Data Table */}
      <section id="spatial" className="landing-section">
        <div className="landing-split-section reverse">
          <div className="landing-split-text">
            <div className="hero-super-tag" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <FaMapMarkedAlt style={{ marginRight: '8px' }} /> Spatial Analysis
            </div>
            <h2 className="hero-main-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              Origin-Destination (OD) Routing
            </h2>
            <p className="hero-desc" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              Visualize exactly where passengers are coming from and where they are going. The Dashboard tracks complex zonal desire lines and identifies bottleneck corridors in real-time, allowing operators to instantly re-route fleet units.
            </p>
            <button className="btn-primary-hud" onClick={() => navigate('/dashboard')}>
              View Live OD Matrix <FaArrowRight style={{ marginLeft: '10px' }} />
            </button>
          </div>
          
          <div className="landing-split-visual hud-panel" style={{ padding: '1rem' }}>
            <h3 style={{ padding: '0.5rem 1rem 1.5rem', fontSize: '1rem', margin: 0 }}>Corridor Volume Ledger</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Origin Zone</th>
                    <th>Destination Zone</th>
                    <th>Daily Volume</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Zone 1 (Downtown)</td>
                    <td>Zone 4 (Tech Park)</td>
                    <td><span className="text-cyan font-bold">142,050</span></td>
                    <td><span className="status-badge-chip danger">Severe Load</span></td>
                  </tr>
                  <tr>
                    <td>Zone 2 (Suburbs)</td>
                    <td>Zone 1 (Downtown)</td>
                    <td><span className="text-cyan font-bold">98,320</span></td>
                    <td><span className="status-badge-chip warning">Heavy Load</span></td>
                  </tr>
                  <tr>
                    <td>Zone 3 (University)</td>
                    <td>Zone 5 (Retail)</td>
                    <td><span className="text-cyan font-bold">65,110</span></td>
                    <td><span className="status-badge-chip success">Nominal</span></td>
                  </tr>
                  <tr>
                    <td>Zone 4 (Tech Park)</td>
                    <td>Zone 2 (Suburbs)</td>
                    <td><span className="text-cyan font-bold">54,900</span></td>
                    <td><span className="status-badge-chip success">Nominal</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise System Architecture Section */}
      <section id="system" className="landing-section alt-bg">
        <div className="landing-section-header">
          <h2 className="hero-main-title" style={{ fontSize: '2.5rem' }}>Enterprise System Architecture</h2>
          <p className="hero-desc">Built for extreme scale, sub-second speed, and 99.99% reliability.</p>
        </div>
        
        <div className="landing-architecture-grid">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hud-panel arch-card"
          >
            <FaDatabase className="arch-icon" />
            <h3>PostgreSQL Big Data Engine</h3>
            <p>Our foundation rests on a high-throughput PostgreSQL physical ledger, engineered to ingest and instantly serve 3M+ multi-modal passenger transit records simultaneously without missing a beat.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="hud-panel arch-card"
          >
            <FaServer className="arch-icon" />
            <h3>FastAPI Microservices</h3>
            <p>A lightning-fast Python API gateway orchestrates all analytical queries, ensuring strict SLA response times and providing the essential telemetry hooks required by the frontend React client.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hud-panel arch-card"
          >
            <FaShieldAlt className="arch-icon" />
            <h3>Liquid Glass UI/UX</h3>
            <p>Designed strictly for mission-critical command centers. Our unique Liquid Glassmorphism design system ensures maximum data density and clarity, paired with dual-mode light and dark themes.</p>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="landing-footer">
        <Logo size={24} style={{ opacity: 0.5, marginBottom: '10px' }} />
        <p>© {new Date().getFullYear()} UrbanTransit IQ. Advanced Agentic Architecture.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
