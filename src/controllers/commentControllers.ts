import { RequestHandler } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import deleteFile from "../utils/deleteFile";
import getErrorMessage from "../utils/getErrorMessage";

export const createComment: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const { parentId, postId } = req.params;
    const { content } = req.body;
    const image = req.file;

    const newComment = new Comment({
      ...(parentId && { parentId }),
      userId: _id,
      postId,
      content,
      // @ts-ignore
      ...(image && { image: image.fileUrl }),
    });

    const savedComment = await newComment.save();

    await Post.findByIdAndUpdate({ _id: postId }, { $inc: { commentsCount: 1 } });
    await Comment.findByIdAndUpdate({ _id: parentId }, { $inc: { repliesCounts: 1 } });

    res.json(savedComment);
  } catch (error) {
    res.status(400).json({ messsage: getErrorMessage(error) });
  }
};

export const getPostComments: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const comments = await Comment.find({ postId })
      .limit(Number(limit))
      .skip(skip)
      .populate("userId", "username email profilePict");
    const totalData = await Comment.countDocuments({ postId });
    const totalPages = Math.ceil(totalData / Number(limit));

    res.json({
      data: comments,
      pagination: {
        currentPage: page,
        dataPerPage: limit,
        totalPages,
        totalData,
        hasNextPage: Number(page) < totalPages,
      },
      links: {
        previous:
          Number(page) > 1
            ? `/comments/post/${postId}?page=${Number(page) - 1}&limit=${limit}`
            : null,
        next:
          Number(page) < totalPages
            ? `/comments/post/${postId}?page=${Number(page) + 1}&limit=${limit}`
            : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getComment: RequestHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId).populate(
      "userId",
      "username email profilePict"
    );

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getReplies: RequestHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const comments = await Comment.find({ parentId: commentId })
      .limit(Number(limit))
      .skip(skip)
      .populate("userId", "username email profilePict");
    const totalData = await Comment.countDocuments({ parentId: commentId });
    const totalPages = Math.ceil(totalData / Number(limit));

    res.json({
      data: comments,
      pagination: {
        currentPage: page,
        dataPerPage: limit,
        totalPages,
        totalData,
        hasNextPage: Number(page) < totalPages,
      },
      links: {
        previous:
          Number(page) > 1
            ? `/comments/replies/${commentId}?page=${Number(page) - 1}&limit=${limit}`
            : null,
        next:
          Number(page) < totalPages
            ? `/comments/replies/${commentId}?page=${Number(page) + 1}&limit=${limit}`
            : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getRandomComment: RequestHandler = async (req, res) => {
  try {
    const randomComment = await Comment.aggregate([{ $sample: { size: 1 } }]);
    const oneComment = randomComment[0];
    const comment = await Comment.findById(oneComment._id).populate(
      "userId",
      "username email profilePict"
    );

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateComment: RequestHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const image = req.file;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.content = content || comment.content;
    if (image) {
      if (comment.image) {
        await deleteFile("images", comment.image);
      }
      comment.image = image.filename;
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

    comment.image && (await deleteFile("image", comment.image));

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

    const isUpvote = comment?.upvotes.user.includes(_id);
    const isDownvote = comment?.downvotes.user.includes(_id);
    let upvotedComment;

    if (!isUpvote) {
      upvotedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        {
          $push: { "upvotes.user": _id },
          $inc: { "upvotes.count": 1 },
          ...(isDownvote && { $pull: { "downvotes.user": _id }, $inc: { "downvotes.count": -1 } }),
        }
      );
    } else {
      upvotedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $pull: { "upvotes.user": _id }, $inc: { "upvotes.count": -1 } }
      );
    }

    if (!upvotedComment || upvotedComment === null) return;

    upvotedComment.upvotes.count = upvotedComment.upvotes.user.length;
    upvotedComment.downvotes.count = upvotedComment.downvotes.user.length;

    await upvotedComment.save();

    res.json({
      message: !isUpvote
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

    const isDownvote = comment?.downvotes.user.includes(_id);
    const isUpvote = comment?.upvotes.user.includes(_id);
    let downvotedComment;

    if (!isDownvote) {
      downvotedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        {
          $push: { "downvotes.user": _id },
          $inc: { "downvotes.count": 1 },
          ...(isUpvote && { $pull: { "upvotes.user": _id }, $inc: { "upvotes.count": -1 } }),
        }
      );
    } else {
      downvotedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $pull: { "downvotes.user": _id }, $inc: { "downvotes.count": -1 } }
      );
    }

    if (!downvotedComment || downvotedComment === null) return;

    downvotedComment.upvotes.count = downvotedComment.upvotes.user.length;
    downvotedComment.downvotes.count = downvotedComment.downvotes.user.length;

    await downvotedComment.save();

    res.json({
      message: !isDownvote
        ? `Successfully downvoted the comment with ID: ${commentId}`
        : `Successfully removed your downvote from the comment with ID: ${commentId}`,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
