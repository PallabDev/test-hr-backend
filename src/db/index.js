import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async () => {
    try {
        let mongodbConnection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(mongodbConnection.connection.host)
    }
    catch (error) {
        console.error("Mongodb connection error ", error);
        process.exit(1)
    }
}
export default connectDB;