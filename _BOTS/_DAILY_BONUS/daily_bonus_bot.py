import json
import os
import re
import socket
import struct
import time
from datetime import datetime
from zoneinfo import ZoneInfo

LOG_PATH = "/mc-logs/latest.log"
STATE_PATH = "/data/claims.json"
RCON_HOST = os.environ.get("RCON_HOST", "latechsmp-survival")
RCON_PORT = int(os.environ.get("RCON_PORT", "25575"))
RCON_PASSWORD = os.environ["RCON_PASSWORD"]
# Matches the daily kit's payout in plugins/Essentials/kits.yml - kept as
# its own config value here rather than parsed out of that YAML at runtime,
# since Essentials' kit item syntax (arbitrary items + money entries mixed)
# isn't something worth writing a generic parser for just to extract one
# money line. If the kit's payout ever changes, update both places.
DAILY_BONUS_AMOUNT = 30
# "12am official time" - same zone the Minecraft container itself runs on
# (TZ=America/Chicago in docker-compose.yml), so the calendar day used to
# decide "already claimed today" always matches the server's own clock.
SERVER_TZ = ZoneInfo("America/Chicago")

JOIN_RE = re.compile(r"^\[[\d:]+\] \[Server thread/INFO\]: (\S+) joined the game$")

# RCON auth/execute over the Source RCON protocol (Valve's, which Minecraft's
# built-in RCON also implements) - a small, stable, well-documented binary
# protocol, not worth pulling in a dependency for.
SERVERDATA_AUTH = 3
SERVERDATA_EXECCOMMAND = 2


def rcon_command(command: str) -> str:
    with socket.create_connection((RCON_HOST, RCON_PORT), timeout=10) as sock:
        _rcon_send(sock, 1, SERVERDATA_AUTH, RCON_PASSWORD)
        auth_id, _ = _rcon_recv(sock)
        if auth_id == -1:
            raise RuntimeError("RCON authentication failed")
        _rcon_send(sock, 2, SERVERDATA_EXECCOMMAND, command)
        _, body = _rcon_recv(sock)
        return body


def _rcon_send(sock: socket.socket, request_id: int, pkt_type: int, body: str) -> None:
    payload = struct.pack("<ii", request_id, pkt_type) + body.encode("utf-8") + b"\x00\x00"
    sock.sendall(struct.pack("<i", len(payload)) + payload)


def _rcon_recv(sock: socket.socket):
    length = struct.unpack("<i", sock.recv(4))[0]
    data = b""
    while len(data) < length:
        data += sock.recv(length - len(data))
    request_id, _pkt_type = struct.unpack("<ii", data[:8])
    body = data[8:-2].decode("utf-8", errors="replace")
    return request_id, body


def load_state() -> dict:
    if os.path.exists(STATE_PATH):
        try:
            with open(STATE_PATH) as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_state(state: dict) -> None:
    tmp = STATE_PATH + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2, sort_keys=True)
    os.replace(tmp, STATE_PATH)


def today_str() -> str:
    return datetime.now(SERVER_TZ).strftime("%Y-%m-%d")


def grant_daily_bonus(player: str, state: dict) -> None:
    today = today_str()
    if state.get(player) == today:
        return  # already claimed today - nothing to do
    try:
        result = rcon_command(f"eco give {player} {DAILY_BONUS_AMOUNT}")
        print(f"[{datetime.now(SERVER_TZ).isoformat()}] Granted daily bonus to {player}: {result.strip()}", flush=True)
        state[player] = today
        save_state(state)
    except Exception as e:
        # Don't record the claim if the grant itself failed - next join (or
        # next poll cycle catching the same join line again, see follow()
        # below) gets a real retry instead of silently skipping them for the
        # rest of the day.
        print(f"[{datetime.now(SERVER_TZ).isoformat()}] Failed to grant daily bonus to {player}: {e}", flush=True)


def follow(path: str):
    """Polls latest.log for new lines, tolerating the file not existing yet
    (server still starting) and Minecraft's own log rotation (the file gets
    truncated/replaced at midnight server-time and on restart - detected by
    the file shrinking, at which point this re-opens from the start).
    Starts at the current end of the file, not the beginning - on first
    launch (or any restart) this must only react to joins from here
    forward, never replay everyone who already joined earlier in the
    existing log as if they were joining right now."""
    try:
        pos = os.path.getsize(path)
    except FileNotFoundError:
        pos = 0
    while True:
        try:
            size = os.path.getsize(path)
            if size < pos:
                pos = 0  # rotated/truncated - start over on the new file
            with open(path, "r", errors="replace") as f:
                f.seek(pos)
                lines = f.readlines()
                pos = f.tell()
            for line in lines:
                yield line.rstrip("\n")
        except FileNotFoundError:
            pass
        time.sleep(2)


def main():
    state = load_state()
    print(f"[{datetime.now(SERVER_TZ).isoformat()}] Daily bonus watcher started, tailing {LOG_PATH}", flush=True)
    for line in follow(LOG_PATH):
        match = JOIN_RE.match(line)
        if match:
            grant_daily_bonus(match.group(1), state)


if __name__ == "__main__":
    main()
