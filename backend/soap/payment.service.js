import Payment from "../models/Payment.js";

const paymentService = {
  PaymentService: {
    PaymentPort: {
      createPaymentRequest: async function (args) {
        console.log("SOAP Request Received:", args);

        try {
          if (!args.ride_id || !args.amount) {
            throw new Error("Missing ride_id or amount");
          }

          const newPayment = await Payment.create({
            ride_id: args.ride_id,
            amount: args.amount,
            method: args.method || "UPI",
            status: "completed",
          });

          return {
            transaction_id: "TXN-" + Date.now(),
            status: "SUCCESS",
            message: `Payment of ${args.amount} processed successfully.`,
          };
        } catch (error) {
          console.error("SOAP Processing Error:", error);
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: error.message },
            },
          };
        }
      },
    },
  },
};

export default paymentService;
