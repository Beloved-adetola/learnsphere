// middlewares/roleCheck.js

export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}

export function requireCandidate(req, res, next) {
  if (req.user.role !== "candidate") {
    return res.status(403).json({ message: "Candidates only" });
  }
  next();
}
