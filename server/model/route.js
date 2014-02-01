var connection = require('./sql_connection');

var Route = connection.sqlconnection.define('route', {
  id: connection.sequelize.INTEGER,
  route_short_name: connection.sequelize.INTEGER,
  route_long_name: connection.sequelize.STRING(50),
  route_desc: connection.sequelize.STRING(50),
  route_type: connection.sequelize.INTEGER,
  route_url: connection.sequelize.STRING(50),
  route_color: connection.sequelize.STRING(50),
  route_text_color: connection.sequelize.STRING(50)
});

module.exports.Route = Route;
