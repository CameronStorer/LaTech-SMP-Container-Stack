import os
import re
import socket
import struct
import time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

RCON_HOST = os.environ.get("RCON_HOST", "latech_survival")
RCON_PORT = int(os.environ.get("RCON_PORT", "25575"))
RCON_PASSWORD = os.environ["RCON_PASSWORD"]
# "12am official time" - same zone the Minecraft container itself runs on
# (TZ=America/Chicago in the main LATECHSMP docker-compose.yml).
SERVER_TZ = ZoneInfo("America/Chicago")

USERDATA_DIR = "/dailyrewards-userdata"
USERCACHE_PATH = "/mc-data/usercache.json"
UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.yml$", re.IGNORECASE
)

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


def load_uuid_to_name() -> dict:
    import json

    try:
        with open(USERCACHE_PATH) as f:
            entries = json.load(f)
        return {e["uuid"].lower(): e["name"] for e in entries if "uuid" in e and "name" in e}
    except Exception as e:
        print(f"Failed to load usercache.json: {e}", flush=True)
        return {}


def known_player_uuids() -> list:
    """Every player DailyRewards has ever tracked - a per-UUID file exists in
    its userdata/ folder from their first interaction with the plugin
    onward, so this always reflects the live, current player set (re-read
    fresh every night, not cached in this script) rather than a static list
    that would miss anyone who joined after this service started."""
    try:
        return [
            fname[:-4]
            for fname in os.listdir(USERDATA_DIR)
            if UUID_RE.match(fname)
        ]
    except FileNotFoundError:
        return []


def seconds_until_next_midnight() -> float:
    now = datetime.now(SERVER_TZ)
    tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return (tomorrow - now).total_seconds()


def reset_everyone_daily() -> None:
    """Forces every known player's daily-reward cooldown to clear right now,
    regardless of when they last claimed - this (run at exactly midnight
    server-time, see main()) is what turns DailyRewards' native rolling
    24h-from-last-claim cooldown into an actual calendar-day boundary.
    Never grants money itself - /reward reset only clears eligibility, the
    player still has to actually claim (or auto-claim on next join) to
    receive it, so this can never cause a duplicate payment."""
    uuid_to_name = load_uuid_to_name()
    uuids = known_player_uuids()
    print(f"[{datetime.now(SERVER_TZ).isoformat()}] Midnight reset: {len(uuids)} known players", flush=True)
    for player_uuid in uuids:
        name = uuid_to_name.get(player_uuid.lower())
        if not name:
            print(f"  skipping {player_uuid} - not in usercache.json (never actually seen by the server)", flush=True)
            continue
        try:
            result = rcon_command(f"reward reset {name} daily")
            print(f"  reset {name}: {result.strip()}", flush=True)
        except Exception as e:
            print(f"  FAILED to reset {name}: {e}", flush=True)


def main():
    print(f"[{datetime.now(SERVER_TZ).isoformat()}] Midnight reset watcher started", flush=True)
    while True:
        wait_s = seconds_until_next_midnight()
        print(f"[{datetime.now(SERVER_TZ).isoformat()}] Sleeping {wait_s:.0f}s until next midnight", flush=True)
        time.sleep(wait_s)
        # A few seconds' margin so this always fires after, never right at
        # or before, the actual midnight tick.
        time.sleep(5)
        try:
            reset_everyone_daily()
        except Exception as e:
            print(f"[{datetime.now(SERVER_TZ).isoformat()}] Reset run failed: {e}", flush=True)


if __name__ == "__main__":
    main()
