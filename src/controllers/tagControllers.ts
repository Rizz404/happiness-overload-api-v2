import { RequestHandler } from "express";
import Tag from "../models/Tag";
import getErrorMessage from "../utils/getErrorMessage";
import User from "../models/User";
import { Types } from "mongoose";
import { randomNumberBetween } from "../utils/somethingRandom";

export const createTag: RequestHandler = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: "Some field need to be filled" });

    const newTag = new Tag({
      name,
      ...(description && { description }),
    });
    const savedTag = await newTag.save();

    res.json({ message: `Tag ${savedTag.name} has been created` });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getTags: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = 20, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let totalData: number;
    let totalPages: number;
    let tags: any;

    switch (category) {
      case "featured-tag":
        tags = await Tag.find().limit(10).sort({ postsCount: -1 }).select("name");
        totalData = await Tag.countDocuments();
        totalPages = Math.ceil(totalData / Number(limit));
        break;
      case "all":
        tags = await Tag.find().limit(Number(limit)).skip(skip);
        totalData = await Tag.countDocuments();
        totalPages = Math.ceil(totalData / Number(limit));
        break;

      default:
        tags = await Tag.find().limit(Number(limit)).skip(skip);
        totalData = await Tag.countDocuments();
        totalPages = Math.ceil(totalData / Number(limit));
        break;
    }

    res.json({
      data: tags,
      pagination: {
        currentPage: page,
        dataPerPage: limit,
        totalPages,
        totalData,
        hasNextPage: Number(page) < totalPages,
      },
      links: {
        previous: Number(page) > 1 ? `/tags?page=${Number(page) - 1}` : null,
        next: Number(page) < totalPages ? `/tags?page=${Number(page) + 1}` : null,
      },
    });
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

    if (!oneTag._id) return res.status(404).json({ message: "Tag doesn't exist" });

    const tag = await Tag.findById(oneTag._id).select("-posts");

    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getRandomTags: RequestHandler = async (req, res) => {
  try {
    const randomTags = await Tag.aggregate([{ $sample: { size: randomNumberBetween(1, 7) } }]);

    if (!randomTags) return res.status(404).json({ message: "Tags don't exist" });

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
    const { name, page = "1" } = req.query;
    const limit = 10;
    const skip = (Number(page) - 1) * limit;
    const tag = await Tag.find({ name: { $regex: name, $options: "i" } })
      .limit(limit)
      .skip(skip)
      .select("name postsCount");

    if (tag.length === 0) {
      return res.status(404).json({ message: `No tag named ${name}` });
    }

    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getPostsByTagName: RequestHandler = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const tag = await Tag.findOne({ name }).populate({
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
        next: Number(page) < totalPages ? `/tags?page=${Number(page) + 1}` : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const followTag: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { tagId } = req.params;
    const tagIdObjId = new Types.ObjectId(tagId);
    const user = await User.findById(_id);
    const isFollowed = user?.social.followedTags.includes(tagIdObjId);
    const isBlocked = user?.social.blockedTags.includes(tagIdObjId);
    let followedTag;

    if (!isFollowed) {
      followedTag = await User.findByIdAndUpdate(
        { _id },
        {
          $push: { "social.followedTags": tagIdObjId },
          ...(isBlocked && { $pull: { "social.blockedTags": tagIdObjId } }),
        },
        { new: true }
      );
    } else {
      followedTag = await User.findByIdAndUpdate(
        { _id },
        {
          $pull: { "social.followedTags": tagIdObjId },
        },
        { new: true }
      );
    }

    res.json(followedTag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const blockTag: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { tagId } = req.params;
    const tagIdObjId = new Types.ObjectId(tagId);
    const user = await User.findById(_id);
    const isBlocked = user?.social.blockedTags.includes(tagIdObjId);
    const isFollowed = user?.social.followedTags.includes(tagIdObjId);
    let blockedTag;

    if (!isBlocked) {
      blockedTag = await User.findByIdAndUpdate(
        { _id },
        {
          $push: { "social.blockedTags": tagIdObjId },
          ...(isFollowed && { $pull: { "social.followedTags": tagIdObjId } }),
        },
        { new: true }
      );
    } else {
      blockedTag = await User.findByIdAndUpdate(
        { _id },
        {
          $pull: { "social.blockedTags": tagIdObjId },
        },
        { new: true }
      );
    }

    res.json(blockedTag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
