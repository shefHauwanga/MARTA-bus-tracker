var async = require('async');
var restRequest = require('restler');
var redis = require("redis");
var client = redis.createClient();
var martaDataURI = "http://developer.itsmarta.com/BRDRestService/BRDRestService.svc/GetAllBus";
var updateInterval = 10 * 1000;
var count = 1;


async.forever(
    function(callback){
        console.log("Starting in: " + count);
        restRequest.get(martaDataURI).on('complete', function(data) {
            if(data instanceof Error){
                console.log("Error: " + data.message);
                this.retry(1000 * 10);
            } else {
                var current_count = count;
                console.log("Now in: " + current_count);
	        var createTime = Date.now().toString();
                var loop_count = 1;
                async.forEach(data, function(busInfo, inner_callback) {
                    console.log("Now counting " + loop_count + " of " + current_count);
                    var bus_data = null;
                    client.get(busInfo.VEHICLE, function(err, reply) {
                    if(reply === null) {
                            bus_data = {
                                id: busInfo.VEHICLE,
                                route: busInfo.ROUTE,
                                latitude: busInfo.LATITUDE,
                                longitude: busInfo.LONGITUDE,
                                direction: busInfo.DIRECTION,
                                nextStop: busInfo.TIMEPOINT,
                                adherence: busInfo.ADHERENCE,
                                trip: busInfo.TRIPID,
                                creationTime: createTime
                            };
                        } else {
                            reply = JSON.parse(reply);

                            if(busInfo.LATITUDE !== reply.latitude ||
                                busInfo.LONGITUDE !== reply.longitude) {

                                bus_data = reply;
                                bus_data.latitude = busInfo.LATITUDE;
                                bus_data.longitude = busInfo.LONGITUDE;
                                bus_data.creationTime = createTime;

                                if(busInfo.DIRECTION !== bus_data.direction)
                                    bus_data.direction = busInfo.DIRECTION;

                                if(busInfo.ROUTE !== bus_data.route)
                                    bus_data.route = busInfo.ROUTE;

                                if(busInfo.ADHERENCE !== bus_data.adherence)
                                    bus_data.adherence = busInfo.ADHERENCE;

                                if(busInfo.TIMEPOINT !== bus_data.nextStop)
                                    bus_data.nextStop = busInfo.TIMEPOINT;

                                if(busInfo.TRIPID !== bus_data.trip)
                                    bus_data.trip = busInfo.TRIPID;
                            }
                        }
                        
                        if(bus_data !== null)
                            client.set(bus_data.id, JSON.stringify(bus_data));


                        inner_callback();
                    });

                    loop_count++;
                },function(err){
                    callback();
                });
            } 
        });
        console.log("Ending: " + count);
        count++;
    },function(err){
        console.log("I have stopped for some reason.");
    }
);
