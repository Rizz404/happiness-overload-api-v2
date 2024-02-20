import { RequestHandler, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import getErrorMessage from "../utils/getErrorMessage";
import { v4 as uuidv4 } from "uuid";
import { randomUUID } from "crypto";

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUsername = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (!(username || email) || !password) {
      return res.status(400).json({ message: "Missing required field!" });
    }

    if (existingUsername) return res.status(400).json({ message: "Username already taken" });
    if (existingEmail) return res.status(400).json({ message: "Email already in use" });

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isOauth: false,
    });
    const savedUser = await newUser.save();

    res.status(201).json({ message: `User ${savedUser.username} has been created` });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const generateTokenAndSetCookie = (user: any, res: Response) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "", {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.PROJECT_STATUS === "production" ? true : false,
    sameSite: "none", // * Hostingnya beda frontend sama backend
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(username || email) || !password) {
      return res.status(400).json({ message: "Some field need to be filled" });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) return res.status(401).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ message: "Password does not match" });

    user.lastLogin = new Date();
    await user.save();
    generateTokenAndSetCookie(user, res);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      isOauth: user.isOauth,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const loginWithGoogle: RequestHandler = async (req, res) => {
  try {
    const { email, fullname } = req.body;

    let user = await User.findOne({ email }).select("-__v -createdAt -updatedAt -password");

    if (!user) {
      const firstName = String(fullname).split(" ")[0];
      const randomUsername = `${firstName}-${randomUUID()}`;

      user = new User({
        username: randomUsername,
        email,
        fullname,
        isOauth: true,
        lastLogin: new Date(),
      });
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();
    generateTokenAndSetCookie(user, res);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const token: string = req.cookies.jwt;

    if (!token) return res.status(204).json({ message: "You already logout" });

    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.json({ message: "Logout successfully" });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
