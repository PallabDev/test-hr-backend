import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Serve static files (including temp CDN files)
app.use(express.static(path.join(__dirname, "public")));

// API routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/user", userRouter);

// Catch-all for React Router (only for non-API & non-static file requests)
// Using regex to avoid Express v5 wildcard error
app.get(/^(?!\/api\/).*/, (req, res, next) => {
    // Skip requests for actual files (has extension) or /temp folder
    if (req.path.startsWith("/temp") || path.extname(req.path)) {
        return next();
    }
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;
