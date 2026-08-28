#!/bin/bash
set -e
echo ">>> Starting Minecraft server with Tailscale..."

# Start Playit in background
#echo ">>> Starting Playit tunnel..."
#SECRET_KEY=$SECRET_KEY playit &

echo ">>> Starting Minecraft server..."
exec /start
