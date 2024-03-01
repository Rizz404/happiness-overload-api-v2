import { RequestHandler } from "express";
import allowedOrigins from "../config/allowedOrigins";

const credentials: RequestHandler = (req, res, next) => {
  const { origin } = req.headers;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  }
  next();
};

export default credentials;
