import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { requireCandidate } from "../middlewares/roleCheck.js";

import {
  getAvailableQuizzes,
  getQuizDetails,
  submitQuiz,
  getQuizHistory,
} from "../controllers/candidateController.js";

const router = express.Router();

// router.use(authMiddleware);
router.get("/dashboard", authenticate, requireCandidate, (req, res) => {
  res.json({ message: "Welcome Candidate", user: req.user });
});
router.get("/quizzes", authenticate, requireCandidate, getAvailableQuizzes);
router.get("/quizzes/:id", authenticate, requireCandidate, getQuizDetails);
router.post("/quizzes/:id/submit", authenticate, requireCandidate, submitQuiz);
router.get("/history", authenticate, requireCandidate, getQuizHistory);

export default router;
