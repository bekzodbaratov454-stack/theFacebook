import "dotenv/config";
import mongoose from "mongoose";


const MONGO_URL = process.env.MONGO_URL;

if(!MONGO_URL) {
    console.error("MONGO_URL not given");
    process.exit(1);
}
console.log(MONGO_URL)

export const connectDb = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        return "Connected to DB ☑️";
    }catch (error){
        console.log(error);
        console.log("DB connection error ❌");
    }
};

