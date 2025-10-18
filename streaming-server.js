const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store connected clients
const clients = new Set();
let streamActive = false;

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('🌟 New client connected for live streaming');
  clients.add(ws);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Celestial Live Stream',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming video chunks
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'video-chunk') {
        // Broadcast video chunk to all other clients (except sender)
        clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'video-chunk',
              chunk: message.chunk,
              timestamp: message.timestamp,
              frameId: message.frameId
            }));
          }
        });
        
        console.log(`📡 Streamed video chunk ${message.frameId} to ${clients.size - 1} clients`);
      }
      
      if (message.type === 'stream-start') {
        streamActive = true;
        console.log('🎬 Live stream started');
        
        // Notify all clients that streaming has started
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'stream-status',
              status: 'started',
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
      
      if (message.type === 'stream-stop') {
        streamActive = false;
        console.log('⏹️ Live stream stopped');
        
        // Notify all clients that streaming has stopped
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'stream-status',
              status: 'stopped',
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('👋 Client disconnected from live stream');
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    clients.delete(ws);
  });
});

// REST API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'active',
    streamActive: streamActive,
    connectedClients: clients.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/clients', (req, res) => {
  res.json({
    connectedClients: clients.size,
    clients: Array.from(clients).map(ws => ({
      readyState: ws.readyState,
      protocol: ws.protocol
    }))
  });
});

// Serve the receiver page
app.get('/receiver', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'receiver.html'));
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌟 Celestial Live Video Streaming Server',
    endpoints: {
      'WebSocket': 'ws://localhost:3001 (for live streaming)',
      'GET /api/status': 'Server status',
      'GET /api/clients': 'Connected clients',
      'GET /receiver': 'Receiver page for other computers'
    },
    instructions: [
      '1. Start ngrok: ngrok http 3001',
      '2. Copy the ngrok URL',
      '3. Use it in your React app for streaming',
      '4. Visit /receiver on other computers to watch the stream'
    ]
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Celestial Live Streaming Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for live video streaming`);
  console.log(`🌐 Receiver page available at: http://localhost:${PORT}/receiver`);
  console.log(`\n📋 Next steps:`);
  console.log(`1. Run: ngrok http ${PORT}`);
  console.log(`2. Copy the ngrok URL`);
  console.log(`3. Update your React app to use WebSocket streaming`);
  console.log(`4. Visit the receiver page on other computers! 🌟\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Celestial Live Streaming Server...');
  clients.forEach(client => client.close());
  server.close(() => {
    process.exit(0);
  });
});
