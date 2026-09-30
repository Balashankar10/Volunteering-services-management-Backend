const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Provider = require("../models/Provider");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register User
router.post("/user/register", async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });
    res.json({ message: "User registered successfully" });
});

// Login User
router.post("/user/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ email, role: "User" }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
});

// Register Provider
router.post("/provider/register", async (req, res) => {
    const { email, password } = req.body;
    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) return res.status(400).json({ message: "Provider already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await Provider.create({ email, password: hashedPassword });
    res.json({ message: "Provider registered successfully" });
});

// Login Provider
router.post("/provider/login", async (req, res) => {
    const { email, password } = req.body;
    const provider = await Provider.findOne({ email });
    if (!provider || !(await bcrypt.compare(password, provider.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ email, role: "Provider" }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
});

module.exports = router;
