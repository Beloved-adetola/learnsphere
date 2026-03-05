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
  role: {
    type: String,
    enum: ["admin", "candidate"],
    required: true,
  },
  organizationCode: {
    type: String,
    default: "",
  },
});

export default mongoose.model("User", userSchema);
