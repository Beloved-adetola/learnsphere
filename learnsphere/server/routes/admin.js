import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/roleCheck.js";

import {
  createQuiz,
  getQuizzes,
  updateQuiz,
  deleteQuiz,
} from "../controllers/adminController.js";

const router = express.Router();

// router.use(authMiddleware);
router.get("/dashboard", authenticate, requireAdmin, (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});

router.post("/quizzes", authenticate, requireAdmin, createQuiz);
router.get("/quizzes", authenticate, requireAdmin, getQuizzes);
router.put("/quizzes/:id", authenticate, requireAdmin, updateQuiz);
router.delete("/quizzes/:id", authenticate, requireAdmin, deleteQuiz);

// Add this endpoint for admin check
router.get("/check-status", (req, res) => {
  try {
    // Implement your admin verification logic here
    // Example: Check Firestore for admin role
    res.json({ isAdmin: true });
  } catch (error) {
    res.status(500).json({ error: "Admin check failed" });
  }
});

export default router;
