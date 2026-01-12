import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ride = sequelize.define(
  "Ride",
  {
    ride_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pickup_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    drop_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "requested",
      validate: {
        isIn: [["requested", "ongoing", "completed", "cancelled"]],
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fare: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "rides",
    timestamps: false,
  }
);

export default Ride;
