import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Square, Clock, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import "./Monitor.css";

const BACKEND_URL = "http://localhost:8000";

export const Monitor: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [status, setStatus] = useState<string>("Ready to start monitoring");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [minutesCaptured, setMinutesCaptured] = useState(0);
  const [backendConnected, setBackendConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextMinuteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMonitoringRef = useRef<boolean>(false);
  const minutesCountRef = useRef<number>(0);

  useEffect(() => {
    checkBackendConnection();
    const backendInterval = setInterval(checkBackendConnection, 10000);
    
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      cleanup();
      clearInterval(backendInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/`);
      if (response.data) {
        setBackendConnected(true);
      }
    } catch (err) {
      setBackendConnected(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (nextMinuteTimeoutRef.current) {
      clearTimeout(nextMinuteTimeoutRef.current);
      nextMinuteTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  const getNextMinuteMark = (): Date => {
    const now = new Date();
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setMinutes(next.getMinutes() + 1);
    return next;
  };

  const formatTimeForFilename = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  };

  const uploadChunk = async (blob: Blob, startTime: Date, endTime: Date) => {
    try {
      const formData = new FormData();
      formData.append("video", blob, "chunk.mp4");

      const startTimeStr = formatTimeForFilename(startTime);
      const endTimeStr = formatTimeForFilename(endTime);

      const response = await axios.post(
        `${BACKEND_URL}/api/monitor/upload-chunk`,
        formData,
        {
          params: {
            camera_id: "cam_1",
            start_time: startTimeStr,
            end_time: endTimeStr,
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Chunk uploaded:", response.data);
      setUploadStatus(`✓ Chunk uploaded successfully`);
      setMinutesCaptured(minutesCountRef.current);

      return response.data;
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(`Upload failed: ${err.response?.data?.detail || err.message}`);
      throw err;
    }
  };

  const startRecordingChunk = (startTime: Date, endTime: Date) => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];

    const options = { mimeType: "video/webm;codecs=vp8" };
    const mediaRecorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      console.log(`Recording stopped. Blob size: ${blob.size} bytes`);

      try {
        await uploadChunk(blob, startTime, endTime);
      } catch (err) {
        console.error("Failed to upload chunk:", err);
      }

      // Only schedule next chunk if monitoring is still active
      if (isMonitoringRef.current) {
        scheduleNextChunk();
      }
    };

    mediaRecorder.start();
    minutesCountRef.current += 1;
    setStatus(`Recording minute ${minutesCountRef.current}...`);

    const duration = endTime.getTime() - startTime.getTime();
    recordingTimeoutRef.current = setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }, duration);
  };

  const scheduleNextChunk = () => {
    // Start recording immediately for the next minute
    const now = new Date();
    const nextStart = new Date(now);
    nextStart.setSeconds(0, 0);
    nextStart.setMinutes(nextStart.getMinutes() + 1);

    const nextEnd = new Date(nextStart);
    nextEnd.setMinutes(nextEnd.getMinutes() + 1);

    // Start recording immediately instead of waiting
    startRecordingChunk(nextStart, nextEnd);
  };

  const startMonitoring = async () => {
    try {
      setError("");
      setMinutesCaptured(0);
      minutesCountRef.current = 0;
      setStatus("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setIsMonitoring(true);
      isMonitoringRef.current = true;

      const now = new Date();
      const nextStart = getNextMinuteMark();
      const nextEnd = new Date(nextStart);
      nextEnd.setMinutes(nextEnd.getMinutes() + 1);

      const delay = nextStart.getTime() - now.getTime();

      setStatus(`Waiting for ${nextStart.toLocaleTimeString()}...`);

      nextMinuteTimeoutRef.current = setTimeout(() => {
        startRecordingChunk(nextStart, nextEnd);
      }, delay);
    } catch (err) {
      setError("Failed to access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopMonitoring = () => {
    setStatus("Stopping monitoring...");
    setIsMonitoring(false);
    isMonitoringRef.current = false;

    if (nextMinuteTimeoutRef.current) {
      clearTimeout(nextMinuteTimeoutRef.current);
      nextMinuteTimeoutRef.current = null;
    }

    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.onstop = () => {
        console.log("Recording stopped without upload (incomplete chunk)");
        mediaRecorderRef.current = null;
      };
      mediaRecorderRef.current.stop();
    } else {
      mediaRecorderRef.current = null;
    }

    cleanup();
    setStatus("Monitoring stopped");
    setUploadStatus("");
  };

  return (
    <div className="monitor-page">
      <motion.div
        className="header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>
          <Video className="title-icon" /> Live Camera Monitoring
        </h2>
        <p className="tagline">
          Record and store video in 1-minute chunks synchronized to clock minutes
        </p>
      </motion.div>

      <div className="monitor-grid">
        <motion.div
          className="card video-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="video-container">
            <video ref={videoRef} autoPlay muted playsInline className="video-preview" />
            {!isMonitoring && (
              <div className="video-overlay">
                <Video className="camera-icon" />
                <p>Click Start Monitoring to begin</p>
              </div>
            )}
          </div>

          <div className="video-controls">
            <button
              className={`btn ${isMonitoring ? "btn-stop" : "btn-start"}`}
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? (
                <>
                  <Square /> Stop Monitoring
                </>
              ) : (
                <>
                  <Video /> Start Monitoring
                </>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="card status-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>
            <Clock className="icon" /> Status
          </h3>

          <div className="status-info">
            <div className="status-bubble-container">
              <div className={`status-bubble ${backendConnected ? "connected" : "disconnected"}`}>
                <div className="bubble-dot"></div>
                <span>Server: {backendConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>

            <div className="status-row">
              <span>Monitoring:</span>
              <strong className={isMonitoring ? "active" : "inactive"}>
                {isMonitoring ? "Live" : "Stopped"}
              </strong>
            </div>

            <div className="status-row">
              <span>Minutes Captured:</span>
              <strong className="minutes-count">{minutesCaptured}</strong>
            </div>

            <div className="status-row">
              <span>Current Time:</span>
              <strong>{currentTime}</strong>
            </div>
          </div>

          {status && (
            <div className="status-message">
              <Clock className="msg-icon" />
              <p>{status}</p>
            </div>
          )}

          {uploadStatus && (
            <div className="upload-status success">
              <CheckCircle className="msg-icon" />
              <p>{uploadStatus}</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle className="msg-icon" />
              <p>{error}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Monitor;
