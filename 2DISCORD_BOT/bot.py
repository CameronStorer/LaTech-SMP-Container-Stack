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
GUILD_ID = REMOVED

MAJOR_ROLES = {
    "Computer Science": REMOVED,
    "Mechanical Engineer": 1440626667746758707,
    "Civil Engineer": 1440626707815071858,
    "Electrical Engineer": 1440626743311339532,
    "Chemical Engineer": 1440626842074742945,
    "Cyber Engineer": 1440626887297597522,
    "Biology": 1440626949415370817,
    "Forestry": 1440627029023133817,
    "Nursing": 1440627071197122621,
    "Psychology": 1440627177556148264,
    "Animal Science": 1440627221906853919,
    "Health Science": 1440627258552483903,
    "Accounting": 1440627363305226381,
    "Business Admin": 1440627427016708178,
    "Marketing": 1440627472805793893,
    "Finance": 1440627516128624681,
    "Supply Chain Management": 1440627560038924380,
    "Liberal Arts": 1440627671917924453,
    "Education": 1440627705736466483,
    "English": 1440627758148358204,
    "History": 1440627799202336778,
    "Political Science": 1440627837517430946,
    "Graphic Design": 1440627891506253844,
}

YEAR_ROLES = {
    "Freshman": REMOVED,
    "Sophomore": 1440628087002890270,
    "Junior": 1440628134105055255,
    "Senior": 1440628253483204668,
    "Graduated": 1440629920299618314,
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
