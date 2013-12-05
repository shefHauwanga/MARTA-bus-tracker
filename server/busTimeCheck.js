var async = require('async');
var webServer = require('http');
var url = require('url');
var database_url = "bus-data";
var collections = ["trips", "routes", "shapes", "stops", "stop_times"];
var db = require("mongojs").connect(database_url, collections);
var redis = require("redis");
var client = redis.createClient();
var listenPort = 8890;

webServer.createServer(function(request, response) {
    var query_data = url.parse(request.url, true).query;
    
    if(query_data.time_id){
        var current_time = new Date();
        var current_hour = current_time.getHours() % 12 !== 0 ? current_time.getHours() % 12 : current_time.getHours() === 12 ? 12 : 0;
        var current_minute = current_time.getMinutes();
        var current_second = current_time.getSeconds();
        var a_o_p = current_time.getHours() < 12 || current_time.getHours() === 24 ? "AM" : "PM";
        var time_re = new RegExp("(\d{2}):(\d{2}):(\d{2})\s(AM|PM)/");
        var stops = [];
        var current_stop = "0";

        async.series([
            function(callBack){
                db.stop_times.find({trip_id: query_data.time_id}).sort({stop_sequence:1}, function(err, stops_with_time){
                    async.forEach(stops_with_time, function(stop_with_time, innerCallback) {
                        stops.push(stop_with_time);

                        innerCallback();
                    }, function(err){
                        stops.sort(function(value1, value2) {return value1.stop_sequence - value2.stop_sequence});
                        found = false;
                        for(var i = 0; i < stops.length; i++){
                            if(!found){
                                time_captures = stops.arrival_time.match(re);

                                if(time_captures[4] !== a_o_p) {
                                    if(a_o_p === "PM"){
                                        current_stop = stop_with_time.stop_id;
                                        found = true;
                                    }
                                } else if(parseInt(time_captures[1]) > current_hour) {
                                    current_stop = stop_with_time.stop_id;
                                    found = true;
                                } else if(parseInt(time_captures[2]) > current_minutes) {
                                    current_stop = stop_with_time.stop_id;
                                    found = true;
                                } else if(parseInt(time_captures[3]) > current_second) {
                                    current_stop = stop_with_time.stop_id;
                                    found = true;
                                } 
                            }
                        }
                        callback();
                    });
                });
            }, 
            function(callBack){
                db.stops.find({stop_id: current_stop}, function(err, stop){
                    current_stop_name = stop[0].stop_name;
                });
                callback();
            }, 
        ], function(err){
            var headers = {
                'Content-Type': 'text/plain',
                'Content-Length': JSON.stringify({"next_stop": current_stop_name}).length
            };
 
            response.writeHead(200, headers);
            response.write({"next_stop": current_stop_name});
            response.end();*/
        });
}).listen(listenPort);
