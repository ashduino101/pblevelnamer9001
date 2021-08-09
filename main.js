//dependencies
const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
const client = new Client({ intents: myIntents });
const winston = require('winston');
const prefix = '?'
const { noPrefix } = require('./noPrefix.js');

//level images

//Holds the world names for PB1 and PB2
var pb1_world_names = ["Alpine Meadows", "Desert Winds", "Snow Drift", "Ancient Ruins", "80s Fun Land", "Zen Gardens", "Tropical Paradise", "Area 52"];
var pb2_world_names = ["Pine Mountains", "Glowing Gorge", "Tranquil Oasis", "Sanguine Gulch", "Serenity Valley", "Steamtown", "N/A", "N/A"];
//Holds the level names for PB1 and PB2
var pb1_level_names = ["8m Simple Bridge", "10m Simple Bridge", "12m Simple Bridge", "Slanted Bridge", "Two Part Bridge", "Over Bridge", "Simple Jump", "Overpass", "Paddleboat Drawbridge", "Checkpoint", "Low Budget Bridge", "Double Decker", "Double Down", "There and Back Again", "Easy Elevator", " ", "Wooden High Bridge", "Drawbridge", "Eye Eye", "Double Overpass Drawbridge", "Slanted Drawbridge", "Hills & Valleys", "Suspension Bridge", "Split", "Sloped Drawbridge", "Double Overpass", "Lift Me Up", "Land Brace", "Schedule", "Movin' On Up", "Off & On", " ", "Loop Back", "Triple Split", "Looper", "Hydraulic Jump", "Dump Slope", "Up & Away", "Swing Back", "Swing Jumps", "Routing", "Under Bridge", "Tall Bridge", "Dump Down, Dump Up", "Elevation", "Stop & Go", "High & Low", " ", "Balloon Jump", "Triple Decker", "Nice Landing", "Sorting", "Double Monster Jump", "Criss Cross", "Fork Jump", "Downward Tube", "Falling Tower", "Flip Flop", "Cross Jump", "Steel Arch Bridge", "Double Dangle", "Skipper", "Ups & Downs", " ", "Double Double", "Edge Hugger", "Jump, Jump Again", "Drop Bridge", "Low Budget Overpass", "Shipping Canal", "Double Jump", "Reverse Criss Cross", "Double Deck Lift", "Double Drawbridge", "Not Enough Road", "Make Way", "Water Under The Bridge", "Transformer", "Collision Course", " ", "Can't Wait", "Seesaw", "Triple Dump", "Two by Two", "Dangle Drop", "Only One", "Hot Pursuit", "Drawn In", "Elevator", "A Place for Everything", "Triple Dump Drawbridge", "Transference", "Six Pack", "Criss Cross Chaos", "100m Bridge", " ", "Trap Doors", "Three Boats, One Stone", "Plough Ahead", "Double Crossed", "Wanting Roads", "Tight Fit", "Return of the Bridge", "Suspended Bridge", "Switchbacks", "Flip Two", "Swing, Swing a Bridge", "Fellowship of the Jump", "Drop Me Off", "Can't Take the Sky From Me", "The Two Towers", " ", "Raiders of the Lost Bridge", "Marble Sorter", "Swing Shot", "Lever It to Me", "Turbolift", "Nesting Busses", "Falling Tower, Again & Again", "Crane", "Catapult", "Circle Maze",];
var pb2_level_names = ["Ten Meter Simple Bridge", "A New Slope", "Bridge of Steel", "Fourteen Meter Overpass", "Checkpoints", "First Drawbridge", "Taxi Task", "Rope Support", "Budget Cuts", "First Jump", "Stop n' Go", "Rock Rest", "Redraw", "Land Brace", "Hydraulic Management", "Large Bridge", "Unity", "Long Drawbridge", "Low Rider", "Buggy Bouncer", "Rockin'", "Roundabout", "Double Decker Highway", "Split Level", "Anchors Away", "Fork in the Road", "Air Show", "Momentum", "Compression", "Dip n' Draw", "Weight Distribution", "Stow Away", "Loop Hole", "Big Dipper", "String Theory", "Doubling Down", "Semi Slope", "Rock Skipping", "Support Cable", "Crossed Paths", "Wibbly Wobbly", "Shafted", "Cross Jump", "Emergency Interference", "Diagonal Elevator", "Low Flyer", "Looper's Revenge", "Monster Truck Rally", "Edgy", "Collision Warning", "Sloped Drawbridge", "Trap Door", "Triple Decker Drawbridge", "Safety Gap", "Big Spender", "Thread the Needle", "Tipping Tower", "Drawbridge In Disguise", "Lean on Me", "Trailblazer", "Diagonal Drawbridge", "Big Rigs", "Twists and Turns", "Don't Leave Me", "Brake Pad", "Sorting", "Springboard", "Leverage", "Truck Way In", "Spring and a Miss", "Trading Places", "Passing By", "Falling Into Place", "In Suspense", "All Together Now", "Gettin' Loopy", "Crash Course", "Bus Routes", "Acceleration", "Double Duty", "Earthquake!", "Canyon Carriage", "Parkade Elevator", "Bridgelike Motion", "Edgeworks", "Spring Loaded", "Get a Grip", "How The Turntables", "Squeeze Through", "Bridge-in-a-Box", "Wall Jumpin'", "Mind the Gap", "Pinball", "Spin Cycle", "Special Delivery", "Rube Goldbridge"];

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'info.log' }),
  ],
});
const talkedRecently = new Set();
console.log('Bot started...')
logger.log('info', "Bot started...");
client.once('ready', () => {
	logger.log('info', "Bot is now online!");
    console.log('Bot is now online.')
});


