import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  createdBy: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
  maxAttempts: { type: Number, default: 0 }, // 0 means unlimited
  timeLimit: { type: Number, default: 0 }, // in minutes, 0 means no limit
  password: { type: String, required: true },
  activeTakers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", quizSchema);
