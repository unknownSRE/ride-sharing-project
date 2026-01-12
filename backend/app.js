import express from "express";
import { ApolloServer } from "apollo-server-express";
import * as soap from "soap";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { sequelize } from "./models/index.js";
import userRoutes from "./rest/routes/user.routes.js";
import rideRoutes from "./rest/routes/ride.routes.js";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import paymentService from "./soap/payment.service.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();
app.use(express.json());

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

// Start Server
const PORT = 3000;

sequelize.sync({ alter: true }).then(async () => {
  await startApollo();

  const httpServer = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // 3. SOAP
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const wsdl = fs.readFileSync(
      path.join(__dirname, "soap/payment.wsdl"),
      "utf8"
    );

    soap.listen(httpServer, "/soap/payment", paymentService, wsdl);
    console.log("🧼 SOAP ready at /soap/payment");
  });
});
