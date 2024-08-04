import { RequestHandler } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import getErrorMessage from "../utils/express/getErrorMessage";
import { Types } from "mongoose";
import deleteFileFirebase from "../utils/express/deleteFileFirebase";
import {
  createPageLinks,
  createPagination,
  multiResponse,
} from "../utils/express/multiResponse";
import { ReqQuery } from "../types/request";
import { IUser } from "../types/models/User";

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id).excludeSensitive().lean();

    if (!user) {
      return res.status(404).json({ message: `User with ${_id} not found!` });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 20 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;
    const totalData = await User.countDocuments();

    const users = await User.find()
      .limit(limit)
      .skip(skip)
      .lean()
      .excludeSensitive();
    const totalPages = Math.ceil(totalData / limit);

    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks("/users", page, totalPages, limit);
    const response = multiResponse(users, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).excludeSensitive().lean();

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with ${userId} not found!` });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id).excludeSensitive();

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with id ${_id} not found!` });
    }

    const { username, email, imageString, fullname, phoneNumber, bio } =
      req.body;
    const profilePicture = req.file;

    if (profilePicture && imageString) {
      return res.status(400).json({
        message: "Can't upload both file and string for image, choose one",
      });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.fullname = fullname || user.fullname;
    user.profilePicture = imageString || user.profilePicture;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.bio = bio || user.bio;

    if (profilePicture) {
      if (user.profilePicture) {
        await deleteFileFirebase(user.profilePicture);
      }
      // @ts-ignore
      user.profilePicture = profilePicture.fileUrl;
    }

    await user.save();

    res.json({
      message: "Successfully updated profile",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updatePassword: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(_id);

    if (!user?.password || user.isOauth === true) {
      return res
        .status(400)
        .json({ message: "Oauth doesn't include password" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Password doesn't match" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // * Tidak harus atomik karena kan password masing-masing user
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Update password suceess" });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const followUser: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { userId } = req.params;
    const user = await User.findById(_id).select("followings followers").lean();
    const userIdObjId = new Types.ObjectId(userId);

    const isFollowed = user?.followings.includes(userIdObjId);

    if (!isFollowed) {
      await User.findByIdAndUpdate(
        { _id },
        { $push: { followings: userIdObjId } }
      );
      await User.findByIdAndUpdate(
        { _id: userIdObjId },
        { $push: { followers: _id } }
      );
    } else {
      await User.findByIdAndUpdate(
        { _id },
        { $pull: { followings: userIdObjId } }
      );
      await User.findByIdAndUpdate(
        { _id: userIdObjId },
        { $pull: { followers: _id } }
      );
    }

    res.json({
      message: !isFollowed
        ? `Successfully follow user with ID: ${userId}`
        : `Successfully unfollow user with ID: ${userId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getFollowings: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    // ? seharusnya ini sudah number tapi kalau belum tambahin +
    const { page = 1, limit = 20 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(_id)
      .select("followings")
      .lean()
      .populate({
        path: "followings",
        select:
          "-followings -followers -savedPosts -followedTags -blockedTags -password",
        options: { limit: limit, skip: skip },
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    const totalData = user.followings.length || 0;
    const totalPages = Math.ceil(totalData / limit);

    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks("/users/followings", page, totalPages, limit);
    const response = multiResponse(user.followings, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getFollowers: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { page = 1, limit = 20 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(_id)
      .select("followers")
      .lean()
      .populate({
        path: "followers",
        select:
          "-followings -followers -savedPosts -followedTags -blockedTags -password",
        options: { limit: limit, skip: skip },
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    const totalData = user.followers.length || 0;
    const totalPages = Math.ceil(totalData / limit);

    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks("/users/followers", page, totalPages, limit);
    const response = multiResponse(user.followers, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const searchUserByUsername: RequestHandler = async (req, res) => {
  try {
    const { username, page = 1, limit = 10 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;

    // todo: Pelajari lagi tentang $option dan $regex
    const users = await User.find({
      username: { $regex: username, $options: "i" },
    })
      .limit(limit)
      .skip(skip)
      .lean()
      .excludeSensitive();
    const totalData = await User.countDocuments({
      username: { $regex: username, $options: "i" },
    });

    const totalPages = Math.ceil(totalData / limit);
    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks(
      `/users/search?=${username}`,
      page,
      totalPages,
      limit
    );
    const response = multiResponse(users, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
