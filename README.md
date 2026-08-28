# LaTech SMP Container Stack

The full docker container stack for the [Louisiana Tech University Minecraft sever](https://latechsmp.net). Created by Cameron Storer, homelabber since 2023, this container fleet is tried and true for server stability and fun times. 

Containers available from this config include: 

- Minecraft Server
- Viaproxy (for multi-version compatibility + bedrock support)
- Playit.gg Tunneling container
- Custom Website Container
- Discord/Minecraft bots for server management
    - included for examples of utilizing discord bot slash commands and automating in-game economy events.

## Instructions

To utilize this container stack on your machine:

1. Pull the repo ``git clone https://github.com/CameronStorer/LaTechSMP.net.git``
2. Execute the root container ``docker compose up -d``

After running those two commands, you should see a data folder appear locally. This folder will contain all of your server configurations, including plugins, worlds, instance jar. After a few seconds of initialization, you should see the that the server has successfully spun up and created your first world!

To ensure that that the Minecraft server is running properly run ``docker compose logs -f`` to follow the container's log output. If everything is working correctly, you will see something similar to world spawn generated 100%. Should there be any issues please repeat the previous instructions or analyze the container logs.

Once the container's successfully running, simply launch the chosen Minecraft version (determined in the ``docker-compose.yml`` config file) and type in your server's IP address and chosen port number (which will look similar to ``192.168.1.11:25565``) to join your local Minecraft server.

## Aditional Content

Noticibly, there is a commented block in the ``docker-compose.yml`` file 




| **Recommended Plugins:** |
| ------------------------ |
| AntiSeedCracker |
| ChestShop |
| Chunky |
| CoreProtect |
| DailyReward |
| DiscordSRV |
| DP-GUIShop |
| DPP-Core |
| DriveBackupV2 |
| EssentialsX |
| Floodgate-Spigot |
| Geyser-Spigot |
| GrimAC |
| LandClaimPlugin |
| LuckPerms |
| NexusAuctionHouse |
| NexusCore |
| Orebfuscator |
| PlaceholderAPI |
| PlayerStats |
| ProtocolLib |
| Spark |
| TAB |
| Vault |
| ViaBackwards |
| ViaVersion |
| voicechat |
| WorldEdit |
| WorldGuard |