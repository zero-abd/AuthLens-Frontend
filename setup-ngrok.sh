#!/bin/bash

echo "🌟 Setting up Celestial Video Recorder with ngrok..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing now..."
    npm install -g ngrok
fi

# Start the server
echo "🚀 Starting the frame receiver server..."
node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Start ngrok
echo "📡 Starting ngrok tunnel..."
ngrok http 3001 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the ngrok URL
echo "🔍 Getting ngrok URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL. Please check ngrok status manually."
    echo "   You can visit http://localhost:4040 to see the ngrok dashboard"
else
    echo ""
    echo "✅ Setup complete!"
    echo "📡 Your ngrok URL is: $NGROK_URL"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the ngrok URL above"
    echo "2. Open your React app at http://localhost:3000"
    echo "3. Paste the ngrok URL in the input field"
    echo "4. Start recording and send frames!"
    echo ""
    echo "🛑 To stop everything, press Ctrl+C"
fi

# Keep the script running
wait
