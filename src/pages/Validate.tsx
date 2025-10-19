import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileVideo,
  XCircle,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import "./Validate.css";

type Verdict = "validated" | "not_validated" | "partially_validated" | null;

const BACKEND_URL = "http://localhost:8000";

export const Validate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "validating" | "done">("idle");
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [message, setMessage] = useState<string>("");
  const [chunkDetails, setChunkDetails] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const onSelect = async (selected: File) => {
    setFile(selected);
    setProgress(0);
    setStatus("uploading");
    setVerdict(null);
    setMessage("");
    setChunkDetails([]);
    setError("");

    await validateVideo(selected);
  };

  const validateVideo = async (videoFile: File) => {
    try {
      // Start progress simulation
      simulateProgress();

      const formData = new FormData();
      formData.append("video", videoFile);

      setStatus("validating");

      const response = await axios.post(
        `${BACKEND_URL}/api/validate/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(Math.min(percentCompleted, 90));
            }
          },
        }
      );

      // Stop progress simulation
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setProgress(100);
      setStatus("done");
      setVerdict(response.data.verdict);
      setMessage(response.data.message);
      setChunkDetails(response.data.chunk_details || []);

      console.log("Validation result:", response.data);
    } catch (err: any) {
      console.error("Validation error:", err);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setStatus("done");
      setError(
        err.response?.data?.detail || "Failed to validate video. Please try again."
      );
    }
  };

  const simulateProgress = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          return 90;
        }
        return Math.min(90, p + Math.random() * 10);
      });
    }, 300);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("video/")) {
      onSelect(dropped);
    } else {
      setError("Please upload a valid video file");
    }
  };

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const picked = e.target.files?.[0];
    if (picked) {
      onSelect(picked);
    }
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    setStatus("idle");
    setVerdict(null);
    setMessage("");
    setChunkDetails([]);
    setError("");
  };

  const StatusIcon =
    verdict === "validated"
      ? ShieldCheck
      : verdict === "not_validated"
      ? XCircle
      : verdict === "partially_validated"
      ? AlertTriangle
      : Clock;

  const statusClass = verdict ? verdict.toLowerCase() : "";

  return (
    <div className="validate-page">
      <motion.div
        className="header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>
          <FileVideo className="title-icon" /> Validate Video Authenticity
        </h2>
        <p className="tagline">
          Upload a video to verify if it was recorded on a facility camera.
        </p>
      </motion.div>

      {/* Progress Bar */}
      <AnimatePresence>
        {status !== "idle" && status !== "done" && (
          <motion.div
            className="progress-bar-container"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>
            <div className="progress-text">
              <span>{status === "uploading" ? "Uploading..." : "Validating..."}</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid">
        <motion.div
          className="card uploader"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <UploadCloud className="dz-icon" />
            <p>Drag and drop a video here or</p>
            <label className="btn">
              Choose File
              <input type="file" accept="video/*" onChange={onPick} hidden />
            </label>
            {file && <span className="file-name">{file.name}</span>}
          </div>

          {status === "done" && (
            <button className="btn-reset" onClick={reset}>
              <RefreshCw /> Validate Another Video
            </button>
          )}
        </motion.div>

        <motion.div
          className="card result"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {status === "idle" && <p className="muted">No file selected.</p>}
          
          {error && (
            <div className="error-box">
              <XCircle className="error-icon" />
              <p>{error}</p>
            </div>
          )}

          {status !== "idle" && !error && (
            <>
              <div className="verdict-section">
                <div className={`verdict-badge ${statusClass}`}>
                  <StatusIcon className="v-icon" />
                  {status === "done" ? (
                    <span>
                      {verdict === "validated" && "Validated"}
                      {verdict === "not_validated" && "Not Validated"}
                      {verdict === "partially_validated" && "Partially Validated"}
                    </span>
                  ) : (
                    <span>Processing...</span>
                  )}
                </div>

                {status === "done" && message && (
                  <p className="verdict-message">{message}</p>
                )}
              </div>

              {status === "done" && chunkDetails.length > 0 && (
                <div className="chunk-summary">
                  <h4>Chunk Analysis</h4>
                  <div className="chunk-details">
                    {chunkDetails.map((chunk, idx) => (
                      <div key={idx} className={`chunk-item ${chunk.status}`}>
                        <span className="chunk-label">Chunk {chunk.chunk_index + 1}</span>
                        <span className={`chunk-status ${chunk.status}`}>
                          {chunk.status === "validated" ? (
                            <ShieldCheck className="chunk-icon" />
                          ) : (
                            <XCircle className="chunk-icon" />
                          )}
                          {chunk.status}
                        </span>
                        <code className="chunk-hash">{chunk.hash.slice(0, 10)}...</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Validate;

