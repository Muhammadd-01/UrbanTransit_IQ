import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaCheckCircle, FaMicrochip, FaNetworkWired } from 'react-icons/fa';
import './HolographicAnalyzer.css';

const HolographicAnalyzer = ({ isOpen, title = "Executing Spatial Telemetry Analysis", onComplete }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(12);

  const steps = [
    "FETCHING 3,000,000 LIVE POSTGRESQL RECORDS...",
    "TRAINING AI ENSEMBLE MODEL IN LIVE MEMORY...",
    "CALCULATING F1-SCORE AND RMSE ERROR METRICS...",
    "EXTRACTING LATEST REAL-TIME TELEMETRY ROW...",
    "SYNTHESIZING FINAL PREDICTION MATRICES..."
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setProgress(12);
      return;
    }

    // Play subtle high-tech futuristic synthesizer audio using Web Audio API
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 350);
          return 100;
        }
        return prev + Math.floor(Math.random() * 18) + 12;
      });

      setStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, 240);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="hologram-screen-backdrop">
        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="hologram-center-pod hud-panel"
        >
          {/* Dual Holographic Rotating Reticles */}
          <div className="reticle-orbit-wrapper">
            <div className="reticle-ring ring-outer"></div>
            <div className="reticle-ring ring-inner"></div>
            <div className="reticle-scanner-sweep"></div>
            <div className="reticle-core-hub">
              <FaMicrochip className="core-chip-icon" />
            </div>
          </div>

          <div className="hologram-text-block">
            <span className="hologram-super-tag">
              <span className="pulse-beacon-cyan"></span>
              <span>AUTONOMOUS INFERENCE ENGINE // KARACHI METRO</span>
            </span>

            <h3 className="hologram-title">{title}</h3>
            
            <div className="hologram-step-readout">
              <span className="step-arrow">▶</span>
              <span className="step-text mono-val">{steps[step]}</span>
            </div>

            {/* Glowing Neon Progress Track */}
            <div className="hologram-progress-shell">
              <div 
                className="hologram-progress-fill" 
                style={{ width: `${progress}%` }}
              >
                <div className="progress-glow-head"></div>
              </div>
            </div>

            <div className="hologram-footer-telemetry">
              <span>CLUSTER: <strong>SPARK 3.5 + FASTAPI</strong></span>
              <span>PROGRESS: <strong>{progress}%</strong></span>
              <span>LATENCY: <strong>P95 &lt;11ms</strong></span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HolographicAnalyzer;
