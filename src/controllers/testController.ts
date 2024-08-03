import { RequestHandler } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import getErrorMessage from "../utils/express/getErrorMessage";

export const createBotUser: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newBot = await User.createUser({
      username,
      email,
      password: hashedPassword,
      role: "Bot",
      isOauth: false,
    });

    res.status(201).json({
      message: `Bot ${newBot.username} has been created`,
      data: newBot,
    });
  } catch (error) {
    res.status(500).json(getErrorMessage(error));
  }
};
