import { MongoClient } from "mongodb";
import { logger } from "./logger";
import dotenv from "dotenv";
import { Db } from 'mongodb';


dotenv.config();

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_USERNAME || !DB_PASSWORD) {
  logger.error("Error: No DB Credentials");
  throw new Error("Error: No DB Credentials found. Check the .env file");

}

const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@hans-wehr.ujhfadm.mongodb.net/`;

// Database Name
const dbName = "hans_wehr";

let db: Db;

export async function initDB() {
  try {
    let client = await MongoClient.connect(url);
    db = client.db(dbName);
    logger.debug("Successfully connected to MongoDB");
    return db;
  } catch (err) {
    console.error(err);
  } // catch any mongo error here
}

export async function lookupRoot(root : string) {
  // connect to the collection
  let collection = await db.collection("definitions");

  // perform the lookup
  return collection.find({ root: root }).hint("rootsIndex");
}
