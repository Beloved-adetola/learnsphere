import admin from "firebase-admin";
import User from "../models/User.js";

export async function authenticate(req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.header("Authorization");
  const idToken =
    authHeader?.split("Bearer ")[1] || authHeader?.split("Bearer")[1];

  if (!idToken) {
    return res.status(401).send("No token provided");
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    req.email = decoded.email;

    const user = await User.findOne({ uid: decoded.uid });

    if (!user && !req.originalUrl.includes("/register")) {
      return res.status(404).send("No user profile found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}