import { ErrorRequestHandler } from "express";
import getErrorMessage from "../utils/express/getErrorMessage";

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error) {
    res.status(500).send(getErrorMessage(error));
  } else {
    next();
  }
};

export default errorHandler;
