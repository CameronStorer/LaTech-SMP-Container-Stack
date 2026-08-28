#!/bin/bash

# docker attach latechsmp-survival

# will present the user with terminal access to the MC server. Type CTRL + A + D to exit safely.
docker exec -it latechsmp-survival rcon-cli
