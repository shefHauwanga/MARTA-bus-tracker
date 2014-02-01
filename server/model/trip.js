var connection = require('./sql_connection');

var Trip = connection.sqlconnection.define('trip', {
  id: connection.sequelize.INTEGER,
  route_id: connection.sequelize.INTEGER,
  service_id: connection.sequelize.INTEGER,
  direction_id: connection.sequelize.INTEGER,
  trip_headsign: connection.sequelize.STRING(50),
  block_id: connection.sequelize.INTEGER,
  shape_id: connection.sequelize.INTEGER
});

module.exports.Trip = Trip;
