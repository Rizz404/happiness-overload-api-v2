import { RequestHandler } from "express";
import Post from "../models/Post";
import User from "../models/User";
import Tag from "../models/Tag";
import { Types } from "mongoose";
import deleteFile from "../utils/deleteFile";
import Comment from "../models/Comment";
import getErrorMessage from "../utils/getErrorMessage";
import { createPageLinks, createPagination, multiResponse } from "../utils/multiResponse";

export const createPost: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { title, tags, description }: { title: string; tags: string[]; description: string } =
      req.body;
    const images = req.files;
    const newPost = new Post({
      userId: _id,
      title,
      tags,
      // @ts-ignore
      ...(images && images.length !== 0 && { images: images.map((image) => image.fileUrl) }),
      ...(description && { description }),
    });
    const savedPost = await newPost.save();

    tags.forEach(async (_id) => {
      await Tag.findByIdAndUpdate(
        { _id },
        { $push: { posts: savedPost._id }, $inc: { postsCount: 1 } }
      );
    });

    res.json(savedPost);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getPosts: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = 20, category = "home", userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let posts;
    let totalData: number;
    let totalPages: number;

    switch (category) {
      case "home":
        // * Ambil semua posts untuk halaman home
        posts = await Post.find()
          .select("-upvotes.user -downvotes.user")
          .limit(Number(limit))
          .skip(skip)
          .populate("userId", "username email profilePict")
          .populate("tags", "name");
        totalData = await Post.countDocuments();
        totalPages = Math.ceil(totalData / Number(limit));
        break;
      case "top":
        // * Ambil posts dengan upvotes terbanyak
        posts = await Post.find()
          .select("-upvotes.user -downvotes.user")
          .sort({ "upvotes.count": -1 })
          .limit(Number(limit))
          .skip(skip)
          .populate("userId", "username email profilePict")
          .populate("tags", "name");
        totalData = await Post.countDocuments();
        totalPages = Math.ceil(totalData / Number(limit));
        break;
      case "trending":
        // * Ambil posts berdasarkan kriteria trending, posts dengan komentar terbanyak
        posts = await Post.find()
          .select("-upvotes.user -downvotes.user")
          .sort({ commentsCount: -1 })
          .limit(Number(limit))
          .skip(skip)
          .populate("userId", "username email profilePict")
          .populate("tags", "name");
        totalData = await Post.countDocuments();
        totalPages = Math.ceil(totalData / Number(limit));
        break;
      case "fresh":
        // * Ambil posts terbaru
        posts = await Post.find()
          .select("-upvotes.user -downvotes.user")
          .sort({ createdAt: -1 })
          .limit(Number(limit))
          .skip(skip)
          .populate("userId", "username email profilePict")
          .populate("tags", "name");
        totalData = await Post.countDocuments();
        totalPages = Math.ceil(totalData / Number(limit));
        break;
      case "user":
        // * Ambil posts dari user tertentu
        posts = await Post.find({ userId })
          .select("-upvotes.user -downvotes.user")
          .limit(Number(limit))
          .skip(skip)
          .populate("userId", "username email profilePict")
          .populate("tags", "name");
        totalData = await Post.countDocuments({ userId });
        totalPages = Math.ceil(totalData / Number(limit));
        break;
      default:
        // * Ambil semua posts untuk halaman home
        posts = await Post.find()
          .select("-upvotes.user -downvotes.user")
          .limit(Number(limit))
          .skip(skip)
          .populate("userId", "username email profilePict")
          .populate("tags", "name");
        totalData = await Post.countDocuments();
        totalPages = Math.ceil(totalData / Number(limit));
    }

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
      .populate("userId", "username email profilePict")
      .populate("tags", "name");
    const totalData = savedPost?.length || 0;
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
      .populate("userId", "username email profilePict")
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

export const getPost: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate("userId", "username email profilePict")
      .populate("tags", "name");

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
      .populate("userId", "username email profilePict")
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

    const isUpvote = post?.upvotes.user.includes(_id);
    const isDownvote = post?.downvotes.user.includes(_id);
    let upvotedPost;

    if (!isUpvote) {
      upvotedPost = await Post.findByIdAndUpdate(
        { _id: postId },
        {
          $push: { "upvotes.user": _id },
          $inc: { "upvotes.count": 1 },
          ...(isDownvote && { $pull: { "downvotes.user": _id }, $inc: { "downvotes.count": -1 } }),
        }
      );
    } else {
      upvotedPost = await Post.findByIdAndUpdate(
        { _id: postId },
        { $pull: { "upvotes.user": _id }, $inc: { "upvotes.count": -1 } }
      );
    }

    if (!upvotePost || upvotedPost === null) return;

    upvotedPost.upvotes.count = upvotedPost.upvotes.user.length;
    upvotedPost.downvotes.count = upvotedPost.downvotes.user.length;

    await upvotedPost.save();

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

    const isDownvote = post?.downvotes.user.includes(_id);
    const isUpvote = post?.upvotes.user.includes(_id);
    let downvotedPost;

    if (!isDownvote) {
      downvotedPost = await Post.findByIdAndUpdate(
        { _id: postId },
        {
          $push: { "downvotes.user": _id },
          $inc: { "downvotes.count": 1 },
          ...(isUpvote && { $pull: { "upvotes.user": _id }, $inc: { "upvotes.count": -1 } }),
        }
      );
    } else {
      downvotedPost = await Post.findByIdAndUpdate(
        { _id: postId },
        { $pull: { "downvotes.user": _id }, $inc: { "downvotes.count": -1 } }
      );
    }

    if (!upvotePost || downvotedPost === null) return;

    downvotedPost.upvotes.count = downvotedPost.upvotes.user.length;
    downvotedPost.downvotes.count = downvotedPost.downvotes.user.length;

    await downvotedPost.save();

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
    const postIdObjId = new Types.ObjectId(postId);
    const user = await User.findById(_id);
    const isPostSaved = user?.social.savedPosts.includes(postIdObjId);
    let savedPost;

    if (!isPostSaved) {
      savedPost = await User.findByIdAndUpdate(
        { _id },
        { $push: { "social.savedPosts": postIdObjId } }
      );
    } else {
      savedPost = await User.findByIdAndUpdate(
        { _id },
        { $pull: { "social.savedPosts": postIdObjId } }
      );
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

export const searchPostsByTitle: RequestHandler = async (req, res) => {
  try {
    // * kalau post tidak ada lebih baik mengembalikan array kosong dari pada 404
    const { title, page = "1" } = req.query;
    const limit = 10;
    const skip = (Number(page) - 1) * limit;

    const posts =
      title?.toString().trim() !== "" &&
      (await Post.find({ title: { $regex: title, $options: "i" } })
        .limit(limit)
        .skip(skip)
        .populate("userId", "username email profilePict")
        .populate("tags", "name"));

    res.json(posts);
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