//creates the help embed
const helpEmbed = new Discord.MessageEmbed()
.setColor('#f26711')
.setTitle('Poly Bridge Level Namer Help')
.setThumbnail('https://i.imgur.com/vz8gnvi.jpg')
.setDescription("Detects level numbers and provides level names.")
.addFields(
	{ name: 'Level Syntax', value: 'World-Level (e.g. 1-01, 1-1, 1-01c, 1-1c)' },
	{ name: 'Info', value: 'The bot does not require a prefix and will detect any level number in a message.' },
	{ name: 'Worlds', value: 'You can also show the levels and information about a world with ?w(world number) (e.g. ?w1, ?w4)' },
	)
.setTimestamp()
.setFooter('Made by Masonator, ham, and ashduino101', 'https://i.imgur.com/vz8gnvi.jpg');
//Get the world levels for pb1 and pb2 (range is level amount)
var pb2_world_1_levels = pb2_level_names.slice(0, 16);
var pb1_world_1_levels = pb1_level_names.slice(0, 16);
var pb2_world_2_levels = pb2_level_names.slice(16, 32);
var pb1_world_2_levels = pb1_level_names.slice(16, 32);
var pb2_world_3_levels = pb2_level_names.slice(32, 48);
var pb1_world_3_levels = pb1_level_names.slice(32, 48);
var pb2_world_4_levels = pb2_level_names.slice(48, 64);
var pb1_world_4_levels = pb1_level_names.slice(48, 64);
var pb2_world_5_levels = pb2_level_names.slice(64, 80);
var pb1_world_5_levels = pb1_level_names.slice(64, 80);
var pb2_world_6_levels = pb2_level_names.slice(80, 96);
var pb1_world_6_levels = pb1_level_names.slice(80, 96);
var pb1_world_7_levels = pb1_level_names.slice(96, 112);
var pb1_world_8_levels = pb1_level_names.slice(112, 128);

//World embeds
const world1embed = new Discord.MessageEmbed()
.setColor('#2bd126')
.setTitle('World 1')
.addFields(
	{ name: 'Poly Bridge 1: Alpine Meadows', value: pb1_world_1_levels, inline: true },
	{ name: 'Poly Bridge 2: Pine Mountains', value: pb2_world_1_levels, inline: true },
	)
