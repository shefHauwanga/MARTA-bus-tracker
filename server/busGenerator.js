var restRequest = require('restler');
var redis = require("redis");
var client = redis.createClient();
var martaDataURI = "http://developer.itsmarta.com/BRDRestService/BRDRestService.svc/GetAllBus";
var ticksInASecond = 1000; // A second in milliseconds.
var updateInterval = 1 * ticksInASecond;
var createTime = Date.now().toString();

client.setMaxListeners(50);
function updateBusData() {
    restRequest.get(martaDataURI).on('complete', function(data) {
        data.forEach(function(busInfo) {
            client.get(busInfo.VEHICLE, function(err, reply) {
                if(reply == null) {
                    var busData = {
                        id: busInfo.VEHICLE,
                        route: busInfo.ROUTE,
                        latitude: busInfo.LATITUDE,
                        longitude: busInfo.LONGITUDE,
                        direction: busInfo.DIRECTION,
                        nextStop: busInfo.TIMEPOINT,
                        adherence: busInfo.ADHERENCE,
                        creationTime: createTime
                    };
                } else {
                    reply = JSON.parse(reply);
                    if(busInfo.LATITUDE != reply.latitude ||
                       busInfo.LONGITUDE != reply.longitude) {
                        var busData = reply;
                        busData.latitude = busInfo.LATITUDE;
                        busData.longitude = busInfo.LONGITUDE;
                        busData.creationTime = createTime;

                        if(busInfo.DIRECTION != busData.direction)
                            busData.direction = busInfo.DIRECTION;

                        if(busInfo.ROUTE != busData.route)
                            busData.route = busInfo.ROUTE;

                        if(busInfo.ADHERENCE != busData.adherence)
                            busData.adherence = busInfo.ADHERENCE;

                        if(busInfo.TIMEPOINT != busData.nextStop)
                            busData.nextStop = busInfo.TIMEPOINT;
                    }
                }
                if(busData != null)
                    client.set(busData.id, JSON.stringify(busData));
            });
        });
    });
}

setInterval(function() {
    updateBusData();
}, updateInterval);
