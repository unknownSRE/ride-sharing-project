import { Payment, Ride } from "../models/index.js";

const service = {
  PaymentService: {
    PaymentPort: {
      createPayment: async function (args) {
        try {
          console.log("SOAP Request Received:", args);

          const ride_id = parseInt(args.ride_id);
          const amount = parseFloat(args.amount);
          const method = args.method || "cash"; // default to cash if missing

          const ride = await Ride.findByPk(ride_id);
          if (!ride) {
            return {
              status: "FAILED",
              message: "Ride not found",
              paymentId: 0,
            };
          }

          if (ride.status !== "completed") {
            return {
              status: "FAILED",
              message: "Ride is not completed yet",
              paymentId: 0,
            };
          }

          const newPayment = await Payment.create({
            ride_id,
            amount,
            method,
            status: "completed",
          });

          return {
            status: "SUCCESS",
            message: "Payment processed successfully",
            paymentId: newPayment.payment_id,
          };
        } catch (error) {
          console.error("SOAP Error:", error);
          return {
            status: "ERROR",
            message: error.message,
            paymentId: 0,
          };
        }
      },
    },
  },
};

export default service;
