import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Clock, ArrowLeft } from "lucide-react";
import "./Ledger.css";

const mockProofs: Record<
  string,
  {
    status: "Authentic" | "Unseen" | "Tampered";
    block: string;
    txHash: string;
    rootHash: string;
    timestamp: string;
    notes?: string;
  }
> = {
  "demo-video": {
    status: "Authentic",
    block: "#128,903",
    txHash: "0x7c1a...f9be",
    rootHash: "0x53e0...77ad",
    timestamp: new Date().toISOString(),
    notes: "Demo attestation for live CCTV sample.",
  },
};

export const Ledger: React.FC = () => {
  const { videoId = "demo-video" } = useParams();
  const data = mockProofs[videoId] ?? {
    status: "Unseen" as const,
    block: "-",
    txHash: "-",
    rootHash: "-",
    timestamp: new Date().toISOString(),
    notes: "No ledger entry found for this video id in demo mode.",
  };

  const StatusIcon =
    data.status === "Authentic"
      ? ShieldCheck
      : data.status === "Tampered"
      ? AlertTriangle
      : Clock;
  const statusClass = data.status.toLowerCase();

  return (
    <div className="ledger-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="header-row"
      >
        <Link to="/live" className="back">
          <ArrowLeft /> Back to Live
        </Link>
        <h2>Ledger Entry</h2>
        <span className={`status ${statusClass}`}>
          <StatusIcon className="status-icon" /> {data.status}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
      >
        <div className="row">
          <span>Video ID</span>
          <strong>{videoId}</strong>
        </div>
        <div className="row">
          <span>Block</span>
          <strong>{data.block}</strong>
        </div>
        <div className="row">
          <span>Tx Hash</span>
          <code>{data.txHash}</code>
        </div>
        <div className="row">
          <span>Merkle Root</span>
          <code>{data.rootHash}</code>
        </div>
        <div className="row">
          <span>Timestamp</span>
          <strong>{new Date(data.timestamp).toLocaleString()}</strong>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="notes"
      >
        <p>{data.notes}</p>
      </motion.div>
    </div>
  );
};

export default Ledger;
