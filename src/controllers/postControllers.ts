import { RequestHandler } from "express";
import Post, { IPost } from "../models/Post";
import User, { IUser } from "../models/User";
import Tag from "../models/Tag";
import mongoose from "mongoose";
import deleteFile from "../utils/deleteFile";
import Comment from "../models/Comment";
import getErrorMessage from "../utils/getErrorMessage";
import { createPageLinks, createPagination, multiResponse } from "../utils/multiResponse";
import Interest from "../models/Interest";
import { ReqQuery } from "../types/request";

interface PostPayload {
  title: string;
  interest: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  description: string;
}

type SortOption = { [key: string]: -1 | 1 };

export const createPost: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { title, interest, tags, description }: PostPayload = req.body;
    const images = req.files;
    const newPost = await Post.createPost({
      user: _id,
      title,
      interest,
      tags,
      // @ts-ignore
      ...(images && { images: images.map((image) => image.fileUrl) }),
      ...(description && { description }),
    });

    // * Gaperlu async await karena udah di handle promise all
    const tagPromises = tags.map((_id) => {
      return Tag.findByIdAndUpdate({ _id }, { $push: { posts: newPost._id } });
    });

    await Interest.findByIdAndUpdate({ _id: interest }, {});
    await Promise.all(tagPromises);

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getPosts: RequestHandler = async (req, res) => {
  try {
    let blockedTags: mongoose.Types.ObjectId[] = [];
    let user: IUser;

    if (req.user && req.user._id) {
      user = await User.findById(req.user._id).select("-blockedTags");
      blockedTags = user.social.blockedTags;
    }

    const { page = 1, limit = 20, category = "home", userId }: ReqQuery = req.query;
    const skip = (page - 1) * limit;

    const findOptions = {
      ...(category === "user" ? { user: userId } : {}),
      ...(req.user && req.user._id && { tags: { $nin: blockedTags } }),
    };
    const sortOptions: { [key: string]: SortOption } = {
      top: { upvotesCount: -1 },
      trending: { commentsCount: -1 },
      fresh: { createdAt: -1 },
    };

    const currentSortOption: SortOption = sortOptions[category] || {};

    const posts: IPost[] = await Post.find(findOptions)
      .select("-upvotes -downvotes -cheers")
      .sort(currentSortOption)
      .limit(Number(limit))
      .skip(skip)
      .populate("user", "username email profilePict")
      .populate("tags", "name");

    const totalData = await Post.countDocuments(findOptions);
    const totalPages = Math.ceil(totalData / Number(limit));

    const categoryAvailable = "home, top, trending, fresh, user";
    const pagination = createPagination(Number(page), Number(limit), totalPages, totalData);
    const links = createPageLinks(
      "/posts",
      Number(page),
      totalPages,
      Number(limit),
      String(category)
    );
    const response = multiResponse(posts, pagination, links, String(category), categoryAvailable);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getSavedPosts: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { page = "1", limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const user = await User.findById(_id);
    const savedPost = user?.social.savedPosts;

    const posts = await Post.find({ _id: { $in: savedPost } })
      .limit(Number(limit))
      .skip(skip)
      .populate("user", "username email profilePict")
      .populate("tags", "name");
    const totalData = await Post.countDocuments({ _id: { $in: savedPost } });
    const totalPages = Math.ceil(totalData / Number(limit));

    const pagination = createPagination(Number(page), Number(limit), totalPages, totalData);
    const links = createPageLinks("/posts/saved", Number(page), totalPages, Number(limit));
    const response = multiResponse(posts, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getSelfPosts: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { page = "1", limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find({ userId: _id })
      .limit(Number(limit))
      .skip(skip)
      .populate("user", "username email profilePict")
      .populate("tags", "name");
    const totalData = await Post.countDocuments();
    const totalPages = Math.ceil(totalData / Number(limit));

    const pagination = createPagination(Number(page), Number(limit), totalPages, totalData);
    const links = createPageLinks("/posts/self", Number(page), totalPages, Number(limit));
    const response = multiResponse(posts, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getUsersCheeredPost: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const post = await Post.findById(postId)
      .select("cheers cheersCount")
      .populate({
        path: "cheers",
        select: "username email profilePict",
        options: { limit: Number(limit), skip },
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const totalData = post.cheersCount;
    const totalPages = Math.ceil(totalData / Number(limit));

    const pagination = createPagination(Number(page), Number(limit), totalPages, totalData);
    const links = createPageLinks(
      `/posts/cheers/${postId}`,
      Number(page),
      totalPages,
      Number(limit)
    );
    const response = multiResponse(post.cheers, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getPost: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate("user", "username email profilePict")
      .populate("tags", "name");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getRandomPost: RequestHandler = async (req, res) => {
  try {
    const randomPost = await Post.aggregate([{ $sample: { size: 1 } }]);
    const onePost = randomPost[0];

    if (!onePost._id) return res.status(404).json({ message: "Post doesn't exist" });

    const populatedPost = await Post.findById(onePost._id)
      .populate("user", "username email profilePict")
      .populate("tags", "name");

    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const upvotePost: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isUpvote = post?.upvotes.includes(_id);
    const isDownvote = post?.downvotes.includes(_id);
    let upvotedPost;

    if (!isUpvote) {
      upvotedPost = await Post.findByIdAndUpdate(
        { _id: postId },
        {
          $push: { upvotes: _id },
          ...(isDownvote && { $pull: { downvotes: _id } }),
        }
      );
    } else {
      upvotedPost = await Post.findByIdAndUpdate({ _id: postId }, { $pull: { upvotes: _id } });
    }

    if (!upvotedPost) return res.status(400).json({ message: "Upvote post doesn't work" });

    upvotedPost.upvotesCount = upvotedPost.upvotes.length;
    upvotedPost.downvotesCount = upvotedPost.downvotes.length;

    await upvotedPost.save();

    res.json({
      message: isUpvote
        ? `Successfully upvoted the post with ID: ${postId}`
        : `Successfully removed your upvote from the post with ID: ${postId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const downvotePost: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isDownvote = post?.downvotes.includes(_id);
    const isUpvote = post?.upvotes.includes(_id);
    let downvotedPost;

    if (!isDownvote) {
      downvotedPost = await Post.findByIdAndUpdate(
        { _id: postId },
        {
          $push: { downvotes: _id },
          ...(isUpvote && { $pull: { upvotes: _id } }),
        }
      );
    } else {
      downvotedPost = await Post.findByIdAndUpdate({ _id: postId }, { $pull: { downvotes: _id } });
    }

    if (!downvotedPost) return res.status(400).json({ message: "Upvote post doesn't work" });

    downvotedPost.upvotesCount = downvotedPost.upvotes.length;
    downvotedPost.downvotesCount = downvotedPost.downvotes.length;

    await downvotedPost.save();

    res.json({
      message: isDownvote
        ? `Successfully downvoted the post with ID: ${postId}`
        : `Successfully removed your downvote from the post with ID: ${postId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const savePost: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { _id } = req.user;
    const postIdObjId = new mongoose.Types.ObjectId(postId);
    const user = await User.findById(_id);
    const isPostSaved = user?.social.savedPosts.includes(postIdObjId);

    if (!isPostSaved) {
      await User.findByIdAndUpdate({ _id }, { $push: { "social.savedPosts": postIdObjId } });
    } else {
      await User.findByIdAndUpdate({ _id }, { $pull: { "social.savedPosts": postIdObjId } });
    }

    res.json({
      message: !isPostSaved
        ? `Successfully saved post with Id ${postId}`
        : `Successfully unsaved post with Id ${postId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const cheersPost: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { _id } = req.user;
    const post = await Post.findByIdAndUpdate(
      { _id: postId, cheers: { $nin: _id } },
      { $push: { cheers: _id } },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: "Post not found or already cheered" });

    post.cheersCount = post.cheers.length;

    await post.save();

    res.json({ message: `Successfully cheered the post with ID: ${postId}` });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const searchPostsByTitle: RequestHandler = async (req, res) => {
  try {
    // * kalau post tidak ada lebih baik mengembalikan array kosong dari pada 404
    const { title, page = "1", limit = "10" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find({ title: { $regex: title, $options: "i" } })
      .limit(Number(limit))
      .skip(skip)
      .populate("user", "username email profilePict")
      .populate("tags", "name");
    const totalData = await Post.countDocuments({ title: { $regex: title, $options: "i" } });
    const totalPages = Math.ceil(totalData / Number(limit));

    const pagination = createPagination(Number(page), Number(limit), totalPages, totalData);
    const links = createPageLinks("/posts/saved", Number(page), totalPages, Number(limit));
    const response = multiResponse(posts, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const deletePost: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { postId } = req.params;
    const post = await Post.findOneAndDelete({ _id: postId, userId: _id });

    // * Sama kaya pake and seperti ini
    // const post = await Post.findOneAndDelete({ $and: [{ _id: postId }, { userId: _id }] });

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.images && post.images.length <= 0) {
      post.images.forEach(async (image) => await deleteFile("images", image));
    }

    await Comment.deleteMany({ postId });
    await User.updateMany(
      { "social.savedPosts": postId },
      { $pull: { "social.savedPosts": postId } }
    );
    await Tag.updateMany({ posts: postId }, { $pull: { posts: postId } });

    res.json({ message: `Successfully deleted post with ID: ${post._id}` });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
