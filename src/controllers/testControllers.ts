import { RequestHandler } from "express";
import getErrorMessage from "../utils/express/getErrorMessage";
import User from "../models/User";
import bcrypt from "bcrypt";

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

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOneAndDelete({ username });

    res.status(200).json({
      message: `Successfully deleted user with username ${user?.username}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getTwoRandomBot: RequestHandler = async (req, res) => {
  try {
    const randomUser = await User.aggregate([
      {
        $match: {
          roles: /Bot/i,
        },
      },
      { $sample: { size: 2 } },
    ]);

    res.json(randomUser);
  } catch (error) {
    getErrorMessage(error);
  }
};
