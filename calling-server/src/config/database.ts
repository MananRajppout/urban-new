import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log("Database name is ", conn.connection.db?.databaseName);
    // const collections = await conn.connection.db?.listCollections().toArray();
    // console.log(
    //   "collections",
    //   collections?.map((col) => col.name)
    // ); // Get collection names
  } catch (error) {

    
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`Unexpected error: ${error}`);
    }
    process.exit(1);
  }
};

export function getDb() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected");
  }
  return db;
}

export default connectDB;
