# 🔍 Debugging Live Video Streaming

## For You (Streamer):

1. **Open your React app** at `http://localhost:3000`

2. **Open browser console** (F12 → Console tab)

3. **Set up streaming:**
   - Make sure "Live Stream" mode is selected
   - Paste your ngrok URL: `https://daniel-keratogenous-thickly.ngrok-free.dev`
   - Click "Start Camera"
   - Click "Start Recording"

4. **Check console logs** - you should see:
   ```
   🌟 Connected to live streaming server
   📡 Sending frame via WebSocket, size: [number]
   ✅ Frame sent: [frameId]
   ```

## For Your Colleague (Receiver):

1. **Open the receiver page** at: `https://daniel-keratogenous-thickly.ngrok-free.dev/receiver`

2. **Open browser console** (F12 → Console tab)

3. **Check console logs** - you should see:
   ```
   🌟 Connected to Celestial Live Stream
   📨 Received message: video-chunk [object]
   🎬 Received video chunk: [frameId]
   🎥 Processing video chunk: [frameId] Size: [number]
   🖼️ Created image URL: blob:...
   ✅ Image loaded successfully: [width] x [height]
   🎬 Video stream updated with new frame
   ```

## Common Issues:

### If you see "WebSocket not connected":
- Check that ngrok is running
- Verify the ngrok URL is correct
- Make sure the streaming server is running

### If frames are sent but not received:
- Check network connectivity
- Verify ngrok tunnel is active
- Check browser console for errors

### If frames are received but video doesn't show:
- Check if images are loading (look for "Image loaded successfully")
- Check for CORS errors in console
- Try refreshing the receiver page

## Quick Test:

1. **You**: Start streaming and check console for "Frame sent" messages
2. **Colleague**: Open receiver page and check console for "Received video chunk" messages
3. **Both**: Share console screenshots if there are errors

---

🌟 **Let me know what you see in the console logs!** 🌟
