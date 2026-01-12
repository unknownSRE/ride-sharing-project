import express from "express";
import {
  requestRide,
  getAllRides,
  getRideById,
  acceptRide,
  completeRide,
  cancelRide,
  updateRider,
} from "../controllers/ride.controller.js";

const router = express.Router();

router.post("/request", requestRide);
router.get("/", getAllRides);
router.get("/:ride_id", getRideById);
router.put("/accept/:ride_id", acceptRide);
router.put("/complete/:ride_id", completeRide);
router.put("/cancel/:ride_id", cancelRide);
router.put("/update-rider/:ride_id", updateRider);

export default router;
