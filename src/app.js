import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the public folder
app.use(express.static(path.join(__dirname, "..", "public")));

// Optional: serve only /temp directly
app.use("/temp", express.static(path.join(__dirname, "..", "public", "temp")));


import userRouter from "./routes/user.routes.js"
app.use("/api/v1/user/", userRouter);

export default app;