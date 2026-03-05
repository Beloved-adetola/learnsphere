// routes/user.js
import express from "express";
import { authenticate } from "../middlewares/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", authenticate, async (req, res) => {
  try {
    const { role } = req.body;
    let user = req.user;
    
    // Use provided role or default to candidate
    const finalRole = role || "candidate";
    
    // If not found, create one
    if (!user) {
      console.log("Creating new user in MongoDB:", req.email, "with role:", finalRole);
      user = new User({
        uid: req.uid,
        email: req.email,
        role: finalRole,
      });
      await user.save();
    } else {
      // Ensure existing user has the correct role
      if (user.role !== finalRole) {
          console.log("Updating existing user role from", user.role, "to", finalRole);
          user.role = finalRole;
          await user.save();
      }
    }
    
    res.status(201).json({
      uid: user.uid,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/profile", authenticate, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    role: req.user.role,
    organizationCode: req.user.organizationCode || "",
  });
});

router.put("/profile/code", authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    console.log("Saving organization code:", code, "for user:", req.user.uid, "role:", req.user.role);
    
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can set an organization code" });
    }
    
    req.user.organizationCode = code;
    await req.user.save();
    console.log("Successfully saved code to MongoDB");
    
    res.json({ message: "Organization code updated successfully", code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
