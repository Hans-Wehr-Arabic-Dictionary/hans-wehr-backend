"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupRoot = exports.initDB = void 0;
const mongodb_1 = require("mongodb");
const logger_1 = require("./logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_USERNAME || !DB_PASSWORD) {
    logger_1.logger.error("Error: No DB Credentials");
}
const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@hans-wehr.ujhfadm.mongodb.net/`;
// Database Name
const dbName = "hans_wehr";
let db;
function initDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let client = yield mongodb_1.MongoClient.connect(url, { useNewUrlParser: true });
            db = client.db(dbName);
            logger_1.logger.debug("Successfully connected to MongoDB");
            return db;
        }
        catch (err) {
            console.error(err);
        } // catch any mongo error here
    });
}
exports.initDB = initDB;
function lookupRoot(root) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to the collection
        let collection = yield db.collection("definitions");
        // perform the lookup
        return collection.find({ root: root }).hint("rootsIndex");
    });
}
exports.lookupRoot = lookupRoot;
