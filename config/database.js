const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "mysql://root:Webcast.ly695@sys.cwwkcgormh6v.ap-southeast-1.rds.amazonaws.com:3306/estl"
);

module.exports.database = sequelize;
