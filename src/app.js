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

// Optional: serve only /assets directly
app.use("/assets", express.static(path.join(__dirname, "..", "public", "assets")));


import userRouter from "./routes/user.routes.js"
app.use("/api/v1/user/", userRouter);

import candidateRouter from "./routes/cadidate.routes.js"
app.use("/api/v1/candidate/", candidateRouter);
app.get("/uptime", (_, res) => {
    res.status(200).json({ status: "Up and Running" })
})

export default app;