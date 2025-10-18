# 🌟 Celestial Live Video Streaming - Setup Guide

## For Your Colleague (Windows Computer)

### Quick Setup Steps:

1. **Clone/Pull the repository**
   ```bash
   git pull origin main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up ngrok account** (if not already done)
   - Go to https://dashboard.ngrok.com/signup
   - Sign up for a free account
   - Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

4. **Configure ngrok**
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

5. **Start the streaming server**
   ```bash
   node streaming-server.js
   ```

6. **Start ngrok tunnel**
   ```bash
   ngrok http 3001
   ```

7. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

8. **Open the React app**
   ```bash
   cd celestial-video-recorder
   npm start
   ```

9. **Configure the app**
   - Paste your ngrok URL in the input field
   - Select "Live Stream" mode
   - Start camera and recording

### To Watch Someone Else's Stream:

1. **Get the streamer's ngrok URL** (e.g., `https://daniel-keratogenous-thickly.ngrok-free.dev`)

2. **Visit the receiver page**
   ```
   https://daniel-keratogenous-thickly.ngrok-free.dev/receiver
   ```

3. **The page will automatically connect and show the live stream!**

## Troubleshooting:

### If you get "ENOENT: no such file or directory" error:
- Make sure you're running `node streaming-server.js` (not `node server.js`)
- Check that the `public/receiver.html` file exists
- Restart the server

### If WebSocket connection fails:
- Check that ngrok is running
- Verify the ngrok URL is correct
- Make sure both computers are using the same ngrok URL

### If video doesn't appear:
- Check browser console for errors
- Make sure the streamer has started recording
- Verify WebSocket connection status

## Features:

- **Live Stream Mode**: Real-time video streaming via WebSocket
- **Send Frames Mode**: Original frame-by-frame sending
- **Receiver Page**: Watch live streams from other computers
- **Connection Status**: Real-time connection monitoring
- **Celestial Theme**: Beautiful space-themed UI

## URLs:

- **React App**: `http://localhost:3000`
- **Streaming Server**: `http://localhost:3001`
- **Receiver Page**: `http://localhost:3001/receiver`
- **ngrok Dashboard**: `http://localhost:4040`

---

🌟 **Made with cosmic energy for HackTX 2025** 🌟
