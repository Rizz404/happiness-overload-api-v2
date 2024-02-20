import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { Types } from "mongoose";

interface ReqUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  roles: "Admin" | "User" | "Bot";
}

declare global {
  namespace Express {
    interface Request {
      user: ReqUser;
    }
  }
}

const verifyJwtAndRoles: (allowedRoles?: Array<"Admin" | "User" | "Bot">) => RequestHandler =
  (allowedRoles = ["Admin", "User", "Bot"]) =>
  async (req, res, next) => {
    try {
      const token = req.cookies.jwt;

      if (!token) return res.status(401).json({ message: "No token included" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;

      if (!decoded.userId) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.user = await User.findById(decoded.userId).select("_id username email roles");

      const { roles } = req.user;

      // * Jika allowedRoles tidak didefinisikan atau kosong, lanjutkan ke middleware berikutnya
      if (!allowedRoles || allowedRoles.length === 0) {
        return next();
      }

      // * Kalo ada parameter baru di cek
      if (!allowedRoles.includes(roles)) {
        return res.status(403).json({ message: `Only ${allowedRoles.join(", ")} are allowed` });
      }

      next();
    } catch (error) {
      res.status(401).json(error);
    }
  };

export default verifyJwtAndRoles;
