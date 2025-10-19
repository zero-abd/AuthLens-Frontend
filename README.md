# 🌟 Celestial Video Recorder

A beautiful, celestial-themed React application that records video from your camera and sends captured frames to ngrok endpoints in real-time.

## ✨ Features

- **Celestial Theme**: Beautiful space-themed UI with animated stars, nebulas, and galaxies
- **Real-time Video Recording**: Capture video from your camera with high-quality frame extraction
- **Frame Streaming**: Send captured frames to ngrok endpoints via HTTP POST requests
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Powered by Framer Motion for fluid user interactions
- **Modern UI**: Glassmorphism design with cosmic color schemes

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A modern web browser with camera access
- ngrok tunnel for receiving frames

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd celestial-video-recorder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📡 Setting up ngrok

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Start your backend server (example with Express):
```bash
# Create a simple Express server
npm init -y
npm install express cors multer
```

3. Create a simple server to receive frames:
```javascript
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/frames', (req, res) => {
  const { frames, metadata } = req.body;
  console.log(`Received ${frames.length} frames`);
  console.log('Metadata:', metadata);
  
  // Process frames here
  frames.forEach((frame, index) => {
    console.log(`Frame ${index + 1}: ${frame.id} at ${new Date(frame.timestamp)}`);
  });
  
  res.json({ success: true, message: 'Frames received successfully' });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

4. Start ngrok tunnel:
```bash
ngrok http 3001
```

5. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and paste it into the application.

## 🎮 How to Use

1. **Start Camera**: Click "Start Camera" to access your device's camera
2. **Begin Recording**: Click "Start Recording" to begin capturing frames
3. **Enter ngrok URL**: Paste your ngrok endpoint URL in the input field
4. **Send Frames**: Click "Send Frames to Endpoint" to transmit captured frames
5. **Stop Recording**: Click "Stop Recording" to end the capture session
6. **Clear Frames**: Use "Clear Frames" to reset the frame buffer

## 🔧 Technical Details

### Frame Format

Frames are sent as base64-encoded JPEG images with the following structure:

```json
{
  "frames": [
    {
      "id": "unique-frame-id",
      "timestamp": 1234567890123,
      "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    }
  ],
  "metadata": {
    "totalFrames": 150,
    "timestamp": 1234567890123,
    "resolution": {
      "width": 1280,
      "height": 720
    }
  }
}
```

### API Endpoint

The application sends POST requests to `{ngrok-url}/frames` with the frame data.

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 🎨 Customization

### Colors
The celestial theme uses a cosmic color palette:
- Primary: Deep space blues (`#0c0c1d`, `#1a1a2e`, `#16213e`)
- Accent: Gold (`#ffd700`), Sky blue (`#87ceeb`), Purple (`#9370db`)
- Highlights: Pink (`#ff69b4`), Violet (`#8a2be2`)

### Animations
- Star twinkling effects
- Nebula drift animations
- Galaxy rotation
- Gradient color shifts
- Button hover effects

## 🛠️ Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

### Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Celestial theme styles
├── index.tsx        # Application entry point
└── index.css        # Global styles
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🌟 Acknowledgments

- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Lucide React](https://lucide.dev/) for beautiful icons
- [Axios](https://axios-http.com/) for HTTP requests
- [Create React App](https://create-react-app.dev/) for the project setup

---

Made with ✨ and cosmic energy for HackTX 2025