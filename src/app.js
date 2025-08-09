import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import userRouter from "./routes/user.routes.js";

const app = express();

// To get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Public routes for HTML pages
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/apply", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API routes
app.use("/api/v1/user", userRouter);

export default app;
