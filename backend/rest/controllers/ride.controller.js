import { Ride } from "../../models/index.js";
import axios from "axios";

const getCoordinates = async (locationName) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      locationName
    )}`;

    const response = await axios.get(url, {
      headers: { "User-Agent": "RideSharingStudentProject/1.0" },
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
};

const calculateRealDistance = (coord1, coord2) => {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lon - coord1.lon) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
};

export const requestRide = async (req, res) => {
  try {
    const { rider_id, pickup_location, drop_location } = req.body;
    let distance = 0;
    let fare = 0;
    const RATE_PER_KM = 18;
    const BASE_FARE = 50;

    const pickupCoords = await getCoordinates(pickup_location);
    const dropCoords = await getCoordinates(drop_location);

    if (pickupCoords && dropCoords) {
      distance = calculateRealDistance(pickupCoords, dropCoords);
      fare = Math.round(BASE_FARE + distance * RATE_PER_KM);
    } else {
      console.log("Could not find location coordinates, using default fare.");
      distance = 5;
      fare = 150;
    }

    const newRide = await Ride.create({
      rider_id,
      pickup_location,
      drop_location,
      status: "requested",
      fare: fare,
    });

    res.status(201).json({
      message: "Ride requested successfully",
      ride_details: {
        ride_id: newRide.ride_id,
        pickup: pickup_location,
        drop: drop_location,
        real_distance_km: distance,
        calculated_fare: `₹${fare}`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.findAll();
    res.json(rides);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findByPk(req.params.ride_id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const acceptRide = async (req, res) => {
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

export const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findByPk(req.params.ride_id);

    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "ongoing")
      return res
        .status(400)
        .json({ message: "Only ongoing rides can be completed" });

    ride.status = "completed";
    ride.end_time = new Date();
    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const cancelRide = async (req, res) => {
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

export const updateRider = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { rider_id } = req.body;

    const ride = await Ride.findByPk(ride_id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.rider_id = rider_id;
    await ride.save();

    res.status(200).json({
      message: "Rider updated successfully",
      ride,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
