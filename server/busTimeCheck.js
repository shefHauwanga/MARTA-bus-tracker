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
    
    if(query_data.time_id && query_data.bus_id){
        var current_time = new Date();
        var current_hour = current_time.getHours() % 12 !== 0 ? current_time.getHours() % 12 : current_time.getHours() === 12 ? 12 : 0;
        var current_minutes = current_time.getMinutes();
        var current_second = current_time.getSeconds();
        var a_o_p = current_time.getHours() < 12 || current_time.getHours() === 24 ? "AM" : "PM";
        var time_re = new RegExp("(\\d{1,2}):(\\d{1,2}):(\\d{1,2})\\s(\\S{1,2})");
        var stop_data;
        var stops = [];
        var next_stop;
        var current_name;
        

        async.series([
            function(callback){
                db.stop_times.find({trip_id: query_data.time_id}).sort({stop_sequence:1}, function(err, stops_with_time){
                    async.forEach(stops_with_time, function(stop_with_time, innerCallback) {
                        stops.push(stop_with_time);

                        innerCallback();
                    }, function(err){
                        stops.sort(function(value1, value2) {return value1.stop_sequence - value2.stop_sequence});

                        found = false;

                        for(var i = 0; i < stops.length; i++){
                            if(!found){
                                time_captures = stops[i].arrival_time.match(time_re);

                                if(time_captures[4] !== a_o_p) {
                                    if(a_o_p === "PM"){
                                        next_stop = stops[i].stop_id;
                                        found = true;
                                    }
                                } else if(parseInt(time_captures[1]) > current_hour) {
                                    next_stop = stops[i].stop_id;
                                    found = true;
                                } else if(parseInt(time_captures[1]) === current_hour) {
                                    if(parseInt(time_captures[2]) > current_minutes) {
                                        next_stop = stops[i].stop_id;
                                        found = true;
                                    } else if(parseInt(time_captures[2]) === current_minutes) {
                                        if(parseInt(time_captures[3]) > current_second) {
                                            next_stop = stops[i].stop_id;
                                            found = true;
                                        } 
                                    }
                                }
                            }
                        }

                        if(!found){
                            next_stop = stops[0].stop_id;
                            time_captures = stops[0].arrival_time.match(time_re);
                        }

                        callback();
                    });
                });
            }, 
            function(callback){
                db.stops.find({stop_id: next_stop}, function(err, stop){
                    current_name = stop[0].stop_name;
                    callback();
                });
            },
            function(callback){
                client.get(query_data.bus_id, function(error, reply){
                    stop_data = JSON.parse(reply);
                    callback();
                });
            },
            function(callback){
                next_stop_time = (Math.abs(parseInt(stop_data['adherence']) - parseInt(time_captures[2]))) % 60 !== 0 ? 
                  time_captures[1] + ':' + (Math.abs(parseInt(stop_data['adherence']) - parseInt(time_captures[2]))) + ':' + time_captures[3] + ' ' + a_o_p
                    :
                    (function(){
                        if (Math.abs(parseInt(stop_data['adherence']) - parseInt(time_captures[2])) >= 60) {
                           new_minutes = (parseInt(stop_data['adherence']) - parseInt(time_captures[2])) % 60;
                           new_hr = parseInt(time_captures[1]) + 1 < 13 ? parseInt(time_captures[1]) + 1 : 1;
                        } else if (parseInt(stop_data['adherence']) - parseInt(time_captures[2]) < 0) {
                           new_minutes = (Math.abs(60 + parseInt(stop_data['adherence']))) % 60;
                           new_hr = parseInt(time_captures[1]) - 1 > 0 ? parseInt(time_captures[1]) - 1 : 12;
                        } else {
                           new_minutes = time_captures[2];
                           new_hr = time_captures[1];
                        }

                        return new_hr + ':' + new_minutes + ':'+ time_captures[3] + ' ' + a_o_p;
                    })();
                callback();
            },
        ], function(err){

            var stop_data = {
                name: current_name,
                time: next_stop_time,
                id: next_stop
            };

            var headers = {
                'Content-Type': 'text/plain',
                'Content-Length': JSON.stringify(stop_data).length
            };
 
            response.writeHead(200, headers);
            response.write(JSON.stringify(stop_data));
            response.end();
        });
    }
}).listen(listenPort);
