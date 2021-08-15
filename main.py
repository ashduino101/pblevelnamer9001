from datetime import datetime
import time
from typing import *
import discord
import json
import re
from discord.ext import commands, tasks
from functions import *
import math


with open("config.json") as f:
    config = json.load(f)

execution_timestamp = datetime.now()

thumbnail_url = "https://cdn.discordapp.com/avatars/873283362561855488/906f1cdbc597b4a01f1df2140f395d8f.png"

class CustomHelp(commands.DefaultHelpCommand):
    async def send_bot_help(self, mapping):
        helpEmbed = discord.Embed(
            title="Poly Bridge Level Namer Help",
            description="Detects level numbers in chat messages and provides the name of that level.",
            colour=0xf26711
        )
        helpEmbed.set_thumbnail(url=thumbnail_url)
        helpEmbed.add_field(
            name="Level Syntax", value="World-Level (e.g. 1-01, 1-1, 1-01c, 1-1c)", inline=False
        )
        helpEmbed.add_field(
            name="Commands", value="type `?help` + a command name to see more details, e.g. `?help name`\nCommands: " + ", ".join([f"`{command.name}`" for command in self.context.bot.commands if not command.hidden]), inline=False
        )
        helpEmbed.set_footer(text="Made by Masonator, ham, ashduino101, and Conqu3red", icon_url=thumbnail_url)
        helpEmbed.timestamp = execution_timestamp

        
        await self.context.send(embed=helpEmbed)
    
    async def command_callback(self, ctx, *, command=None):
        self.context = ctx
        return await super().command_callback(ctx, command=command)

# TODO: check for auth on toggleprefix command
bot = commands.Bot(command_prefix="?", help_command=CustomHelp())

pb1_world_names = ["Alpine Meadows", "Desert Winds", "Snow Drift", "Ancient Ruins", "80s Fun Land", "Zen Gardens", "Tropical Paradise", "Area 52"];
pb2_world_names = ["Pine Mountains", "Glowing Gorge", "Tranquil Oasis", "Sanguine Gulch", "Serenity Valley", "Steamtown", "N/A", "N/A"];
TIMEOUT_AMOUNT = 300
spokenRecently = {}

@tasks.loop(seconds=10)
async def clear_old_ratelimits():
    now = time.time()
    for k in list(spokenRecently.keys()):
        if now - spokenRecently[k] > TIMEOUT_AMOUNT:
            del spokenRecently[k]

clear_old_ratelimits.start()

@bot.event
async def on_ready():
    print("Bot Online.")

@bot.event
async def on_command_error(ctx: commands.Context, error: Exception):
    send_help = (commands.MissingRequiredArgument, commands.BadArgument, commands.TooManyArguments, commands.UserInputError)
    
    if isinstance(error, commands.CommandNotFound): # fails silently
        pass

    elif isinstance(error, send_help):
        await bot.help_command.command_callback(ctx, command=ctx.command.name)

    elif isinstance(error, commands.CommandOnCooldown):
        await ctx.send(f'This command is on cooldown. Please wait {error.retry_after:.2f}s')

    elif isinstance(error, commands.MissingPermissions):
        await ctx.send('You do not have the permissions required to use this command.')
    # If any other error occurs, prints to console.
    else:
        raise error

@bot.command(name="toggleprefix", help="Toggles prefix requirement for fetching levels by number in a channel", hidden=True)
async def toggle_prefix_command(ctx: commands.Context, channel: discord.TextChannel=None):
    if channel is None:
        channel = ctx.message.channel
    needs_prefix = toggle_prefix(channel.id)
    if needs_prefix:
        message = f"Prefix enabled for {channel.mention}"
    else:
        message = f"Prefix disabled for {channel.mention}"
    await ctx.send(message)

@bot.command(name="name", help="reverse search a level by it's name\nQuery must be at least 3 characters.")
@commands.has_permissions(manage_channels=True)
async def reverse_search(ctx: commands.Context, game: Optional[str], *, name: str=""):
    if game:
        if game.lower() not in ("pb1", "pb2"):
            name = game + " " + name
            game = None
    
    levelQuery = name.strip().lower()
    if len(levelQuery) < 3 or levelQuery == "help":
        await ctx.send_help(ctx.command)
        return
    rv = ""

    if not game or game == "pb1":
        # pb1 search
        matches = bestMatches(pb1_levels, levelQuery)
        if len(matches) > 0:
            rv += "__**PB1:**__\n"
            for level, confidence in matches:
                rv += f"{level['short_name']} {pb1_world_names[level['short_name'].world - 1]} ~ {level['name']} ({math.floor(confidence)}% match)\n"

    if not game or game == "pb2":
        # pb2 search
        matches = bestMatches(pb2_levels, levelQuery)
        if len(matches) > 0:
            rv += "__**PB2:**__\n"
            for level, confidence in matches:
                rv += f"{level['short_name']} {pb2_world_names[level['short_name'].world - 1]} ~ {level['name']} ({math.floor(confidence)}% match)\n"
    
    rv = rv.strip()
    await ctx.message.channel.send(rv if rv else "No results with an 85%+ match.")

@bot.event
async def on_message(message: discord.Message):
    if message.author.bot:
        return
    
    r = await bot.process_commands(message)
    ctx = await bot.get_context(message)
    if not ctx.command:
        # only check for level names, if the user didn't run a command
        content = message.content.lower()
        pattern = r"^\?[0-9]{1,2}-[0-9]{1,2}[Cc]?\s*$" if requires_prefix(message.channel.id) else r"(?<!-)\b[0-9]{1,2}-[0-9]{1,2}[Cc]?\b(?!-)"
        for level_match in re.findall(pattern, content):
            short_name = ShortName(level_match)
            pb1_match = None
            pb2_match = None
            if not message.channel.name.lower().startswith("pb2"):
                pb1_match = next(filter(lambda level: level["short_name"] == short_name, pb1_levels), None)
            
            if not message.channel.name.lower().startswith("pb1"):
                pb2_match = next(filter(lambda level: level["short_name"] == short_name, pb2_levels), None)
            
            if pb1_match is None and pb2_match is None: continue

            # ratelimit
            if spokenRecently.get(f"{message.channel.id}-{short_name}"): break
            spokenRecently[f"{message.channel.id}-{short_name}"] = time.time()

            rv = f"Level Names for `{short_name}`\n"
            
            if pb1_match and not short_name.is_challenge_level:
                rv += f"PB1: {pb2_world_names[short_name.world - 1]} ~ {pb1_match['name']}\n"
            
            if pb2_match:
                rv += f"PB2: {pb2_world_names[short_name.world - 1]} ~ {pb2_match['name']}\n"
                if short_name.is_challenge_level:
                    rv += f"Challenge: {pb2_match['detail']}"
            
            await message.channel.send(rv)
            break
    
    

bot.run(config["token"])