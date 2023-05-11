"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_loggly_bulk_1 = require("winston-loggly-bulk");
exports.logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [],
});
if (process.env.LOCAL === "1") {
    exports.logger.add(new winston_1.default.transports.Console({
        level: "debug",
        format: winston_1.default.format.simple(),
    }));
}
if (true) {
    exports.logger.add(new winston_loggly_bulk_1.Loggly({
        token: "2d22dcaa-4f11-4398-a2a3-2cf8c5fdb5a5",
        subdomain: "hanswehr",
        tags: ["Winston-NodeJS"],
        json: true,
    }));
}
