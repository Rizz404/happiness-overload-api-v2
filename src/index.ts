import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import authRoutes from "./routes/authRoutes";
import logger from "./middleware/logger";
import corsOptions from "./middleware/corsConfig";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import tagRoutes from "./routes/tagRoutes";
import credentials from "./middleware/credentials";
import path from "path";
import getErrorMessage from "./utils/getErrorMessage";
import allowedOrigins from "./config/allowedOrigins";
import connectDb from "./config/dbConfig";

const app = express();
const PORT = process.env.PORT || 5000;

// * Middleware configuration
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true, optionsSuccessStatus: 200 }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // ! buat image harus begini
// app.use(morgan("dev")); // ! netlify itu readonly jadi gabisa add log otomatis
// app.use(morgan("combined", { stream: logger }));
app.use("/assets", express.static(path.join(__dirname, "./public/assets")));

// * Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/tags", tagRoutes);

// * Add a simple view for root
app.get("/", async (req, res) => {
  try {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("Its working");
    res.end();
  } catch (error) {
    getErrorMessage(error);
  }
});

// * Server configuration
app.listen(PORT, async () => {
  try {
    await connectDb();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    getErrorMessage(error);
  }
});

export default app;
