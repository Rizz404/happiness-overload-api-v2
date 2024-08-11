import { RequestHandler } from "express";

const allowedRoles: (
  allowedRoles: Array<"Admin" | "User" | "Bot">
) => RequestHandler = (allowedRoles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "Need authentication" });

  const { role } = req.user;

  if (!allowedRoles)
    return res.status(400).json({ message: "Must fill at least one role" });

  if (!allowedRoles.includes(role)) {
    return res
      .status(403)
      .json({ message: `Only ${allowedRoles.join(", ")} allowed` });
  }

  next();
};

export default allowedRoles;
