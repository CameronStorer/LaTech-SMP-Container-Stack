FROM itzg/minecraft-server:latest

# Install Playit
RUN apt-get update && apt-get install -y curl && \
    curl -SsL https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64 -o /usr/local/bin/playit && \
    chmod +x /usr/local/bin/playit && \
    rm -rf /var/lib/apt/lists/*
    
# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/start"]
