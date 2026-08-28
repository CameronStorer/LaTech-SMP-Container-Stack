#!/usr/bin/env bash
#
# Checks GeyserMC's download API for a newer Geyser-ViaProxy build than the
# one currently installed, and if found, swaps it in and restarts the
# viaproxy container. Meant to run daily via cron.

set -euo pipefail

PLATFORM="viaproxy"
PROJECT="geyser"
API_BASE="https://download.geysermc.org/v2/projects/${PROJECT}"

COMPOSE_DIR="/srv/PERSONAL/LATECHSMP"
PLUGIN_DIR="${COMPOSE_DIR}/viaproxy-data/plugins"
JAR_PATH="${PLUGIN_DIR}/Geyser-ViaProxy.jar"
CONTAINER_NAME="viaproxy"

LOG_DIR="${COMPOSE_DIR}/scripts/logs"
LOG_FILE="${LOG_DIR}/update-geyser.log"
BACKUP_DIR="${PLUGIN_DIR}/backups"

mkdir -p "$LOG_DIR" "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

fail() {
    log "ERROR: $*"
    exit 1
}

log "Checking for Geyser updates (platform=${PLATFORM})..."

# Latest known Minecraft/Geyser version, then latest build for that version.
LATEST_VERSION=$(curl -fsS "${API_BASE}" | jq -r '.versions[-1]') \
    || fail "Failed to fetch version list from GeyserMC API"
[ -n "$LATEST_VERSION" ] && [ "$LATEST_VERSION" != "null" ] \
    || fail "Could not determine latest Geyser version"

BUILD_JSON=$(curl -fsSL "${API_BASE}/versions/${LATEST_VERSION}/builds/latest") \
    || fail "Failed to fetch latest build info for version ${LATEST_VERSION}"

BUILD_NUM=$(echo "$BUILD_JSON" | jq -r '.build')
REMOTE_SHA=$(echo "$BUILD_JSON" | jq -r ".downloads[\"${PLATFORM}\"].sha256")
REMOTE_NAME=$(echo "$BUILD_JSON" | jq -r ".downloads[\"${PLATFORM}\"].name")

[ -n "$BUILD_NUM" ] && [ "$BUILD_NUM" != "null" ] \
    || fail "Could not determine latest build number"
[ -n "$REMOTE_SHA" ] && [ "$REMOTE_SHA" != "null" ] \
    || fail "Platform '${PLATFORM}' not found in build downloads"

log "Latest available: Geyser ${LATEST_VERSION} build ${BUILD_NUM} (${REMOTE_NAME})"

# Compare against what's currently installed.
if [ -f "$JAR_PATH" ]; then
    LOCAL_SHA=$(sha256sum "$JAR_PATH" | awk '{print $1}')
else
    LOCAL_SHA=""
    log "No existing jar found at ${JAR_PATH}; will install fresh."
fi

if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
    log "Already up to date. Nothing to do."
    exit 0
fi

log "Update available. Downloading new build..."

DOWNLOAD_URL="${API_BASE}/versions/${LATEST_VERSION}/builds/${BUILD_NUM}/downloads/${PLATFORM}"
TMP_JAR=$(mktemp "${PLUGIN_DIR}/.Geyser-ViaProxy.jar.XXXXXX")

cleanup() { rm -f "$TMP_JAR"; }
trap cleanup EXIT

curl -fsSL "$DOWNLOAD_URL" -o "$TMP_JAR" \
    || fail "Download failed from ${DOWNLOAD_URL}"

DOWNLOADED_SHA=$(sha256sum "$TMP_JAR" | awk '{print $1}')
[ "$DOWNLOADED_SHA" = "$REMOTE_SHA" ] \
    || fail "Checksum mismatch after download (expected ${REMOTE_SHA}, got ${DOWNLOADED_SHA}); aborting, leaving old jar in place"

# Back up the current jar before replacing it.
if [ -f "$JAR_PATH" ]; then
    BACKUP_PATH="${BACKUP_DIR}/Geyser-ViaProxy.jar.$(date '+%Y%m%d-%H%M%S').bak"
    cp "$JAR_PATH" "$BACKUP_PATH"
    log "Backed up current jar to ${BACKUP_PATH}"
    # Keep only the 5 most recent backups.
    ls -1t "${BACKUP_DIR}"/Geyser-ViaProxy.jar.*.bak 2>/dev/null | tail -n +6 | xargs -r rm -f
fi

chmod 755 "$TMP_JAR"
mv "$TMP_JAR" "$JAR_PATH"
trap - EXIT

log "Installed Geyser ${LATEST_VERSION} build ${BUILD_NUM}."

log "Restarting ${CONTAINER_NAME} container to apply update..."
if docker restart "$CONTAINER_NAME" >>"$LOG_FILE" 2>&1; then
    log "Restart successful."
else
    log "WARNING: failed to restart container '${CONTAINER_NAME}'. New jar is in place but not yet loaded."
fi

log "Update complete."
