import { Sequelize } from "sequelize";

const sequelize = new Sequelize("ride_sharing_db", "root", "Diya_2003", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default sequelize;
