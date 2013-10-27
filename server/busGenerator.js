var async = require('async');
var restRequest = require('restler');
var redis = require("redis");
var client = redis.createClient();
var martaDataURI = "http://developer.itsmarta.com/BRDRestService/BRDRestService.svc/GetAllBus";
var updateInterval = 10 * 1000;

function updateBusData() {
    restRequest.get(martaDataURI).on('success', function(data) {
        var createTime = Date.now().toString();
        async.forEach(data, function(busInfo, callback) {
            var bus_data = null;
            async.series([
                function(inner_callback){
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

                        inner_callback();
                    });
                }, function(inner_callback){
                    if(bus_data !== null)
                        client.set(bus_data.id, JSON.stringify(bus_data));

                    inner_callback();
                }
            ], function(err){
                callback();
            });
            setTimeout(function() {
                updateBusData();
            }, updateInterval);
        });
    });
}
updateBusData();
