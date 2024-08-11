import { RequestHandler } from "express";
import Tag from "../models/Tag";
import getErrorMessage from "../utils/express/getErrorMessage";
import User from "../models/User";
import mongoose from "mongoose";
import { randomNumberBetween } from "../utils/helpers/somethingRandom";
import {
  createPageLinks,
  createPagination,
  multiResponse,
} from "../utils/express/multiResponse";
import { ITag } from "../types/models/Tag";

export const createTag: RequestHandler = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newTag = await Tag.createTag({
      name,
      ...(description && { description }),
    });

    res
      .status(201)
      .json({ message: `Tag ${newTag.name} has been created`, data: newTag });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getTags: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = 20, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let totalData = await Tag.countDocuments();
    let totalPages = Math.ceil(totalData / Number(limit));
    let tags: ITag[];

    switch (category) {
      case "featured-tags":
        tags = await Tag.find()
          .limit(Number(limit))
          .sort({ postCount: -1 })
          .select("-posts")
          .lean();
        break;
      case "all":
        tags = await Tag.find()
          .limit(Number(limit))
          .skip(skip)
          .select("-posts")
          .lean();
        break;

      default:
        tags = await Tag.find()
          .limit(Number(limit))
          .skip(skip)
          .select("-posts")
          .lean();
        break;
    }

    const pagination = createPagination(
      Number(page),
      Number(limit),
      totalPages,
      totalData
    );
    const links = createPageLinks(
      "/tags",
      Number(page),
      Number(totalPages),
      Number(limit)
    );
    const response = multiResponse(tags, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getTag: RequestHandler = async (req, res) => {
  try {
    const { tagId } = req.params;
    const tag = await Tag.findById(tagId);

    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getRandomTag: RequestHandler = async (req, res) => {
  try {
    const randomTag = await Tag.aggregate([{ $sample: { size: 1 } }]);
    const oneTag = randomTag[0];

    if (!oneTag._id)
      return res.status(404).json({ message: "Tag doesn't exist" });

    const tag = await Tag.findById(oneTag._id).select("-posts");

    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getRandomTags: RequestHandler = async (req, res) => {
  try {
    const randomTags = await Tag.aggregate([
      { $sample: { size: randomNumberBetween(1, 7) } },
    ]);

    if (!randomTags)
      return res.status(404).json({ message: "Tags don't exist" });

    const tags = await Promise.all(
      randomTags.map(async (tag) => {
        return await Tag.findById(tag._id).select("-posts");
      })
    );

    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const searchTagsByName: RequestHandler = async (req, res) => {
  try {
    const { name, page = "1", limit = "10" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const tags = await Tag.find({ name: { $regex: name, $options: "i" } })
      .select("-posts")
      .limit(Number(limit))
      .skip(skip)
      .lean();
    const totalData = await Tag.countDocuments({
      name: { $regex: name, $options: "i" },
    });
    const totalPages = Math.ceil(totalData / Number(limit));

    const pagination = createPagination(
      Number(page),
      Number(limit),
      totalPages,
      totalData
    );
    const links = createPageLinks(
      "/tags",
      Number(page),
      Number(totalPages),
      Number(limit)
    );
    const response = multiResponse(tags, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getPostsByTagName: RequestHandler = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const tag = await Tag.findOne({ name })
      .lean()
      .populate({
        path: "posts",
        options: { limit: Number(limit), skip: Number(skip) },
      });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    const totalData = tag?.posts.length;
    const totalPages = Math.ceil(totalData / Number(limit));

    res.json({
      data: tag.posts,
      pagination: {
        currentPage: page,
        dataPerPage: limit,
        totalPages,
        totalData,
        hasNextPage: Number(page) < totalPages,
      },
      links: {
        previous: Number(page) > 1 ? `/tags?page=${Number(page) - 1}` : null,
        next:
          Number(page) < totalPages ? `/tags?page=${Number(page) + 1}` : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateTag: RequestHandler = async (req, res) => {
  try {
    const { tagId } = req.params;
    const { name, interest, description } = req.body;
    const tag = await Tag.findById(tagId).select("-posts").lean();

    if (!tag) return res.status(404).json({ message: "Tag not found" });

    tag.name = name || tag.name;
    tag.interest = interest || tag.name;
    tag.description = description || tag.description;

    await tag.save();

    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const followTag: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { tagId }: { tagId?: mongoose.Types.ObjectId } = req.params;
    const user = await User.findById(_id).select("-posts");

    if (!tagId) return res.status(404).json({ message: "Tag not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isFollowed = user?.followedTags.includes(tagId);
    const isBlocked = user?.blockedTags.includes(tagId);

    if (!isFollowed && !isBlocked) {
      await User.findByIdAndUpdate(
        { _id },
        { $push: { followedTags: tagId } },
        { new: true }
      );
    } else if (isFollowed && !isBlocked) {
      await User.findByIdAndUpdate(
        { _id },
        { $pull: { followedTags: tagId } },
        { new: true }
      );
    } else if (!isFollowed && isBlocked) {
      await User.findByIdAndUpdate(
        { _id },
        { $pull: { blockedTags: tagId }, $push: { followedTags: tagId } },
        { new: true }
      );
    }

    res.json({
      message: !isFollowed
        ? `Successfully follow tag with Id ${tagId}`
        : `Successfully unfollow tag with Id ${tagId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const blockTag: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { tagId }: { tagId?: mongoose.Types.ObjectId } = req.params;
    const user = await User.findById(_id).select("-posts");

    if (!tagId) return res.status(404).json({ message: "Tag not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isBlocked = user?.blockedTags.includes(tagId);
    const isFollowed = user?.followedTags.includes(tagId);

    if (!isBlocked && !isFollowed) {
      await User.findByIdAndUpdate(
        { _id },
        { $push: { blockedTags: tagId } },
        { new: true }
      );
    } else if (isBlocked && !isFollowed) {
      await User.findByIdAndUpdate(
        { _id },
        { $pull: { blockedTags: tagId } },
        { new: true }
      );
    } else if (!isBlocked && isFollowed) {
      await User.findByIdAndUpdate(
        { _id },
        { $pull: { followedTags: tagId }, $push: { blockedTags: tagId } },
        { new: true }
      );
    }

    res.json({
      message: !isBlocked
        ? `Successfully block tag with Id ${tagId}`
        : `Successfully unblock tag with Id ${tagId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
