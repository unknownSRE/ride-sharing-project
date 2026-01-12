import { gql } from "apollo-server-express";

const typeDefs = gql`
  # --- TYPES ---
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

  # --- INPUTS (For creating data) ---
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

  # --- QUERIES (Get Data) ---
  type Query {
    getVehicleByDriver(driver_id: Int!): Vehicle
    getRatingsByRide(ride_id: Int!): [Rating]
    getRatingsByUser(user_id: Int!): [Rating]
  }

  # --- MUTATIONS (Create/Update Data) ---
  type Mutation {
    registerVehicle(input: VehicleInput): Vehicle
    addRating(input: RatingInput): Rating
  }
`;

export default typeDefs;
