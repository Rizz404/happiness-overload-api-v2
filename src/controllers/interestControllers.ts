import { RequestHandler } from "express";
import getErrorMessage from "../utils/getErrorMessage";
import Interest from "../models/Interest";
import { createPageLinks, createPagination, multiResponse } from "../utils/multiResponse";
import deleteFileFirebase from "../utils/deleteFileFirebase";
import { ReqQuery } from "../types/request";

export const createInterest: RequestHandler = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file;
    const newInterest = await Interest.createInterest({
      name,
      // @ts-ignore
      ...(image && { image: image.fileUrl }),
      ...(description && { description }),
    });

    res.status(201).json({ message: `Interest named ${newInterest.name} created` });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getInterests: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 20 }: ReqQuery = req.query;
    const skip = (page - 1) * limit;
    const totalData = await Interest.countDocuments();
    const totalPages = Math.ceil(totalData / limit);
    const interests = await Interest.find().limit(limit).skip(skip);

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
    const interest = await Interest.findById(interestId);

    if (!interest) return res.status(404).json({ message: "Interest not found" });

    res.json(interest);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateInterest: RequestHandler = async (req, res) => {
  try {
    const { interestId } = req.params;
    const { name, description } = req.body;
    const image = req.file;
    const interest = await Interest.findById(interestId);

    if (!interest) return res.status(404).json({ message: "Interest not found" });

    interest.name = name || interest.name;
    interest.description = description || interest.description;
    if (image) {
      if (interest.image) {
        await deleteFileFirebase(interest.image);
      }
      // @ts-ignore
      interest.image = image.fileUrl || interest.image;
    }

    const updatedInterest = await interest.save();

    res.json(updatedInterest);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
