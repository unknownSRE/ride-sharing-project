import { User } from "../../models/index.js";

export const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, license_number } =
      req.body;

    const existingUser = await User.findOne({ where: { email } });
    const existingPhone = await User.findOne({ where: { phone } });

    if (existingUser || existingPhone) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    const newUser = await User.create({
      full_name,
      email,
      phone,
      password,
      role,
      license_number,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
