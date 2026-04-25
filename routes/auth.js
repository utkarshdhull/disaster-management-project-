const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER BODY:", req.body);

    // 🔴 Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔴 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create user
    const newUser = new User({
      name,
      email,
      password, // (later we will hash it 🔐)
    });

    await newUser.save();

    res.json({ message: "User registered successfully ✅" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    // 🔴 Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // 🔴 Find user by email
    const user = await User.findOne({ email });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    // 🔴 Check password
    if (user.password !== password) {
      return res.status(400).json({ message: "Wrong password ❌" });
    }

    // ✅ Success
    res.json({
      message: "Login successful ✅",
      user,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;