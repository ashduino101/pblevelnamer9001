const {load: csv_load} = require('csv-load-sync');

class InvalidShortName extends Error {}

class ShortName {
    constructor(short_name){
        try {
            short_name = short_name.toLowerCase();
            if ([...short_name.match(/-/g)].length == 1){
                this.world = parseInt(short_name.split("-")[0]);
                this.level = parseInt(short_name.split("-")[1].replace(/[Cc]/, ""));
            }
            else
                throw InvalidShortName;
            if (isNaN(this.world) || isNaN(this.level))
                throw InvalidShortName;
            
            this.is_challenge_level = short_name.endsWith("c");
            this.valid = true;
        }
        catch (InvalidShortName){
            this.world = 0;
            this.level = 0;
            this.is_challenge_level = false;
            this.valid = false;
        }
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



module.exports = {
    pb2_levels, pb1_levels, InvalidShortName, ShortName
}