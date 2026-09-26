import React from "react";
import { Shield, Github, Twitter, Mail } from "lucide-react";
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand-logo">
            <Shield className="brand-icon" />
            <span className="brand-name">AuthLens</span>
          </div>
          <p className="brand-tagline">
            Blockchain-powered video authentication for secure surveillance
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#monitor">Monitor</a>
            <a href="#validate">Validate</a>
            <a href="#ledger">Ledger</a>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <a href="https://github.com/zero-abd/AuthLens" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
            <a href="https://github.com/zero-abd/AuthLens/issues" target="_blank" rel="noopener noreferrer">
              Support
            </a>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="https://github.com/zero-abd/AuthLens" target="_blank" rel="noopener noreferrer" title="GitHub">
                <Github className="social-icon" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
                <Twitter className="social-icon" />
              </a>
              <a href="mailto:contact@authlens.com" title="Email">
                <Mail className="social-icon" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} AuthLens. All rights reserved.</p>
        <p className="footer-tech">Built with React • Solidity • FastAPI</p>
      </div>
    </footer>
  );
};

export default Footer;
