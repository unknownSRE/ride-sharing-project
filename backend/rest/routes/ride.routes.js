import express from "express";
import * as controller from "../controllers/ride.controller.js";

const router = express.Router();

router.post("/request", controller.create_ride);
router.get("/", controller.list_rides);
router.get("/:ride_id", controller.get_ride_by_id);
router.put("/:ride_id/accept", controller.accept_ride);
router.put("/:ride_id/complete", controller.complete_ride);
router.put("/:ride_id/cancel", controller.cancel_ride);

export default router;
