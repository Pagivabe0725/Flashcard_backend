
import dotenv from "dotenv";

dotenv.config({ path: "./environment/mongodb.env" });

export const MONGODB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.h7evm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
