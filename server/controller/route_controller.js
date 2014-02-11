var models = require('../models/model.js');

var RouteController = {};
var helperNameSpace = {};

helperNameSpace.getRoute = function (route_id){
  models.Route.find({where: {id: route_id}}).success(function (route){
    return {
      name: route.dataValues.route_long_name,
      number: route.dataValues.route_short_name
    };
  });
}

helperNameSpace.getStopData = function (current_trip_id){
  var stopTimeValues = [];

  function getStopDatum(stop_id){
    models.Stop.find({where: {id: stop_id}}).success(function (stop){
      return {
        lat: stop.dataValues.lat,
        lon: stop.dataValues.lon
      }
    });
  }

  models.StopTime.findAll({where: {trip_id: current_trip_id}}).success(function (stopTimes){
    stopTimes.forEach(function (stopTime){
      current_stop_data = getStopDatum(stopTime.dataValues.stop_id);
      current_stop_data.arrival_time = stopTime.dataValues.arrival_time;
      current_stop_data.departure_time = stopTime.dataValues.departure_time;
      stopTimeValues.push(current_stop_data);
    });
  });

  return stopTimeValues;
}

helperNameSpace.getStopData = function (current_trip_id){
  var shapeValues = [];
  models.Shape.findAll({where: {id: shape_id}}).success(function (shapePoints){
    shapePoints.forEach(function(shapePoint) {
      shapeValues.push({
        sequence_num: shapePoint.dataValues.shape_pt_sequence,
        lat: shapePoint.dataValues.shape_pt_lat,
        lon: shapePoint.dataValues.shape_pt_lon
      }); // ShapePoint object
    }); // Shape data iterator
  });// Shape data

  return shapeValues;
}

RouteController.getTrip = function (current_trip_id){
  var values = {};

  models.Trip.find({where: {id: current_trip_id}}).success(function (trip){
    values.routeValues = helperNameSpace.getRoute(trip.dataValues.route_id);
    values.stopValues = helperNameSpace.getStopData(current_trip_id);
    values.shapeValues = helperNameSpace.getShapeData(trip.dataValues.shape_id);
  });

  return values;
};

module.exports.Route_controller = Route_controller;
