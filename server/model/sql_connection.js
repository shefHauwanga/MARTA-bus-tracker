var Sequelize = require("sequelize");

var sequelize = new Sequelize('marta_bus_data', 'marta_bus', 'busdata', {
  host: "localhost",
  port: 5432,
  dialect: 'postgres'
});

module.exports.sqlconnection = sequelize;
module.exports.sequelize = Sequelize;
