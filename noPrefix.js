function noPrefix() {
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
}
