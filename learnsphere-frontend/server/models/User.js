import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: { type: String, enum: ['admin', 'candidate'], default: 'candidate' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
