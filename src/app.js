import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import { client } from "./whatsappClient.js";

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


import jobRouter from "./routes/job.routes.js";
app.use("/api/v1/jobs/", jobRouter);


app.get("/uptime", (_, res) => {
    res.status(200).json({ status: "Up and Running" })
})

const API_TOKEN = 'OWpa89TVPT6VguEzc66mVlcXejKkO4Os8gIzBrjFD3PtMS0dYEpK7quFRDEsK8Zs';

app.post('/sendMessage', async (req, res) => {
    const { number, message, token } = req.body;

    // Validate the token
    if (token !== API_TOKEN) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Basic validation
    if (!number || !message) {
        return res.status(400).json({ status: 'error', message: 'Number and message are required.' });
    }

    // Ensure the number is in the correct format with country code (e.g., '911234567890@c.us')
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

    try {
        await client.sendMessage(chatId, message);
        res.status(200).json({ status: 'success', message: 'Message sent successfully' });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ status: 'error', message: 'Failed to send message', error: error.message });
    }
});


export default app;