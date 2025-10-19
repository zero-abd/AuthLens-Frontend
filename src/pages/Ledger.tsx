import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Clock, ArrowLeft, Hash, Camera, FileText } from "lucide-react";
import "./Ledger.css";

interface LedgerEntry {
  timestamp: string;
  camera_id: string;
  chunk_filename: string;
  video_hash: string;
  transaction_hash: string;
  block_number: number | null;
  status: string;
}

const truncateHash = (hash: string, chars: number = 6): string => {
  if (!hash || hash === "already_exists") return hash;
  if (hash.length <= chars * 2) return hash;
  return `...${hash.slice(-chars)}`;
};

export const Ledger: React.FC = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/ledger");
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.entries);
      } else {
        setError("Failed to load ledger entries");
      }
    } catch (err) {
      setError("Error connecting to backend");
      console.error("Error fetching ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ledger-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="header-row"
      >
        <Link to="/monitor" className="back">
          <ArrowLeft /> Back to Monitor
        </Link>
        <h2>Blockchain Ledger</h2>
        <span className="status authentic">
          <ShieldCheck className="status-icon" /> Active
        </span>
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-message"
        >
          Loading ledger entries...
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="error-message"
        >
          <AlertTriangle /> {error}
        </motion.div>
      )}

      {!loading && !error && entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-message"
        >
          <Clock />
          <p>No ledger entries yet. Upload video chunks to start recording.</p>
        </motion.div>
      )}

      {!loading && !error && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="ledger-container"
        >
          <div className="ledger-stats">
            <div className="stat-card">
              <FileText className="stat-icon" />
              <div>
                <div className="stat-value">{entries.length}</div>
                <div className="stat-label">Total Entries</div>
              </div>
            </div>
            <div className="stat-card">
              <ShieldCheck className="stat-icon" />
              <div>
                <div className="stat-value">
                  {entries.filter(e => e.status === "stored").length}
                </div>
                <div className="stat-label">Stored on Chain</div>
              </div>
            </div>
          </div>

          <div className="ledger-table">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Camera</th>
                  <th>Video Hash</th>
                  <th>Tx Hash</th>
                  <th>Block</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="timestamp">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="camera-id">
                      <Camera size={14} />
                      {entry.camera_id}
                    </td>
                    <td className="hash">
                      <Hash size={14} />
                      <code>{truncateHash(entry.video_hash, 8)}</code>
                    </td>
                    <td className="hash">
                      <code>{truncateHash(entry.transaction_hash, 8)}</code>
                    </td>
                    <td className="block">
                      {entry.block_number ? `#${entry.block_number}` : "-"}
                    </td>
                    <td>
                      <span className={`badge ${entry.status}`}>
                        {entry.status === "stored" ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        {entry.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Ledger;
