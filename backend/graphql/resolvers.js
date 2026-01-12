import { Vehicle, Rating, User } from "../models/index.js";

const resolvers = {
  Query: {
    getVehicleByDriver: async (_, { driver_id }) => {
      return await Vehicle.findOne({ where: { driver_id } });
    },
    getRatingsByRide: async (_, { ride_id }) => {
      return await Rating.findAll({ where: { ride_id } });
    },
    getRatingsByUser: async (_, { user_id }) => {
      return await Rating.findAll({ where: { given_to: user_id } });
    },
  },

  Mutation: {
    registerVehicle: async (_, { input }) => {
      const { driver_id } = input;

      const driver = await User.findByPk(driver_id);
      if (!driver || driver.role !== "driver") {
        throw new Error("Invalid driver ID or User is not a driver");
      }

      const existing = await Vehicle.findOne({ where: { driver_id } });
      if (existing) {
        throw new Error("Driver already has a vehicle");
      }

      return await Vehicle.create(input);
    },

    addRating: async (_, { input }) => {
      return await Rating.create(input);
    },
  },
};

export default resolvers;
