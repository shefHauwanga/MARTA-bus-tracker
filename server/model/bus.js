var async = require("async");

var Bus = {};

Bus.post = function(busInfo, redis_db, redis_pubsub) {
  var createTime = Date.now().toString();

  redis_db.get(busInfo.VEHICLE, function(err, reply){
    if(replay === null) {
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

        redis_pubsub.publish('bus_channel', JSON.stringify(bus_data));
      }
    }

    if(bus_data !== null)
      redis_db.set(bus_data.id, JSON.stringify(bus_data));
  });
}

Bus.get = function(key, redis_connection) {
  var bus_data = [];

  redis_connection.keys(key, function(error, replies){
    async.forEach(replies, function(key_value, callback){
      redis_connection.get(key_value.to_string(), function(err, reply){
        bus_data.push(JSON.parse(reply));
        
        callback();
      });
    },function(err){
      bus_data = JSON.stringify(bus_data);
    });
  });

  return bus_data;
}

Bus.purge = function(key, redis_connection) {
  var deleted = [];
  var maxAcceptableAge = 480; //Eight minutes in seconds

  redis_connection.keys(key, function(error, replies) {
    async.forEach(replies, function(key_value, callback){
      redis_connection.get(key_value.to_string(), function(err, reply){
        var busInfo = JSON.parse(reply);
        var busAge = (busInfo.createTime - Date.now())/ticksPerSecond;
          if(busAge > maxAcceptableAge) {
            redis_connection.del(key_value.to_string());
            deleted.push(JSON.stringify({key_value});
          }
      });
    }, function(err){
      deleted = JSON.stringify(deleted);
    });
  });

  return deleted;
}

module.exports.Bus = Bus;
