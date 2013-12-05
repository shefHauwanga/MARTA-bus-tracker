var async = require('async');
var webServer = require('http');
var url = require('url');
var database_url = "bus-data"; 
var collections = ["trips", "routes", "shapes", "stops", "stop_times"];
var db = require("mongojs").connect(database_url, collections);
var listenPort = 8889;



webServer.createServer(function(request, response) {
    var query_data = url.parse(request.url, true).query;
    var shape_data = [];
    var stop_data = [];
    var bus_route_data = {};
    var route_name;
    var route_ident;
    var shape_ident;

    if(query_data.trip_id){
        async.series([
            function(callback){
                db.trips.find({trip_id: query_data.trip_id}, function(err, trip) {
                    route_ident = trip[0].route_id;
                    shape_ident = trip[0].shape_id;
                    callback();
                });
            },
            function(callback){
                db.routes.find({route_id: route_ident}, function(err, route) {
                    route_name = route[0].route_long_name;

                    callback();
                });
            }, 
            function(callback){
                db.shapes.find({shape_id: shape_ident}).sort({shape_pt_sequence:1}, function(err, shape) {
                    shape_data = shape;

                    callback();
                });
            }, 
            function(callback){
                db.stop_times.find({trip_id: query_data.trip_id}).sort({stop_sequence:1}, function(err, stops_with_time){
                    async.forEach(stops_with_time, function(stop_with_time, inner_callback) {
                        db.stops.find({stop_id: stop_with_time.stop_id}, function(err, stop){
                            var individual_stop_data = {};

                            individual_stop_data['arrival_time'] = stop_with_time.arrival_time;
                            individual_stop_data['departure_time'] = stop_with_time.departure_time;
                            individual_stop_data['sequence_num'] = stop_with_time.stop_sequence;
                            individual_stop_data['name'] = stop[0].stop_name;
                            individual_stop_data['lat'] = stop[0].stop_lat;
                            individual_stop_data['lon'] = stop[0].stop_lon;
                
                            stop_data.push(individual_stop_data);

                            inner_callback();
                        });
                    }, function(err){
                        bus_route_data['stops'] = stop_data;
                        stop_data.sort(function(value1, value2) {return value1.sequence_num - value2.sequence_num});

                        callback();
                    });
                });
            }
        ], function(err){
            bus_route_data['name'] = route_name;
            bus_route_data['shape'] = shape_data;

            var headers = {
                'Content-Type': 'text/plain',
                'Content-Length': JSON.stringify(bus_route_data).length
            };

            response.writeHead(200, headers);
            response.write(JSON.stringify(bus_route_data));
            response.end();
        });
    }
}).listen(listenPort);
