import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  ShieldCheck,
  BookText,
  Zap,
  ArrowRight,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import "./Home.css";

export const Home: React.FC = () => {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <motion.div
          className="hero-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge">
            <Sparkles className="bicon" /> New: Live CCTV + Demo Verification
          </div>
          <h1 className="headline">AuthLens</h1>
          <p className="subhead">
            Capture and validate video authenticity with elegant, instant
            feedback.
          </p>
          <div className="cta-row">
            <Link to="/live" className="btn primary">
              <PlayCircle /> Launch Live
            </Link>
            <Link to="/validate" className="btn ghost">
              <ShieldCheck /> Validate Video
            </Link>
          </div>
        </motion.div>
        <div className="bg-accents">
          <div className="orb orb-pink" />
          <div className="orb orb-purple" />
          <div className="orb orb-blue" />
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="grid">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="icon-wrap">
              <Camera />
            </div>
            <h3>Live Capture</h3>
            <p>
              Stream from your camera in real time with smooth WebSocket
              delivery.
            </p>
          </motion.div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="icon-wrap">
              <Zap />
            </div>
            <h3>On-Device Hashing</h3>
            <p>
              Efficient client-side hashing to anchor frames without blocking
              UI.
            </p>
          </motion.div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="icon-wrap">
              <ShieldCheck />
            </div>
            <h3>Tamper Evident</h3>
            <p>
              Immutable ledger entries make alterations detectable at a glance.
            </p>
          </motion.div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="icon-wrap">
              <BookText />
            </div>
            <h3>Simple Proofs</h3>
            <p>Human-friendly proofs with clean, developer-ready references.</p>
          </motion.div>
        </div>
      </section>

      {/* Flow */}
      <section className="flow">
        <h3 className="section-title">How it works</h3>
        <div className="flow-rail">
          <div className="flow-step">
            <span className="pill">1</span>
            Live Capture
          </div>
          <ArrowRight className="arrow" />
          <div className="flow-step">
            <span className="pill">2</span>
            Frames
          </div>
          <ArrowRight className="arrow" />
          <div className="flow-step">
            <span className="pill">3</span>
            Verification
          </div>
          <ArrowRight className="arrow" />
          <div className="flow-step">
            <span className="pill">4</span>
            Ledger
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="quick">
        <div className="qgrid">
          <motion.div
            className="qcard"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="qhead">
              <Camera /> Live CCTV
            </div>
            <p>Record and stream your camera. Ideal for live demos.</p>
            <Link to="/live" className="qbtn">
              Open Live <ArrowRight />
            </Link>
          </motion.div>
          <motion.div
            className="qcard"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="qhead">
              <ShieldCheck /> Validate
            </div>
            <p>Upload any video and get a demo verdict instantly.</p>
            <Link to="/validate" className="qbtn">
              Try Validate <ArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-card">
          <h3>Ship trust with every frame.</h3>
          <p>AuthLens brings verifiability to your video pipelines.</p>
          <div className="cta-row">
            <Link to="/live" className="btn primary">
              <PlayCircle /> Launch Live
            </Link>
            <Link to="/validate" className="btn ghost">
              <ShieldCheck /> Validate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
