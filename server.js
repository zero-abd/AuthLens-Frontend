const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create frames directory if it doesn't exist
const framesDir = path.join(__dirname, 'received-frames');
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir);
}

// Route to receive frames
app.post('/frames', (req, res) => {
  try {
    const { frames, metadata } = req.body;
    
    console.log(`\n🌟 Received ${frames.length} frames from Celestial Video Recorder!`);
    console.log(`📊 Metadata:`, {
      totalFrames: metadata.totalFrames,
      timestamp: new Date(metadata.timestamp).toLocaleString(),
      resolution: `${metadata.resolution.width}x${metadata.resolution.height}`
    });
    
    // Process each frame
    frames.forEach((frame, index) => {
      const frameData = frame.data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      const buffer = Buffer.from(frameData, 'base64');
      
      // Save frame to file
      const filename = `frame_${frame.id}_${index + 1}.jpg`;
      const filepath = path.join(framesDir, filename);
      
      fs.writeFileSync(filepath, buffer);
      console.log(`💾 Saved frame ${index + 1}/${frames.length}: ${filename}`);
    });
    
    // Send success response
    res.json({
      success: true,
      message: `Successfully received and saved ${frames.length} frames!`,
      framesReceived: frames.length,
      timestamp: new Date().toISOString(),
      savedTo: framesDir
    });
    
  } catch (error) {
    console.error('❌ Error processing frames:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Celestial Frame Receiver is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌟 Celestial Frame Receiver Server',
    endpoints: {
      'POST /frames': 'Receive frames from the video recorder',
      'GET /health': 'Health check',
      'GET /': 'This message'
    },
    instructions: [
      '1. Start ngrok: ngrok http 3001',
      '2. Copy the ngrok URL (e.g., https://abc123.ngrok.io)',
      '3. Paste it in your React app',
      '4. Start recording and send frames!'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Celestial Frame Receiver Server running on port ${PORT}`);
  console.log(`📡 Ready to receive frames from your React app!`);
  console.log(`\n📋 Next steps:`);
  console.log(`1. Run: ngrok http ${PORT}`);
  console.log(`2. Copy the ngrok URL`);
  console.log(`3. Paste it in your React app`);
  console.log(`4. Start recording! 🌟\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Celestial Frame Receiver Server...');
  process.exit(0);
});
