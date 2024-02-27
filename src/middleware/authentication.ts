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

export const optionalAuth: RequestHandler = async (req, res, next) => {
  try {
    const { jwt: token } = req.cookies;

    if (!token) return next();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Missing JWT_SECRET in env" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    if (!decoded.userId) return res.status(401).json({ message: "Invalid token" });

    req.user = await User.findById(decoded.userId).select("_id username email roles");

    next();
  } catch (error) {
    res.status(500).json({ message: next(error) });
  }
};

export const auth: RequestHandler = async (req, res, next) => {
  try {
    const { jwt: token } = req.cookies;

    if (!token) return res.status(401).json({ message: "No token included" });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Missing JWT_SECRET in env" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = await User.findById(decoded.userId).select("_id username email roles");

    next();
  } catch (error) {
    res.status(500).json({ message: next(error) });
  }
};