const world2embed = new Discord.MessageEmbed()
.setColor('#d19526')
.setTitle('World 2')
.addFields(
	{ name: 'Poly Bridge 1: Desert Winds', value: pb1_world_2_levels, inline: true },
	{ name: 'Poly Bridge 2: Glowing Gorge', value: pb2_world_2_levels, inline: true },
	)
const world3embed = new Discord.MessageEmbed()
.setColor('#7db8b8')
.setTitle('World 3')
.addFields(
	{ name: 'Poly Bridge 1: Snow Drift', value: pb1_world_3_levels, inline: true },
	{ name: 'Poly Bridge 2: Tranquil Oasis', value: pb2_world_3_levels, inline: true },
	)
const world4embed = new Discord.MessageEmbed()
.setColor('#6f916d')
.setTitle('World 4')
.addFields(
	{ name: 'Poly Bridge 1: Ancient Ruins', value: pb1_world_4_levels, inline: true },
	{ name: 'Poly Bridge 2: Sanguine Gulch', value: pb2_world_4_levels, inline: true },
	)
const world5embed = new Discord.MessageEmbed()
.setColor('#d92323')
.setTitle('World 5')
.addFields(
	{ name: 'Poly Bridge 1: 80s Fun Land', value: pb1_world_5_levels, inline: true },
	{ name: 'Poly Bridge 2: Serenity Valley', value: pb2_world_5_levels, inline: true },
	)
const world6embed = new Discord.MessageEmbed()
.setColor('#bd8024')
.setTitle('World 6')
.addFields(
	{ name: 'Poly Bridge 1: Zen Gardens', value: pb1_world_6_levels, inline: true },
	{ name: 'Poly Bridge 2: Steamtown', value: pb2_world_6_levels, inline: true },
	)
const world7embed = new Discord.MessageEmbed()
.setColor('#00d17d')
.setTitle('World 7')
.addFields(
	{ name: 'Poly Bridge 1: Tropical Paradise', value: pb1_world_7_levels, inline: true },
	)
const world8embed = new Discord.MessageEmbed()
.setColor('#02e3cc')
.setTitle('World 8')
.addFields(
	{ name: 'Poly Bridge 1: Area 52', value: pb1_world_8_levels, inline: true },
	)



