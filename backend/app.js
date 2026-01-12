import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import * as soap from "soap";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import sequelize from "./config/db.js";
import { User, Ride, Vehicle, Rating, Payment } from "./models/index.js";
import userRoutes from "./rest/routes/user.routes.js";
import rideRoutes from "./rest/routes/ride.routes.js";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import paymentService from "./soap/payment.service.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "SOAPAction"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.text({ type: "text/xml" }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.options("/soap/payment", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, SOAPAction, Authorization"
  );
  res.header("Access-Control-Max-Age", "86400");
  res.sendStatus(204);
});

app.post("/soap/payment", async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, SOAPAction");

    const soapBody = req.body;
    console.log("Raw SOAP Request:", soapBody);

    const rideIdMatch = soapBody.match(
      /<(?:tns:)?ride_id>(\d+)<\/(?:tns:)?ride_id>/
    );
    const amountMatch = soapBody.match(
      /<(?:tns:)?amount>([\d.]+)<\/(?:tns:)?amount>/
    );
    const methodMatch = soapBody.match(
      /<(?:tns:)?method>(\w+)<\/(?:tns:)?method>/
    );

    if (!rideIdMatch || !amountMatch || !methodMatch) {
      throw new Error("Invalid SOAP request format");
    }

    const args = {
      ride_id: parseInt(rideIdMatch[1]),
      amount: parseFloat(amountMatch[1]),
      method: methodMatch[1],
    };

    console.log("SOAP Request Received:", args);

    const result =
      await paymentService.PaymentService.PaymentPort.createPaymentRequest(
        args
      );

    const soapResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://localhost:3000/soap/payment">
  <soap:Body>
    <tns:createPaymentResponse>
      <tns:transaction_id>${result.transaction_id}</tns:transaction_id>
      <tns:status>${result.status}</tns:status>
      <tns:message>${result.message}</tns:message>
    </tns:createPaymentResponse>
  </soap:Body>
</soap:Envelope>`;

    res.set("Content-Type", "text/xml");
    res.send(soapResponse);
  } catch (error) {
    console.error("SOAP Error:", error);

    const faultResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>${error.message}</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;

    res.status(500).set("Content-Type", "text/xml").send(faultResponse);
  }
});

app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);

const startApollo = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
  console.log("🚀 GraphQL ready at /graphql");
};

const PORT = 3000;

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Database connected and synchronized.");
    await startApollo();

    const httpServer = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("🧼 SOAP ready at /soap/payment (manual handler with CORS)");

      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const wsdlPath = path.join(__dirname, "soap/payment.wsdl");

      app.get("/soap/payment", (req, res) => {
        if (req.query.wsdl !== undefined) {
          res.set("Content-Type", "text/xml");
          res.sendFile(wsdlPath);
        } else {
          res
            .status(405)
            .send(
              "Method not allowed. Use POST for SOAP requests or add ?wsdl for WSDL"
            );
        }
      });
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
