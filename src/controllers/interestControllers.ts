import { RequestHandler } from "express";
import mongoose from "mongoose";
import getErrorMessage from "../utils/getErrorMessage";
import Interest from "../models/Interest";

const createInterest: RequestHandler = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file;
    const newInterest = new Interest({
      name,
      // @ts-ignore
      ...(image && { image: image.fileUrl }),
      ...(description && { description }),
    });
    const savedInterest = await newInterest.save();

    res.json({ message: `Interest named ${savedInterest.name}` });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
