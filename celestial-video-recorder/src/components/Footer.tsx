import React from "react";
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="inner">
        <span>© {new Date().getFullYear()} AuthLens</span>
        <span className="sep"></span>
      </div>
    </footer>
  );
};

export default Footer;
