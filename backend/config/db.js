import { Sequelize } from "sequelize";

const sequelize = new Sequelize("ride_sharing", "root", "Keshav@mysql", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
