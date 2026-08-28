FROM python:3-alpine

# tzdata - Python's zoneinfo (stdlib, no pip package needed) reads the
# system timezone database, which alpine doesn't ship by default.
RUN apk add --no-cache tzdata

COPY daily_bonus_bot.py /opt/daily_bonus_bot.py

CMD ["python3", "/opt/daily_bonus_bot.py"]
