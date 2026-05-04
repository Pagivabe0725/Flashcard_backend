import dotenv from "dotenv";

/**
 * Loads MongoDB-related environment variables from a dedicated env file.
 *
 * Expected variables:
 * - MONGO_USER
 * - MONGO_PASS
 */
dotenv.config({ path: "./environment/mongodb.env" });

/**
 * MongoDB connection string used to initialize the database client.
 *
 * Note:
 * - Credentials are injected from environment variables.
 * - Ensure that MONGO_USER and MONGO_PASS are defined,
 *   otherwise the connection string will be invalid.
 */
export const MONGODB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.h7evm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;