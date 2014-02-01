var connection = require('./sql_connection');

var StopTime = connection.sqlconnection.define('stop_time', {
  id: connection.sequelize.INTEGER,
  trip_id: connection.sequelize.INTEGER,
  arrival_time: connection.sequelize.DATE,
  departure_time: connection.sequelize.DATE,
  stop_id: connection.sequelize.INTEGER,
  stop_sequence: connection.sequelize.INTEGER
});

module.exports.StopTime = StopTime;
