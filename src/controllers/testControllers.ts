import { RequestHandler } from "express";
import getErrorMessage from "../utils/express/getErrorMessage";
import User from "../models/User";

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOneAndDelete({ username });

    res.status(200).json({ message: `Successfully deleted user with username ${user?.username}` });
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
