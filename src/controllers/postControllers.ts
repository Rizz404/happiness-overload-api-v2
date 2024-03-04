import { RequestHandler } from "express";
import Post from "../models/Post";
import User from "../models/User";
import Tag from "../models/Tag";
import mongoose from "mongoose";
import deleteFile from "../utils/express/deleteFile";
import Comment from "../models/Comment";
import getErrorMessage from "../utils/express/getErrorMessage";
import { createPageLinks, createPagination, multiResponse } from "../utils/express/multiResponse";
import Interest from "../models/Interest";
import { ReqQuery } from "../types/request";
import { IUser } from "../types/User";
import { IPost } from "../types/Post";

interface PostPayload {
  title: string;
  interest: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  imagesString: string[];
  description: string;
}

type SortOption = { [key: string]: -1 | 1 };

export const createPost: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { title, interest, tags, description, imagesString }: PostPayload = req.body;
    const images = req.files;

    // * Jika memasukkan dua-duanya dari string dan dari file maka error
    if (images && imagesString) {
      return res.status(400).json({
        message: "Can't upload both file and string for image, choose one!",
      });
    }

    const newPost = await Post.createPost({
      user: _id,
      title,
      interest,
      tags,
      // @ts-ignore
      ...(images && { images: images.map((image) => image.fileUrl) }),
      ...(imagesString && { images: imagesString.map((image) => image) }),
      ...(description && { description }),
    });

    // * Gaperlu async await karena udah di handle promise all
    const tagPromises = tags.map((_id) => {
      return Tag.findByIdAndUpdate({ _id }, { $push: { posts: newPost._id } });
    });

    await Interest.findByIdAndUpdate({ _id: interest }, {});
    await Promise.all(tagPromises);

    res.status(201).json({ message: "Successfully created post", data: newPost });
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
      .sort(currentSortOption)
      .limit(Number(limit))
      .skip(skip)
      .populate("interest", "name image")
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
      .populate("interest", "name image")
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
      .populate("interest", "name image")
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

    const totalData = post.cheers.length;
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
      .populate("interest", "name image")
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
      .populate("interest", "name image")
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

    if (!upvotedPost) return res.status(400).json({ message: "Something went wrong with upvotes" });

    res.json({
      message: !isUpvote
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

    if (!downvotedPost) {
      return res.status(400).json({ message: "Something went wrong with downvotes" });
    }

    res.json({
      message: !isDownvote
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
      .populate("interest", "name image")
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
    const { _id, roles } = req.user;
    const { postId } = req.params;
    let post: IPost | null;

    if (roles === "Admin") {
      post = await Post.findOneAndDelete({ _id: postId });
    } else {
      post = await Post.findOneAndDelete({ _id: postId, user: _id });
    }

    if (!post) return res.status(400).json({ message: "Post not found or not deleted" });

    if (post.images && post.images.length > 0) {
      post.images.forEach(
        async (image) =>
          image.match(/https:\/\/firebasestorage.googleapis.com\/v0\/b\/[^\/]+\/o\/([^?]+)/) &&
          (await deleteFile("images", image))
      );
    }

    // ! nanti benerin soalnya belum ada error untuk post yang tidak bisa dihapus

    await Comment.deleteMany({ postId });
    await User.updateMany(
      { "social.savedPosts": postId },
      { $pull: { "social.savedPosts": postId } }
    );
    await Tag.updateMany({ posts: postId }, { $pull: { posts: postId } });

    res.json({ message: `Successfully deleted post with ID: ${postId}` });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
