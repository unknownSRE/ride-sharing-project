import { Sequelize } from "sequelize";

const sequelize = new Sequelize("ride_sharing_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default sequelize;
