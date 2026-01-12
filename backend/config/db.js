import { Sequelize } from "sequelize";

<<<<<<< HEAD

const sequelize = new Sequelize("ride_sharing_db", "root", process.env.DB_PASS, {
=======
const sequelize = new Sequelize("ride_sharing_db", "root", "", {
>>>>>>> 40382e21b824043aa27756ae35345086ba63607c
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default sequelize;
