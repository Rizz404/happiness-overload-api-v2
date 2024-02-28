import { RequestHandler } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import getErrorMessage from "../utils/getErrorMessage";
import { createPageLinks, createPagination, multiResponse } from "../utils/multiResponse";
import { ReqQuery } from "../types/request";
import deleteFileFirebase from "../utils/deleteFileFirebase";
import { CommentParams } from "../types/comment";

export const createComment: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { postId }: CommentParams = req.params;
    const { content } = req.body;
    const image = req.file;

    if (!postId) return res.status(404).json({ message: "Post not found" });

    const newComment = await Comment.createComment({
      user: _id,
      postId,
      content,
      // @ts-ignore
      ...(image && { image: image.fileUrl }),
    });

    await Post.findByIdAndUpdate({ _id: postId }, { $inc: { commentsCount: 1 } });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ messsage: getErrorMessage(error) });
  }
};

export const createReply: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { commentId }: CommentParams = req.params;
    const { content } = req.body;
    const image = req.file;

    const comment = await Comment.findById(commentId).select("postId");

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const newComment = await Comment.createComment({
      ...(commentId && { parentId: commentId }),
      user: _id,
      postId: comment.postId,
      content,
      // @ts-ignore
      ...(image && { image: image.fileUrl }),
    });

    await Comment.findByIdAndUpdate({ _id: commentId }, { $inc: { repliesCounts: 1 } });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ messsage: getErrorMessage(error) });
  }
};

export const getPostComments: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;
    const comments = await Comment.find({ postId, parentId: { $exists: false } })
      .select("-upvotes -downvotes")
      .limit(limit)
      .skip(skip)
      .populate("user", "username email image");
    const totalData = await Comment.countDocuments({ postId });
    const totalPages = Math.ceil(totalData / limit);

    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks(`comments/post/${postId}`, page, totalPages, limit);
    const response = multiResponse(comments, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getComment: RequestHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId).populate("user", "username email image");

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getReplies: RequestHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 20 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;
    const comments = await Comment.find({ parentId: commentId })
      .limit(limit)
      .skip(skip)
      .populate("user", "username email image");
    const totalData = await Comment.countDocuments({ parentId: commentId });
    const totalPages = Math.ceil(totalData / limit);

    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks(`comments/replies/${commentId}`, page, totalPages, limit);
    const response = multiResponse(comments, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getRandomComment: RequestHandler = async (req, res) => {
  try {
    const randomComment = await Comment.aggregate([{ $sample: { size: 1 } }]);
    const oneComment = randomComment[0];
    const comment = await Comment.findById(oneComment._id).populate("user", "username email image");

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateComment: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { commentId } = req.params;
    const { content } = req.body;
    const image = req.file;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.user != _id) return res.status(403).json({ message: "Only its user can upadate" });

    comment.content = content || comment.content;
    comment.isEdited = true;
    if (image) {
      if (comment.image) {
        deleteFileFirebase(comment.image);
      }
      // @ts-ignore
      comment.image = image.fileUrl;
    }
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ messsage: getErrorMessage(error) });
  }
};

export const deleteComment: RequestHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.image && deleteFileFirebase(comment.image);

    await comment.deleteOne();
    await Comment.deleteMany({ parentId: commentId });
    await Post.findByIdAndUpdate({ _id: comment.postId }, { $inc: { commentsCount: -1 } });

    res.json({ message: "Successfully deleted comment" });
  } catch (error) {
    res.status(500).json({ messsage: getErrorMessage(error) });
  }
};

export const upvoteComment: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isUpvote = comment?.upvotes.includes(_id);
    const isDownvote = comment?.downvotes.includes(_id);
    let upvotedComment;

    if (!isUpvote) {
      upvotedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        {
          $push: { upvotes: _id },
          ...(isDownvote && { $pull: { downvotes: _id } }),
        }
      );
    } else {
      upvotedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $pull: { upvotes: _id } }
      );
    }

    if (!upvotedComment) return res.status(400).json({ message: "Upvote comment doesn't work" });

    upvotedComment.upvotesCount = upvotedComment.upvotes.length;
    upvotedComment.downvotesCount = upvotedComment.downvotes.length;

    await upvotedComment.save();

    res.json({
      message: isUpvote
        ? `Successfully upvoted the comment with ID: ${commentId}`
        : `Successfully removed your upvote from the comment with ID: ${commentId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const downvoteComment: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isDownvote = comment?.downvotes.includes(_id);
    const isUpvote = comment?.upvotes.includes(_id);
    let downvotedComment;

    if (!isDownvote) {
      downvotedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        {
          $push: { downvotes: _id },
          ...(isUpvote && { $pull: { upvotes: _id } }),
        }
      );
    } else {
      downvotedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $pull: { downvotes: _id } }
      );
    }

    if (!downvotedComment) {
      return res.status(400).json({ message: "Downvote comment doesn't work" });
    }

    downvotedComment.upvotesCount = downvotedComment.upvotes.length;
    downvotedComment.downvotesCount = downvotedComment.downvotes.length;

    await downvotedComment.save();

    res.json({
      message: isDownvote
        ? `Successfully downvoted the comment with ID: ${commentId}`
        : `Successfully removed your downvote from the comment with ID: ${commentId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
