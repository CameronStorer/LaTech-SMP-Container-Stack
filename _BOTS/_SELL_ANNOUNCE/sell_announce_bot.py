import json
import os
import re
import time
import urllib.request
from datetime import datetime

LOG_PATH = "/mc-logs/latest.log"
USERCACHE_PATH = "/mc-data/usercache.json"
DISCORD_BOT_TOKEN = os.environ["DISCORD_BOT_TOKEN"]
DISCORD_CHANNEL_ID = os.environ["DISCORD_CHANNEL_ID"]

# Matches DiscordSRV's own MinecraftPlayerAchievementMessage embed exactly
# (see messages.yml) - same gold, same single-line Author (icon + text,
# nothing in Title/Description/Fields/Footer), same Timestamp: false. This
# is the closest existing precedent to a sell notification (a one-line
# "player did a notable thing" event), so matching it makes this look like
# a native DiscordSRV message type rather than a bolted-on extra.
EMBED_COLOR = 0xFFD700

# Matches: [Essentials] <player> sold <item> for $<amount> (<qty> items at $<price> each).
# Confirmed live 2026-08-12 against real /sell transactions (blocks and hand
# variants both produce this exact shape) - this is the only place Essentials
# logs a completed sale, there's no dedicated broadcast/webhook config option
# for it, so tailing the console log is the actual mechanism, not a shortcut.
SELL_RE = re.compile(
    r"\[Essentials\] (\S+) sold ([\w]+) for \$([\d.]+) \((\d+) items? at \$([\d.]+) each\)\.$"
)


def pretty_item(item: str) -> str:
    return item.replace("_", " ").title()


def _parse_expires_on(value: str):
    try:
        # e.g. "2026-09-12 18:50:42 -0500"
        return datetime.strptime(value, "%Y-%m-%d %H:%M:%S %z")
    except Exception:
        return datetime.min


def load_uuid_by_name() -> dict:
    # usercache.json can hold multiple entries for the same name - a player
    # who changed their username lets a different account eventually get
    # reassigned the old one, leaving a stale entry behind (confirmed live
    # 2026-08-13: Crishbiskit09 had a real current entry AND a ~9-month-old
    # stale one further down the file). A plain {name: uuid} dict comp lets
    # whichever entry comes later in the file silently win regardless of
    # which is actually current, so this explicitly keeps the one with the
    # latest expiresOn per name instead of trusting file order.
    try:
        with open(USERCACHE_PATH) as f:
            entries = json.load(f)
        result = {}
        best_expiry = {}
        for e in entries:
            if "uuid" not in e or "name" not in e:
                continue
            name = e["name"]
            expiry = _parse_expires_on(e.get("expiresOn", ""))
            if name not in result or expiry > best_expiry[name]:
                result[name] = e["uuid"]
                best_expiry[name] = expiry
        return result
    except Exception as e:
        print(f"Failed to load usercache.json: {e}", flush=True)
        return {}


def avatar_url_for(player: str, name_to_uuid: dict) -> str:
    # crafatar.com (originally used here to match DiscordSRV's default
    # %embedavatarurl%) is currently returning HTTP 521 - its own origin
    # server is down behind Cloudflare, confirmed live 2026-08-13, not
    # something fixable on this end. mc-heads.net is a well-maintained
    # alternative, confirmed reachable and serving real avatar images live.
    player_uuid = name_to_uuid.get(player)
    if player_uuid:
        return f"https://mc-heads.net/avatar/{player_uuid}"
    return f"https://mc-heads.net/avatar/{player}"  # falls back to name-based lookup


def send_embed(author_name: str, icon_url: str) -> None:
    payload = {
        "embeds": [
            {
                "color": EMBED_COLOR,
                "author": {"name": author_name, "icon_url": icon_url},
            }
        ]
    }
    req = urllib.request.Request(
        f"https://discord.com/api/v10/channels/{DISCORD_CHANNEL_ID}/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bot {DISCORD_BOT_TOKEN}",
            "Content-Type": "application/json",
            # Discord's API sits behind Cloudflare, which blocks Python's
            # default urllib User-Agent as a known scraper signature (403,
            # Cloudflare error 1010 - confirmed live 2026-08-13, not a
            # Discord-side permission issue at all). Discord's own API docs
            # recommend a descriptive User-Agent for exactly this reason.
            "User-Agent": "DiscordBot (LATechSMP sell-announce-bot, 1.0)",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        resp.read()


def follow(path: str):
    """Starts at the current end of the file, not the beginning - on launch
    (or any restart) this must only react to sales from here forward, never
    replay the whole day's existing sales as if they just happened. Also
    tolerates Minecraft's own log rotation (file shrinks -> re-open from 0)."""
    try:
        pos = os.path.getsize(path)
    except FileNotFoundError:
        pos = 0
    while True:
        try:
            size = os.path.getsize(path)
            if size < pos:
                pos = 0
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
    print("Sell announce watcher started, tailing " + LOG_PATH, flush=True)
    for line in follow(LOG_PATH):
        match = SELL_RE.search(line)
        if not match:
            continue
        player, item, total, qty, unit_price = match.groups()
        name_to_uuid = load_uuid_by_name()  # re-read fresh each time - cheap, always current
        author_name = f"{player} sold {qty}x {pretty_item(item)} for ${total}"
        try:
            send_embed(author_name, avatar_url_for(player, name_to_uuid))
            print(f"Announced: {author_name}", flush=True)
        except Exception as e:
            print(f"Failed to announce sale: {e}", flush=True)


if __name__ == "__main__":
    main()
