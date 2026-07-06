import mongoose from "mongoose";

const userAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedAnswer: String,
      isCorrect: Boolean,
    },
  ],
  attemptDate: { type: Date, default: Date.now },
});

export default mongoose.model("UserAttempt", userAttemptSchema);
