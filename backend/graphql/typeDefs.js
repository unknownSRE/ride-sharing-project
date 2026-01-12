import { gql } from "apollo-server-express";

const typeDefs = gql`
  # Define the vehicle structure
  type Vehicle {
    vehicle_id: ID!
    driver_id: Int!
    make: String!
    model: String!
    plate_number: String!
    color: String
    year: Int
  }

  type Rating {
    rating_id: ID!
    ride_id: Int!
    given_by: Int!
    given_to: Int!
    score: Int!
    comment: String
  }

  # Inputs for creating data
  input VehicleInput {
    driver_id: Int!
    make: String!
    model: String!
    plate_number: String!
    color: String
    year: Int
  }

  input RatingInput {
    ride_id: Int!
    given_by: Int!
    given_to: Int!
    score: Int!
    comment: String
  }

  type Query {
    getVehicleByDriver(driver_id: Int!): Vehicle
    getDriverRatings(driver_id: Int!): [Rating]
    getRatingsByRide(ride_id: Int!): [Rating]
    getRatingsByUser(user_id: Int!): [Rating]
  }

  # Root Mutation
  type Mutation {
    registerVehicle(input: VehicleInput!): Vehicle
    addRating(input: RatingInput!): Rating
  }
`;

export default typeDefs;
