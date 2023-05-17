import { MongoClient } from "mongodb";
import { logger } from "./logger";
import dotenv from "dotenv";
import { Db } from 'mongodb';
import { Feedback } from "../routes/feedback";


dotenv.config();

const LOCAL_DB = process.env.LOCAL_DB || 0;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@hans-wehr.ujhfadm.mongodb.net/`;

if (!DB_USERNAME || !DB_PASSWORD) {
  logger.error("Error: No DB Credentials");
  throw new Error("Error: No DB Credentials found. Check the .env file");
}

// Database Name
const dbName = LOCAL_DB ? "hans_wehr_dev" : "hans_wehr";
logger.info("using database " + dbName)


let db: Db;

export async function initDB() {
  try {
    let client = await MongoClient.connect(url);
    db = client.db(dbName);
    logger.info("Successfully connected to MongoDB");
    return db;
  } catch (err) {
    logger.error(err);
  } // catch any mongo error here
}

export async function lookupRoot(root: string) {
  // connect to the collection
  let collection = db.collection("definitions");

  // perform the lookup
  return collection.find({ root: root }).hint("rootsIndex");
}

export async function insertFeedback(feedback: Feedback) {
  let collection = db.collection("feedback");
  let name = null;
  let email = null;

  if ("name" in feedback) {
    name = feedback["name"];
  }

  if ("email" in feedback) {
    email = feedback["email"];
  }

  return collection.insertOne({ "name": feedback["name"], "email": email, "root": feedback["root"], "message": feedback["message"], "created" : new Date()})
}

export async function getRecentFeeedback() {
  let collection = db.collection("feedback");
  return collection.find().sort({created: -1}).toArray();
}


export async function getFeedbackByRoot(search: string) {
  console.log(search);
  let collection = db.collection("feedback");
  return collection.find({root: search}).sort({created: -1}).toArray();
}
