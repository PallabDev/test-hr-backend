import "./config.js"
import app from "./app.js"
import connectDB from './db/index.js';
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Application Failed to Launch !!!", error)
        })
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server is running on port :", process.env.PORT)
        })
    })
    .catch((err) => {
        console.log("MongoDB Connection Function error ", err)
    })