import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/user", userRouter);

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from ../public
app.use(express.static(path.join(__dirname, "..", "public")));

// Catch-all for React Router (non-API and non-static requests)
app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.path.startsWith("/temp") || path.extname(req.path)) {
        return next();
    }
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

export default app;
