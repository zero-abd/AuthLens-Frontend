import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Play, Square, Star, Upload, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

interface FrameData {
  id: string;
  timestamp: number;
  data: string; // base64 encoded image
}

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [ngrokUrl, setNgrokUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Celestial background animation
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.querySelector('.stars-container');
      if (!starsContainer) return;

      // Clear existing stars
      starsContainer.innerHTML = '';

      // Create 100 stars
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        starsContainer.appendChild(star);
      }
    };

    createStars();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsRecording(false);
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.start();
    setIsRecording(true);

    // Capture frames every 100ms
    frameIntervalRef.current = setInterval(() => {
      captureFrame();
    }, 100);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const frame: FrameData = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data: imageData
    };

    setFrames(prev => [...prev, frame]);
  };

  const sendFramesToEndpoint = async () => {
    if (!ngrokUrl.trim()) {
      setError('Please enter a valid ngrok URL');
      return;
    }

    if (frames.length === 0) {
      setError('No frames to send');
      return;
    }

    try {
      setError('');
      setSuccess('Sending frames...');

      const response = await axios.post(`${ngrokUrl}/frames`, {
        frames: frames,
        metadata: {
          totalFrames: frames.length,
          timestamp: Date.now(),
          resolution: {
            width: canvasRef.current?.width || 1280,
            height: canvasRef.current?.height || 720
          }
        }
      });

      setSuccess(`Successfully sent ${frames.length} frames!`);
      console.log('Response:', response.data);
    } catch (err) {
      setError(`Failed to send frames: ${err}`);
      console.error('Send error:', err);
    }
  };

  const clearFrames = () => {
    setFrames([]);
    setSuccess('');
    setError('');
  };

  return (
    <div className="app">
      {/* Celestial Background */}
      <div className="celestial-bg">
        <div className="stars-container"></div>
        <div className="nebula"></div>
        <div className="galaxy"></div>
      </div>

      {/* Main Content */}
      <div className="content">
        <motion.div 
          className="header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="title">
            <Star className="title-icon" />
            Celestial Video Recorder
            <Star className="title-icon" />
          </h1>
          <p className="subtitle">Capture cosmic moments and stream them across the universe</p>
        </motion.div>

        <div className="main-content">
          {/* Video Section */}
          <motion.div 
            className="video-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="video-preview"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {!isStreaming && (
                <div className="video-overlay">
                  <Camera className="camera-icon" />
                  <p>Camera not active</p>
                </div>
              )}
            </div>

            <div className="video-controls">
              <motion.button
                className={`control-btn ${isStreaming ? 'stop' : 'start'}`}
                onClick={isStreaming ? stopCamera : startCamera}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isStreaming ? <Square /> : <Camera />}
                {isStreaming ? 'Stop Camera' : 'Start Camera'}
              </motion.button>

              <motion.button
                className={`control-btn ${isRecording ? 'recording' : 'record'}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isStreaming}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRecording ? <Square /> : <Play />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </motion.button>
            </div>
          </motion.div>

          {/* Controls Section */}
          <motion.div 
            className="controls-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="ngrok-input">
              <label htmlFor="ngrok-url">
                <Zap className="input-icon" />
                Ngrok Endpoint URL
              </label>
              <input
                id="ngrok-url"
                type="url"
                placeholder="https://your-ngrok-url.ngrok.io"
                value={ngrokUrl}
                onChange={(e) => setNgrokUrl(e.target.value)}
                className="url-input"
              />
            </div>

            <div className="frame-info">
              <div className="frame-count">
                <Star className="frame-icon" />
                <span>Frames Captured: {frames.length}</span>
              </div>
            </div>

            <div className="action-buttons">
              <motion.button
                className="action-btn send"
                onClick={sendFramesToEndpoint}
                disabled={frames.length === 0 || !ngrokUrl.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload />
                Send Frames to Endpoint
              </motion.button>

              <motion.button
                className="action-btn clear"
                onClick={clearFrames}
                disabled={frames.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Frames
              </motion.button>
            </div>
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="status-message error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                className="status-message success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;