//checks for messages
client.on('message', message =>{
	//sends help embed
    if(message.content.startsWith("?help")){
        message.channel.send(helpEmbed);
		console.log(message.member + " used ?help!");
		logger.log('info', message.member + "used ?help!");
        return;
    }
	let args = message.content.substring(prefix.length).split(' ')
	switch(args[0]){
		case 'w1':
		message.channel.send(world1embed);
		break
		case 'w2':
		message.channel.send(world2embed);
		break
		case 'w3':
		message.channel.send(world3embed);
		break
		case 'w4':
		message.channel.send(world4embed);
		break
		case 'w5':
		message.channel.send(world5embed);
		break
		case 'w6':
		message.channel.send(world6embed);
		break
		case 'w7':
		message.channel.send(world7embed);
		break
		case 'w8':
		message.channel.send(world8embed);
		break
	};
		
	noPrefix();
    //ignores message if it does not contain the prefix or is sent by a bot
/*	//DO NOT REMOVE
    message.content = message.content + "this is required please dont remove this line";
    if(!((message.content.search(/[1-8]-[0-9]+/s) >= 0) || (message.content.search(/((w[1-8]c?))+?/s) >= 0)) || message.author.bot) return;
    

	//If the command is in the world-level format, it will grab the world#
    if(message.content.search(/([1-8]-[0-9]+c?(?!w))/s) >= 0) var world = message.content.match(/[1-8](?=-)/s);
    
	//Grabs the world # from the world# format
    //else var world = message.content.match(/(?<=w)[1-8]c?/s);
    
	//Grabs the level # from the world-level format
    if(message.content.search(/[1-8]-[0-9]+c?/s) >= 0) var level = message.content.match(/(?<=-)[0-9]{1,2}/s);
    else var level = 11;
    
	//Sanitizes the level # to a single digit by removing the 0 if it is formatted as 0# instead of #
    var level = level.toString();
    if(level.startsWith("0")) level.slice(1);
    var level = parseInt(level)
    if(level > 16) return;
    if((level > 15) && world == 7) return;
    if((level > 10) && world == 8) return;
    
	
	//Grabs the correct world name for both games
    var pb1_world = pb1_world_names[Math.floor(world - 1)];
    var pb2_world = pb2_world_names[Math.floor(world - 1)];
    
	
	//Grabs the correct level name for both games
    var pb1_level = pb1_level_names[Math.floor((level - 1) + (16*(world - 1)))];
    var pb2_level = pb2_level_names[Math.floor((level - 1) + (16*(world - 1)))];
    
	//Holds PB2 challenge descriptions
    var pb2_challenge_names = ["Springs instead of wood and limit on road.", "Tanker Truck instead of Van.", "Road only.", "Very large boat.", "Fewer static joints", "Only 1 Hydraulic & only 8 Roads", "Half budget and only 7 roads.", "Missing balloon.", "No static joint on rock.", "No Steel.", "Extra boat, only 8 Road.", "Short 1 Road.", "Large Boat.", "Platform on left side too.", "No Hydraulics", "No Steel.", "Model T must come back.", "Low checkpoints added.", "No rock in middle.", "No springs and no anchor on balloon.", "Much larger rock.", "Must collect bottom checkpoint first.", "Missing island.", "Only 10 Road.", "No static joint on bottom.", "Added checkpoint.", "Stop checkpoint in the middle.", "Only 7 Roads.", "Added boat, Increased budget.", "Only 1 Hydraulic and a larger boat.", "No rock or balloon and only one static joint.", "No rock on right.", "Additional plane.", "Checkpoint moved left.", "Only 8 Wood and fewer static joints.", "Additional boats.", "No Steel or Cable.", "No static joints on rocks, fewer Road.", "Added checkpoint.", "No Hydraulics.", "Only 2 Springs.", "Extra fire truck.", "Only one platform in the middle.", "Additional boats and plane.", "Only one hydraulic.", "No static joints.", "Another car goes backwards.", "No Steel & 3 monster trucks.", "Extra boat and only 2 Hydraulics.", "2 more dune buggies.", "Second Hydraulic phase is removed.", "Return cars to start.", "Only 1 Hydraulic.", "Planes added, limited road, and no Springs.", "2 Meters longer with same budget.", "No Springs.", "Return school bus to start.", "Extra car, only 1 Hydraulic, and no hydraulic controller.", "Removed rock in the middle, Increased budget.", "No Springs.", "No Hydraulics and budget limited to 60K.", "No Steel.", "Only 1 Hydraulic.", "Only 1 Hydraulic, extra Hydraulic Phase.", "Stopping area is sloped", "Added Plane", "Checkpoint and Flag are higher", "Added second Plane", "Larger gap", "Swapped Vans and City Cars", "Sports Cars are slower", "Added City Car", "Vehicle order is reversed", "Shorter pillars", "Platforms are sloped", "Changed Checkpoint positions", "A1 Flag moved below platform", "Added Van", "Added centred static joint and a Checkpoint to Dune Buggy A1", "Added Vespa"];
    
	//Grabs the correct description
    var pb2_challenge = pb2_challenge_names[Math.floor((level - 1) + (16*(world - 1)))];
	var level = level.toString();
	if(level.startsWith("0")) var levelnumber = world + "-" + level;
	else if (level >= 9) var levelnumber = world + "-" + level;
	else var levelnumber = world + "-" + 0 + level;
	if(message.content.search(/(([1-5]-[0-9]+)[Cc])/s) != -1) {
		var reallevel = levelnumber + "c" 
	} else {
		reallevel = levelnumber
	}
	
	
	   if (talkedRecently.has(reallevel)) {
		   console.log(reallevel + " is on cooldown!")
		   logger.log('info', reallevel + " is on cooldown!");
    } else {
    //Checks to see if the inputted level is in #-#c format
    if(message.content.search(/(([1-5]-[0-9]+)[Cc])/s) != -1) message.channel.send(`Level Name and Challenge for ${levelnumber}c\nPB2: ${pb2_world} ~ ${pb2_level} (Challenge: ${pb2_challenge})`);
    //Checks to see if the inputted level is inboth games, then sends both levels 
    else if(message.content.search(/(([1-6]-[0-9]+)[^c])/s) != -1) message.channel.send(`Level Names for ${levelnumber}\nPB1: ${pb1_world} ~ ${pb1_level}\nPB2: ${pb2_world} ~ ${pb2_level}`);
    //Checks to see if the inputted level is only in PB1, if so it won't send with a PB2 field 
    else if(message.content.search(/(([7-8]-[0-9]+)[^c])/s) != -1) message.channel.send(`Level Name for ${levelnumber}\nPB1: ${pb1_world} ~ ${pb1_level}`);
    //else message.channel.send(`World Names for ${command}:\nPB1: ${pb1_world}\nPB2: ${pb2_world}`);
	
	//Level Embed (experimental)
	//Checks to see if the inputted level is in #-#c format
    //if(message.content.search(/(([1-5]-[0-9]+)[Cc])/s) != -1) {
		//var pb2_name = pb2_world + " ~ " + pb2_level + " (Challenge: " + pb2_challenge + ")"
		//var pb1_name = "undefined"
    //Checks to see if the inputted level is inboth games, then sends both levels 
    //} else if(message.content.search(/(([1-6]-[0-9]+)[^c])/s) != -1) { 
		//var pb1_name = pb1_world + " ~ " + pb1_level
		//var pb2_name = pb2_world + " ~ " + pb2_level
    //Checks to see if the inputted level is only in PB1, if so it won't send with a PB2 field 
    //} else if(message.content.search(/(([7-8]-[0-9]+)[^c])/s) != -1) {
		//var pb2_name = "undefined"
		//var pb1_name = pb1_world + " ~ " + pb1_level
	//};
	//const levelEmbed = new Discord.MessageEmbed()
	//.setTitle("Level Names for " + reallevel)
	//.setColor('#AA99FF')
	//.addFields(
	//{ name: 'PB2:', value: pb2_name + "   ", inline: true },
	//{ name: 'PB1:', value: pb1_name + "   ", inline: true },
	//);
	//message.channel.send(levelEmbed);
	
	//Commands:
	//461371349986836491
	//const togglePrefixCommand = message.content;
	//if(togglePrefixCommand === '?toggleprefix'){
		//console.log("Prefix toggle command has been used")
		//if(message.member.roles.cache.has("715955187985940584")
			//var prefixMode = prefixMode * -1
			//if (prefixMode = 1) {
			//message.channel.send("Prefix mode is now set to true")
			//}
			//else if (prefixMode = -1) {
			//message.channel.send("Prefix mode is now set to false")
			//}
		//} else {
			//console.log(message.member + " ran a moderator-only command but does not have moderator. The command will be ignored.")
//}
	//Logging
	if(message.content.search(/(([1-5]-[0-9]+)[Cc])/s) != -1) console.log(message.author + ": " + levelnumber + "c")
	console.log(message.member + ": " + levelnumber);
	logger.log('info', message.member + ": " + levelnumber);
        
	//Adds the level to a set
    talkedRecently.add(reallevel);
	console.log(talkedRecently)
	logger.log('info', talkedRecently);
	console.log(reallevel + " has been added to cooldown.")
	logger.log('info', reallevel + " has been added to cooldown.");
        setTimeout(() => {
          //Removes that level after 3 minutes
          talkedRecently.delete(reallevel);
		  console.log(reallevel + " has been removed from cooldown.")
		  logger.log('info', reallevel + " has been removed from cooldown.");
        }, 180000);
    }
	*/


})
// logs in the bot (must be last)
client.login(token)
