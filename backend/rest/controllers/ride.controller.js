import { Ride } from "../../models/index.js";

export const create_ride = async (req, res) => {
  try {
    const { rider_id, pickup_location, drop_location } = req.body;
    if (!rider_id || !pickup_location || !drop_location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ride = await Ride.create({
      rider_id,
      pickup_location,
      drop_location,
      status: "requested",
    });
    res.status(201).json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const list_rides = async (req, res) => {
  try {
    const rides = await Ride.findAll();
    res.json(rides);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const get_ride_by_id = async (req, res) => {
  try {
    const ride = await Ride.findByPk(req.params.ride_id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const accept_ride = async (req, res) => {
  try {
    const { driver_id } = req.body;
    const ride = await Ride.findByPk(req.params.ride_id);

    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "requested")
      return res
        .status(400)
        .json({ message: "Ride already accepted or cancelled" });

    ride.driver_id = driver_id;
    ride.status = "ongoing";
    ride.start_time = new Date();
    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const complete_ride = async (req, res) => {
  try {
    const { fare } = req.body;
    const ride = await Ride.findByPk(req.params.ride_id);

    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "ongoing")
      return res
        .status(400)
        .json({ message: "Only ongoing rides can be completed" });

    ride.status = "completed";
    ride.end_time = new Date();
    ride.fare = fare;
    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const cancel_ride = async (req, res) => {
  try {
    const ride = await Ride.findByPk(req.params.ride_id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status === "completed")
      return res.status(400).json({ message: "Cannot cancel completed ride" });

    ride.status = "cancelled";
    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
