import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileVideo,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Validate.css";

type Verdict = "Authentic" | "Unseen" | "Tampered";

export const Validate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "hashing" | "done">("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [digest, setDigest] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const onSelect = (selected: File) => {
    setFile(selected);
    setProgress(0);
    setStatus("hashing");
    setVerdict(null);
    simulateHashing(selected);
  };

  const simulateHashing = (f: File) => {
    const seedString = `${f.name}|${f.size}|${f.lastModified}`;
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed * 31 + seedString.charCodeAt(i)) >>> 0;
    }
    const hex = seed.toString(16).padStart(8, "0");
    const fakeDigest = `0x${hex}${hex}${hex}${hex}`.slice(0, 66);
    const id = `vid-${hex.slice(0, 6)}`;
    const verdicts: Verdict[] = ["Authentic", "Unseen", "Tampered"];
    const chosen = verdicts[seed % verdicts.length];

    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          setDigest(fakeDigest);
          setVideoId(id);
          setVerdict(chosen);
          setStatus("done");
          return 100;
        }
        const next = Math.min(100, p + 6 + Math.floor(seed % 7));
        return next;
      });
    }, 140);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onSelect(dropped);
  };

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const picked = e.target.files?.[0];
    if (picked) onSelect(picked);
  };

  const StatusIcon =
    verdict === "Authentic"
      ? ShieldCheck
      : verdict === "Tampered"
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
          Upload a video to simulate hashing and see a demo verdict.
        </p>
      </motion.div>

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

          <AnimatePresence>
            {status !== "idle" && (
              <motion.div
                className="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="bar">
                  <motion.div
                    className="fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.2 }}
                  />
                </div>
                <div className="meta">
                  <span>Hashing...</span>
                  <strong>{progress}%</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="card result"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {status === "idle" && <p className="muted">No file selected.</p>}
          {status !== "idle" && (
            <>
              <div className="row">
                <span>Digest</span>
                <code>{digest || "-"}</code>
              </div>
              <div className="row">
                <span>Video ID</span>
                <strong>{videoId || "-"}</strong>
              </div>
              <div className="row">
                <span>Status</span>
                <span className={`verdict ${statusClass}`}>
                  {status === "done" && verdict ? (
                    <>
                      <StatusIcon className="v-icon" /> {verdict}
                    </>
                  ) : (
                    <>
                      <Clock className="v-icon" /> Processing
                    </>
                  )}
                </span>
              </div>

              {status === "done" && verdict && videoId && (
                <div className="actions">
                  <Link to={`/ledger/${videoId}`} className="action">
                    <LinkIcon className="a-icon" /> View on Ledger
                  </Link>
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
