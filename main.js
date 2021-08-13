//dependencies
const Discord = require('discord.js');
const { Client, Intents } = Discord;
const { token } = require('./config.json');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
const client = new Client({ intents: myIntents });
const functions = require("./functions");
fs = require('fs');

//level images : TODO

//Holds the world names for PB1 and PB2
const pb1_world_names = ["Alpine Meadows", "Desert Winds", "Snow Drift", "Ancient Ruins", "80s Fun Land", "Zen Gardens", "Tropical Paradise", "Area 52"];
const pb2_world_names = ["Pine Mountains", "Glowing Gorge", "Tranquil Oasis", "Sanguine Gulch", "Serenity Valley", "Steamtown", "N/A", "N/A"];


console.log('Bot started...')
client.once('ready', () => {
    console.log('Bot is now online.')
});

let TIMEOUT_AMOUNT = 300;
let currTime = () => Math.round(Date.now() / 1000)
let spokenRecently = {};

// scan and clean spokenRecently every 10 seconds
setInterval(() => {
    let now = currTime();
    for (let k in spokenRecently){
        if (now - spokenRecently[k] > TIMEOUT_AMOUNT){
            delete spokenRecently[k];
        }
    }
}, 10000);

const thumbnail_url = "https://cdn.discordapp.com/avatars/873283362561855488/906f1cdbc597b4a01f1df2140f395d8f.png";
//creates the help embed
const helpEmbed = new Discord.MessageEmbed()
.setColor('#f26711')
.setTitle('Poly Bridge Level Namer Help')
.setThumbnail(thumbnail_url)
.setDescription("Detects level numbers in chat messages and provides the name of that level.")
.addFields(
    { name: 'Level Syntax', value: 'World-Level (e.g. 1-01, 1-1, 1-01c, 1-1c)' }
)
.setTimestamp()
.setFooter('Made by Masonator, ham, ashduino101, and Conqu3red', thumbnail_url);

const prefix_storage_path = "./prefix_toggles.json";

function load_prefix_data(){
    if (fs.existsSync(prefix_storage_path)){
        let data = fs.readFileSync(prefix_storage_path, "utf8");
        data = JSON.parse(data);
        return data;
    }
    return {};
}

function requires_prefix(channel_id){
    let data = load_prefix_data();
    return data[channel_id] || false;
}

function toggle_prefix(channel_id){
    let data = load_prefix_data();
    data[channel_id] = !data[channel_id];
    fs.writeFileSync(prefix_storage_path, JSON.stringify(data), "utf8");
    return data[channel_id];
}

//checks for messages
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    //sends help embed
    if(message.content.startsWith("?help")){
        message.channel.send({ embeds: [helpEmbed] });
        return;
    }

    if (message.content == "?toggleprefix"){
        let needs_prefix = toggle_prefix(message.channel.id);
        if (needs_prefix)
            message.channel.send("Prefix enabled for this channel.");
        else
            message.channel.send("Prefix disabled for this channel.")
        return;
    }
    

    let pattern = requires_prefix(message.channel.id) ? /^\?[0-9]{1,2}-[0-9]{1,2}[Cc]?\s*$/g : /(?<!-)\b[0-9]{1,2}-[0-9]{1,2}[Cc]?\b(?!-)/g
    for (const match of functions.removeLinks(message.content).matchAll(pattern)){
        // Loop through all potential candidates for level names, stop if one is found that is valid
        let short_name = new functions.ShortName(match[0]);
        var matching_pb2_levels = functions.pb2_levels.filter(level => level["short_name"].isSame(short_name));
        var matching_pb1_levels = functions.pb1_levels.filter(level => level["short_name"].isSame(short_name));
        
        if (message.channel.name.toLocaleLowerCase().startsWith("pb1")) matching_pb2_levels = [];
        if (message.channel.name.toLocaleLowerCase().startsWith("pb2")) matching_pb1_levels = [];

        if (matching_pb2_levels.length == 0 && matching_pb1_levels.length == 0) continue;
        
        // ratelimit
        if (spokenRecently[`${message.channel.id}-${short_name}`]) return;
        spokenRecently[`${message.channel.id}-${short_name}`] = currTime();

        let rv = `Level Names for \`${short_name}\`\n`;
        
        if (matching_pb1_levels.length > 0 && !short_name.is_challenge_level){
            rv += `PB1: ${pb1_world_names[short_name.world - 1]} ~ ${matching_pb1_levels[0]["name"]}\n`;
        }
        if (matching_pb2_levels.length > 0){
            rv += `PB2: ${pb2_world_names[short_name.world - 1]} ~ ${matching_pb2_levels[0]["name"]}`;
            if (short_name.is_challenge_level)
                rv += `\nChallenge: ${matching_pb2_levels[0]["challenge_description"]}`;
        }
        message.channel.send(rv);
        return;
    }
})

// logs in the bot (must be last)
client.login(token)
