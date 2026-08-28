"""
Slash commands letting members self-serve change their major/degree and class
year roles, mirroring the same single-select role groups already configured
in the server's native Onboarding (Channels & Roles). This just gives members
a quicker way to do the same thing from chat.
"""
import re

import discord
from discord import app_commands

CONFIG_PATH = "/discordsrv-config.yml"
# Please paste your guild id below for use
GUILD_ID = 

# Populate the following two dictionaries with "role_name":role_id key:values if desired
MAJOR_ROLES = {

}
YEAR_ROLES = {

}


def load_token() -> str:
    with open(CONFIG_PATH) as f:
        content = f.read()
    match = re.search(r"^BotToken:\s*(\S+)", content, re.M)
    if not match:
        raise RuntimeError(f"Could not find BotToken in {CONFIG_PATH}")
    return match.group(1)


intents = discord.Intents.default()
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)


async def swap_role(interaction: discord.Interaction, role_map: dict[str, int], chosen_name: str, label: str):
    guild = interaction.guild
    member = interaction.user
    chosen_role = guild.get_role(role_map[chosen_name])
    if chosen_role is None:
        await interaction.response.send_message(f"That {label.lower()} role no longer exists - let a mod know.", ephemeral=True)
        return

    other_role_ids = {rid for name, rid in role_map.items() if name != chosen_name}
    to_remove = [r for r in member.roles if r.id in other_role_ids]

    if to_remove:
        await member.remove_roles(*to_remove, reason=f"/{label.lower()} self-service change")
    if chosen_role not in member.roles:
        await member.add_roles(chosen_role, reason=f"/{label.lower()} self-service change")

    await interaction.response.send_message(f"Your {label.lower()} is now set to **{chosen_name}**.", ephemeral=True)


@tree.command(name="major", description="Set or change your major/degree", guild=discord.Object(id=GUILD_ID))
@app_commands.choices(choice=[app_commands.Choice(name=n, value=n) for n in MAJOR_ROLES])
async def major(interaction: discord.Interaction, choice: app_commands.Choice[str]):
    await swap_role(interaction, MAJOR_ROLES, choice.value, "Major")


@tree.command(name="year", description="Set or change your class year", guild=discord.Object(id=GUILD_ID))
@app_commands.choices(choice=[app_commands.Choice(name=n, value=n) for n in YEAR_ROLES])
async def year(interaction: discord.Interaction, choice: app_commands.Choice[str]):
    await swap_role(interaction, YEAR_ROLES, choice.value, "Year")


@client.event
async def on_ready():
    await tree.sync(guild=discord.Object(id=GUILD_ID))
    print(f"Logged in as {client.user}. Commands synced to guild {GUILD_ID}.")


if __name__ == "__main__":
    client.run(load_token())
