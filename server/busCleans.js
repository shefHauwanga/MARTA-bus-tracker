var redis = require("redis");
var client = redis.createClient();
var maxAcceptableAge = 480; //Eight minutes in seconds
var ticksPerSecond = 1000;
var updateInterval = 1 * ticksPerSecond;

function get_type(thing){
    if(thing===null)
        return "[object Null]"; // special case
    return Object.prototype.toString.call(thing);
}

function cleanseDB() {
    client.keys("*", function(error, replies) {
        replies.forEach(function(keyVal) {
            client.get(keyVal.toString(), function(err, reply) {
                var busInfo = JSON.parse(reply);
                var busAge = (busInfo.createTime - Date.now())/ticksPerSecond;
                if(busAge > maxAcceptableAge)
                    client.del(keyVal);
            });
        });
    }); 
}

setInterval(function() {
  cleanseDB();
}, updateInterval);
