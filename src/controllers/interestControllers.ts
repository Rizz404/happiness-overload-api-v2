import { RequestHandler } from "express";
import getErrorMessage from "../utils/getErrorMessage";
import Interest from "../models/Interest";
import { createPageLinks, createPagination, multiResponse } from "../utils/multiResponse";
import deleteFileFirebase from "../utils/deleteFileFirebase";

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

    res.status(201).json({ message: `Interest named ${newInterest.name}` });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getInterests: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const totalData = await Interest.countDocuments();
    const totalPages = Math.ceil(totalData / Number(limit));
    const interests = await Interest.find().limit(Number(limit)).skip(skip);
    const pagination = createPagination(Number(page), Number(limit), totalPages, totalData);
    const links = createPageLinks("/interests", Number(page), totalPages, Number(limit));
    const response = multiResponse(interests, pagination, links);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getInterest: RequestHandler = async (req, res) => {
  try {
    const { interstId } = req.params;
    const interest = await Interest.findById(interstId);

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
