import express from "express";
import cors from "cors"; // Importing CORS to allow cross-origin requests
import { ApolloServer } from "apollo-server-express";
import * as soap from "soap";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Importing database connection and routes
import sequelize from "./config/db.js"; 
import { User, Ride, Vehicle, Rating, Payment } from "./models/index.js";
import userRoutes from "./rest/routes/user.routes.js";
import rideRoutes from "./rest/routes/ride.routes.js";
import typeDefs from "./graphql/typeDef.js"; // Corrected from typeDefs.js to typeDef.js
import resolvers from "./graphql/resolvers.js";
import paymentService from "./soap/payment.service.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();

// Middleware
// Enable CORS for your Live Server frontend
app.use(cors({ origin: 'http://127.0.0.1:5500' })); 
app.use(express.json());

// Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 1. REST Routes
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);

// 2. GraphQL Setup
const startApollo = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
  console.log("🚀 GraphQL ready at /graphql");
};

// Start Server Configuration
const PORT = 3000;

// Synchronize database and start the server
sequelize.sync({ alter: true }).then(async () => {
  console.log("Database connected and synchronized.");
  await startApollo();

  const httpServer = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // 3. SOAP Service Setup
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    try {
      const wsdlPath = path.join(__dirname, "soap/payment.wsdl");
      const wsdl = fs.readFileSync(wsdlPath, "utf8");

      soap.listen(httpServer, "/soap/payment", paymentService, wsdl);
      console.log("🧼 SOAP ready at /soap/payment");
    } catch (error) {
      console.error("Error starting SOAP service:", error.message);
    }
  });
}).catch((err) => {
  console.error("Database connection failed:", err);
});