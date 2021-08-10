const {load: csv_load} = require('csv-load-sync');
const linkify = require('linkifyjs');

class InvalidShortName extends Error {}

class ShortName {
    constructor(short_name){
        this.world = 0;
        this.level = 0;
        this.is_challenge_level = false;
        this.valid = false;
        
        short_name = short_name.toLowerCase();
        let result = short_name.match(/([0-9]{1,2})-([0-9]{1,2})([Cc]?)/);
        if (result == null) return;
        this.world = parseInt(result[1]);
        this.level = parseInt(result[2]);
        this.is_challenge_level = result[3].length > 0;
        if (isNaN(this.world) || isNaN(this.level)) return;
        this.valid = true;
        
    }

    toString(){
        return `${this.world}-${this.level}${this.is_challenge_level ? 'c' : ''}`;
    }

    isSame(other){
        return this.valid == other.valid && this.level == other.level && this.world == other.world;
    }
}

const pb2_levels = csv_load('./pb2_levels.csv', {
    convert: {
        "short_name": s => new ShortName(s)
    }
}); // TODO: map short_name to actual short_name 's
const pb1_levels = csv_load('./pb1_levels.csv', {
    convert: {
        "short_name": s => new ShortName(s)
    }
});

function removeLinks(text){
    for (var link of linkify.find(text)){
        text = text.replace(link.value, "");
    }
    return text
}

module.exports = {
    pb2_levels, pb1_levels, InvalidShortName, ShortName, removeLinks
}