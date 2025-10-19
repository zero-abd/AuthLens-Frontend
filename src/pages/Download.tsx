import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download as DownloadIcon, Calendar, Clock, Camera, AlertCircle, CheckCircle, Loader, Info } from "lucide-react";
import axios from "axios";
import "./Download.css";

const BACKEND_URL = "http://localhost:8000";

export const Download: React.FC = () => {
  const [cameraId, setCameraId] = useState("cam_1");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    // Set today's date as default
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setStartDate(dateStr);
    setEndDate(dateStr);
    
    // Set default times (e.g., current time and 1 minute later)
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    setStartTime(`${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
    setEndTime(`${String(currentHour).padStart(2, '0')}:${String(currentMinute + 1).padStart(2, '0')}`);

    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 10000);
    return () => clearInterval(interval);
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

  const handleDownload = async () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      setMessage("Please fill in all date and time fields");
      setMessageType("error");
      return;
    }

    if (!cameraId) {
      setMessage("Please enter a camera ID");
      setMessageType("error");
      return;
    }

    setIsDownloading(true);
    setMessage("Searching for video chunks...");
    setMessageType("info");

    try {
      // Construct ISO datetime strings
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;

      // Validate time range
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      if (end <= start) {
        setMessage("End time must be after start time");
        setMessageType("error");
        setIsDownloading(false);
        return;
      }

      setMessage("Merging video chunks...");

      // Make request to backend
      const response = await axios.get(
        `${BACKEND_URL}/api/monitor/download-range`,
        {
          params: {
            camera_id: cameraId,
            start_datetime: startDateTime,
            end_datetime: endDateTime,
          },
          responseType: "blob",
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      
      // Get filename from Content-Disposition header or create one
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${cameraId}_${startDate}_${startTime.replace(':', '-')}_to_${endDate}_${endTime.replace(':', '-')}.mp4`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Video downloaded successfully!");
      setMessageType("success");
    } catch (error: any) {
      console.error("Download error:", error);
      
      if (error.response?.status === 404) {
        setMessage(`No video recordings found for ${cameraId} in the specified time range. The video may not have been captured.`);
        setMessageType("error");
      } else if (error.response?.status === 400) {
        setMessage(error.response.data?.detail || "Invalid request. Please check your input.");
        setMessageType("error");
      } else {
        setMessage("Failed to download video. Please try again.");
        setMessageType("error");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="download-page">
      <div className="download-container">
        <motion.div
          className="download-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-header">
            <div className="header-content">
              <DownloadIcon className="header-icon" size={40} />
              <div>
                <h1>Download Recorded Video</h1>
                <p className="subtitle">Download video recordings from a specific camera and time range</p>
              </div>
            </div>
            
            <div className={`status-badge ${backendConnected ? "connected" : "disconnected"}`}>
              <div className="status-dot" />
              <span>{backendConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>

          <div className="form-container">
            <div className="form-group">
              <label htmlFor="camera-id">
                <Camera size={18} />
                Camera ID
              </label>
              <input
                id="camera-id"
                type="text"
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
                placeholder="cam_1"
                className="input-field"
              />
              <small className="input-hint">e.g., cam_1, cam_2, cam_3</small>
            </div>

            <div className="time-grid">
              <div className="form-group">
                <label htmlFor="start-date">
                  <Calendar size={18} />
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="start-time">
                  <Clock size={18} />
                  Start Time
                </label>
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="end-date">
                  <Calendar size={18} />
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="end-time">
                  <Clock size={18} />
                  End Time
                </label>
                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading || !backendConnected}
              className={`download-btn ${isDownloading ? "loading" : ""}`}
            >
              {isDownloading ? (
                <>
                  <Loader className="spin" size={20} />
                  Downloading...
                </>
              ) : (
                <>
                  <DownloadIcon size={20} />
                  Download Video
                </>
              )}
            </button>

            {message && (
              <motion.div
                className={`alert alert-${messageType}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {messageType === "success" && <CheckCircle size={20} />}
                {messageType === "error" && <AlertCircle size={20} />}
                {messageType === "info" && <Loader className="spin" size={20} />}
                <span>{message}</span>
              </motion.div>
            )}
          </div>

          <div className="info-section">
            <div className="info-header">
              <Info size={18} />
              <h3>How it works</h3>
            </div>
            <ul className="info-list">
              <li>Select the camera ID (e.g., cam_1, cam_2)</li>
              <li>Choose the start date and time</li>
              <li>Choose the end date and time</li>
              <li>Click "Download Video" to merge and download the recording</li>
              <li>If no video exists for that time range, you'll be notified</li>
            </ul>
            
            <div className="info-note">
              <AlertCircle size={18} />
              <p>Videos are recorded minute-by-minute. The system will automatically merge all available chunks in your selected time range.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Download;
