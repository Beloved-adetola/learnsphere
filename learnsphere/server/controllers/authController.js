// controllers/auth.js (after sign-up)
import User from '../models/User.js';

export async function createUserProfile(decodedToken) {
  const { uid, email } = decodedToken;
  const role = determineRoleLogic(); // e.g., based on email domain or invitation
  await User.create({ uid, email, role });
}
