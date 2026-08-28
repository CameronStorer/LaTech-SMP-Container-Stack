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


## Plugins

For the most optimal vanilla survival experience, I suggest installing these mods on your server to prevent undesired greifing, prevent hacking, and protect your world. There are also plugins listed here that add functional **economy** and **auction house** systems.

| **Recommended Plugins:** |   |
| ------------------------ | - |
| AntiSeedCracker | Attempt to prevent player seed detection |
| ChestShop | Required by other plugins |
| Chunky | Preload chunks of your world |
| CoreProtect | Protect your world with detailed player action history |
| DailyReward | Add daily reward system |
| DiscordSRV | Add discord channel integrations 
| DP-GUIShop | Create simple GUI-enabled shops |
| DPP-Core | Required by other plugins |
| DriveBackupV2 | Perpetually back up your server |
| EssentialsX | Helpful commands |
| Floodgate-Spigot | Bedrock support plugin |
| Geyser-Spigot | Bedrock support plugin |
| GrimAC | Anti-cheat |
| LandClaimPlugin | Allow players to claim land |
| LuckPerms | Better control of player-command-authority |
| NexusAuctionHouse | Add an auction house |
| NexusCore | Other plugin requirement |
| Orebfuscator | Prevent X-raying |
| PlaceholderAPI | Other plugin requirement |
| PlayerStats | Obtain detailed player statistics |
| ProtocolLib | Other plugin requirement |
| Spark | Other plugin requirement |
| TAB | Other plugin requirement |
| Vault | Other plugin requirement |
| ViaBackwards | Add support for older Minecraft versions |
| ViaVersion | Add support for newer Minecraft versions |
| voicechat | Support proximity chat |
| WorldEdit | Enable Easy world manipulation |
| WorldGuard | Guard portions of your world |