import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Rating = sequelize.define(
  "Rating",
  {
    rating_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Added autoIncrement (good practice)
    },
    ride_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    given_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    given_to: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }, // Added validation for 1-5 stars
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "ratings",
    timestamps: false,
  }
);

export default Rating;
