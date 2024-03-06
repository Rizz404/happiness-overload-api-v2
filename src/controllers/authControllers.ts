import { RequestHandler, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import getErrorMessage from "../utils/express/getErrorMessage";
import { randomUUID } from "crypto";

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const usernameExist = await User.findOne({ username });
    const emailExist = await User.findOne({ email });

    if (usernameExist) return res.status(400).json({ message: "username already exist" });
    if (emailExist) return res.status(400).json({ message: "email already exist" });

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.createUser({
      username,
      email,
      password: hashedPassword,
      isOauth: false,
    });

    res.status(201).json({ message: `User ${newUser.username} has been created`, data: newUser });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const generateTokenAndSetCookie = (user: any, res: Response) => {
  const token = jwt.sign(
    { _id: user._id, username: user.username, email: user.email, roles: user.roles },
    process.env.JWT_SECRET || "",
    { expiresIn: "30d" }
  );

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

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) return res.status(401).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ message: "Password does not match" });

    user.lastLogin = new Date();
    await user.save();
    generateTokenAndSetCookie(user, res);
    res.json({
      message: "Successfully login",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        isOauth: user.isOauth,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const loginWithGoogle: RequestHandler = async (req, res) => {
  try {
    // todo: Nanti ganti controller ini soalnya ga jelas
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
    res.json({ message: "Successfully login with Oauth", data: user });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const token: string = req.cookies.jwt;

    if (!token) return res.sendStatus(204); // * Status 204 tidak bisa pakai message

    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.json({ message: "Successfully logout" });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
