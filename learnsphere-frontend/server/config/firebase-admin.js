import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!raw) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT is missing. Check your .env file and make sure dotenv is loading."
  );
}

const serviceAccount = JSON.parse(raw);

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;