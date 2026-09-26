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
import { HAS_BACKEND } from "../config";

const REPO_URL = "https://github.com/zero-abd/AuthLens";

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
            <Sparkles className="bicon" /> Built at HackTX 2025 · Live on Ethereum Sepolia
          </div>
          <h1 className="headline">AuthLens</h1>
          <p className="subhead">
            CCTV footage is hashed and anchored on Ethereum. Anyone can check
            that a clip is byte-for-byte the original, with no trust in us.
          </p>
          <div className="cta-row">
            <Link to="/validate" className="btn primary">
              <ShieldCheck /> Verify a video
            </Link>
            {HAS_BACKEND ? (
              <Link to="/live" className="btn ghost">
                <PlayCircle /> Start Monitoring
              </Link>
            ) : (
              <a href={REPO_URL} className="btn ghost" target="_blank" rel="noreferrer">
                <PlayCircle /> Run the recorder locally
              </a>
            )}
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
              The recorder cuts camera footage into one-minute chunks and
              registers each one as it is written.
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
              SHA-256 runs in your browser, so a video you verify never leaves
              your device.
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
              Change one byte and the hash no longer matches the one on chain.
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
            <p>Each proof shows the uploader, block, time and transaction on Etherscan.</p>
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
            SHA-256
          </div>
          <ArrowRight className="arrow" />
          <div className="flow-step">
            <span className="pill">3</span>
            Ethereum
          </div>
          <ArrowRight className="arrow" />
          <div className="flow-step">
            <span className="pill">4</span>
            Verify
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
            <p>
              Recording runs locally with the FastAPI backend, which signs each
              chunk's hash to the contract.
            </p>
            {HAS_BACKEND ? (
              <Link to="/live" className="qbtn">
                Open Live <ArrowRight />
              </Link>
            ) : (
              <a href={REPO_URL} className="qbtn" target="_blank" rel="noreferrer">
                Setup on GitHub <ArrowRight />
              </a>
            )}
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
            <p>
              Check any video against the contract, or register your own with
              MetaMask on Sepolia.
            </p>
            <Link to="/validate" className="qbtn">
              Verify a video <ArrowRight />
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
            <Link to="/validate" className="btn primary">
              <ShieldCheck /> Verify a video
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
