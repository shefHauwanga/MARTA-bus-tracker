var connection = require('./sql_connection');

var Shape = connection.sqlconnection.define('shape',{
  shape_id: connection.sequelize.INTEGER,
  shape_pt_lat: connection.sequelize.STRING(50),
  shape_pt_lon: connection.sequelize.STRING(50),
  shape_pt_sequence: connection.sequelize.INTEGER
});

module.exports.Shape = Shape;
