import { RequestHandler } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import getErrorMessage from "../utils/express/getErrorMessage";
import { Types } from "mongoose";
import deleteFileFirebase from "../utils/express/deleteFileFirebase";
import { createPageLinks, createPagination, multiResponse } from "../utils/express/multiResponse";
import { ReqQuery } from "../types/request";
import { IUser } from "../types/models/User";

export const createBotUser: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newBot = await User.createUser({
      username,
      email,
      password: hashedPassword,
      roles: "Bot",
      isOauth: false,
    });

    res.status(201).json({ message: `Bot ${newBot.username} has been created`, data: newBot });
  } catch (error) {
    res.status(500).json(getErrorMessage(error));
  }
};

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id).select("-social -password");

    if (!user) return res.status(404).json({ message: `User with ${_id} not found!` });

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
    const users = await User.find().select("-social -password").limit(limit).skip(skip);
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
    const user = await User.findById(userId).select("-social -password");

    if (!user) return res.status(404).json({ message: `User with ${userId} not found!` });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);

    if (!user) return res.status(404).json({ message: `User with id ${_id} not found!` });

    const { username, email, imageString, fullname, phoneNumber, bio } = req.body;
    const profilePict = req.file;

    if (profilePict && imageString) {
      return res.status(400).json({
        message: "Can't upload both file and string for image, choose one",
      });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.fullname = fullname || user.fullname;
    user.profilePict = imageString || user.profilePict;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.bio = bio || user.bio;

    if (profilePict) {
      if (user.profilePict) {
        await deleteFileFirebase(user.profilePict);
      }
      // @ts-ignore
      user.profilePict = profilePict.fileUrl;
    }

    const updatedUser = await user.save();

    res.json({
      message: "Successfully updated profile",
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        roles: updatedUser.roles,
        ...(updatedUser.fullname && { fullname: updatedUser.fullname }),
        ...(updatedUser.profilePict && { profilePict: updatedUser.profilePict }),
        isOauth: updatedUser.isOauth,
        lastLogin: updatedUser.lastLogin,
        ...(updatedUser.bio && { bio: updatedUser.bio }),
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
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
      return res.status(400).json({ message: "Oauth doesn't include password" });
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
    const user = await User.findById(_id);
    const userIdObjId = new Types.ObjectId(userId);

    const isFollowed = user?.social.following.includes(userIdObjId);

    if (!isFollowed) {
      await User.findByIdAndUpdate({ _id }, { $push: { "social.following": userIdObjId } });
      await User.findByIdAndUpdate({ _id: userIdObjId }, { $push: { "social.followers": _id } });
    } else {
      await User.findByIdAndUpdate({ _id }, { $pull: { "social.following": userIdObjId } });
      await User.findByIdAndUpdate({ _id: userIdObjId }, { $pull: { "social.followers": _id } });
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
    const { page = 1, limit = 20 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;
    const user = await User.findById(_id).populate({
      path: "social.following",
      select: "-password -social",
      options: { limit: limit, skip: skip },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const totalData = user.social.following.length || 0;
    const totalPages = Math.ceil(totalData / limit);

    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks("/users/following", page, totalPages, limit);
    const response = multiResponse(user.social.following, pagination, links);

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
    const user = await User.findById(_id).populate({
      path: "social.followers",
      select: "-password -social",
      options: { limit: limit, skip: skip },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const totalData = user.social.followers.length || 0;
    const totalPages = Math.ceil(totalData / limit);

    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks("/users/followers", page, totalPages, limit);
    const response = multiResponse(user.social.followers, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const searchUsers: RequestHandler = async (req, res) => {
  try {
    const { username, email, page = 1, limit = 10 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;
    let totalData: number = 0;
    let totalPages: number = 0;
    let users: IUser[] = [];

    if (username) {
      // todo: Pelajari lagi tentang $option dan $regex
      users = await User.find({ username: { $regex: username, $options: "i" } })
        .select("-password -social")
        .limit(limit)
        .skip(skip);
      totalData = await User.countDocuments({ username: { $regex: username, $options: "i" } });
      totalPages = Math.ceil(totalData / limit);
    } else if (email) {
      users = await User.find({ email: { $regex: email, $options: "i" } })
        .select("-password -social")
        .limit(limit)
        .skip(skip);
      totalData = await User.countDocuments({ email: { $regex: email, $options: "i" } });
      totalPages = Math.ceil(totalData / limit);
    }

    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks(
      `/users/search?${username ? username : email}`,
      page,
      totalPages,
      limit
    );
    const response = multiResponse(users, pagination, links, {
      searchType: username ? "username" : "email",
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
