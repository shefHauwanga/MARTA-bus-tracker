var connection = require('./sql_connection');

var Stop = connection.sqlconnection.define('stop', {
  id: connection.sequelize.INTEGER,
  stop_code: connection.sequelize.INTEGER,
  stop_name: connection.sequelize.STRING(50),
  stop_lat: connection.sequelize.STRING(50),
  stop_lon: connection.sequelize.STRING(50)
});

module.exports.Stop = Stop;
