import sequelize from "../config/db.js";
import User from "./User.js";
import Ride from "./Ride.js";
import Payment from "./Payment.js";
import Rating from "./Rating.js";
import Vehicle from "./Vehicle.js";

// --- Associations ---

// User (Driver) <-> Vehicle
User.hasOne(Vehicle, { foreignKey: "driver_id" });
Vehicle.belongsTo(User, { foreignKey: "driver_id" });

// User (Rider) <-> Ride
User.hasMany(Ride, { foreignKey: "rider_id", as: "BookedRides" });
Ride.belongsTo(User, { foreignKey: "rider_id", as: "Rider" });

// User (Driver) <-> Ride
User.hasMany(Ride, { foreignKey: "driver_id", as: "DrivenRides" });
Ride.belongsTo(User, { foreignKey: "driver_id", as: "Driver" });

// Ride <-> Payment
Ride.hasOne(Payment, { foreignKey: "ride_id" });
Payment.belongsTo(Ride, { foreignKey: "ride_id" });

// Ride <-> Rating
Ride.hasMany(Rating, { foreignKey: "ride_id" });
Rating.belongsTo(Ride, { foreignKey: "ride_id" });

// User <-> Rating (Recieved)
User.hasMany(Rating, { foreignKey: "given_to", as: "ReceivedRatings" });
Rating.belongsTo(User, { foreignKey: "given_to", as: "Recipient" });

// Export everything together
export { sequelize, User, Ride, Payment, Rating, Vehicle };
