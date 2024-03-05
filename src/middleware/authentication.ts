import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ReqUser } from "../interface/Express";

export const optionalAuth: RequestHandler = async (req, res, next) => {
  try {
    const { jwt: token } = req.cookies;

    if (!token) return next();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Missing JWT_SECRET in env" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as ReqUser;

    if (!decoded._id) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as ReqUser;

    if (!decoded._id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(500).json({ message: next(error) });
  }
};
