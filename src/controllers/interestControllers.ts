import { RequestHandler } from "express";
import getErrorMessage from "../utils/express/getErrorMessage";
import Interest from "../models/Interest";
import {
  createPageLinks,
  createPagination,
  multiResponse,
} from "../utils/express/multiResponse";
import deleteFileFirebase from "../utils/express/deleteFileFirebase";
import { ReqQuery } from "../types/request";

export const createInterest: RequestHandler = async (req, res) => {
  try {
    const { name, description, imageString } = req.body;
    const image = req.file;

    if (image && imageString) {
      return res.status(400).json({
        message: "Can't upload both file and string for image, choose one",
      });
    }

    const newInterest = await Interest.createInterest({
      name,
      // @ts-ignore
      ...(image && { image: image.fileUrl }),
      ...(imageString && { image: imageString }),
      ...(description && { description }),
    });

    res.status(201).json({
      message: `Interest named ${newInterest.name} created`,
      data: newInterest,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getInterests: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 20 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;

    const interests = await Interest.find()
      .limit(limit)
      .skip(skip)
      .select("-posts -tags")
      .lean();
    const totalData = await Interest.countDocuments();

    const totalPages = Math.ceil(totalData / limit);
    const pagination = createPagination(page, limit, totalPages, totalData);
    const links = createPageLinks("/interests", page, totalPages, limit);
    const response = multiResponse(interests, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getInterest: RequestHandler = async (req, res) => {
  try {
    const { interestId } = req.params;
    const interest = await Interest.findById(interestId)
      .select("-posts -tags")
      .lean();

    if (!interest)
      return res.status(404).json({ message: "Interest not found" });

    res.json(interest);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getRandomInterest: RequestHandler = async (req, res) => {
  try {
    const randomInterest = await Interest.aggregate([{ $sample: { size: 1 } }]);
    const oneInterest = randomInterest[0];

    res.json(oneInterest);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateInterest: RequestHandler = async (req, res) => {
  try {
    const { interestId } = req.params;
    const { name, description, imageString } = req.body;
    const image = req.file;
    const interest = await Interest.findById(interestId)
      .select("-posts -tags")
      .lean();

    if (!interest)
      return res.status(404).json({ message: "Interest not found" });
    if (image && imageString) {
      return res.status(400).json({
        message: "Can't upload both file and string for image, choose one",
      });
    }

    interest.name = name || interest.name;
    interest.description = description || interest.description;
    interest.image = imageString || interest.image;
    if (image) {
      if (interest.image) {
        await deleteFileFirebase(interest.image);
      }
      // @ts-ignore
      interest.image = image.fileUrl || interest.image;
    }

    await interest.save();

    res.json({
      message: "Successfully updated interest",
      data: interest,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
