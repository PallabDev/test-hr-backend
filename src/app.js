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
app.use(express.static("public"))

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
    // Skip if it's an API route
    if (req.path.startsWith("/api")) {
        return res.status(404).send("Not Found");
    }
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


import userRouter from "./routes/user.routes.js"
app.use("/api/v1/user/", userRouter);



export default app;