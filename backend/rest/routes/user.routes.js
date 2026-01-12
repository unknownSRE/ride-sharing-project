import express from "express";
import * as controller from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.get("/:id", controller.getUserById);

export default router;
