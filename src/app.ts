import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";
import apiRoutes from "./modules/index.routes";
import helmet from "helmet";

const app: Application = express();

// Use middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));


// Routes
app.use("/api/v1", apiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
