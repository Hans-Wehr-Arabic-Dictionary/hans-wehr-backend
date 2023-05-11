"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const logger_1 = require("./utils/logger");
const db_1 = require("./utils/db");
const root_1 = require("./routes/root");
const noun_1 = require("./routes/noun");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080, LOCAL = process.env.LOCAL || 0;
const swaggerJsdoc = require("swagger-jsdoc"), swaggerUi = require("swagger-ui-express");
var bodyParser = require("body-parser");
// Routes
const options = {
    definition: {
        swagger: "2.0",
        info: {
            title: "Hans Wehr DB API",
            version: "0.1.0",
            description: "This is an API used to query the Hans Wehr dictionary database.",
            contact: {
                name: "Manaf Asif",
                url: "https://manaf.info",
                email: "manaf.asif12@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:8080",
            },
        ],
    },
    apis: ["./routes/*.js"],
};
logger_1.logger.log("info", "API Initialized");
const specs = swaggerJsdoc(options);
var cors = require("cors");
const { NOTFOUND } = require("dns");
app.use(cors({
    origin: "*",
    allowedHeaders: "*",
}));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use((req, res, next) => {
    console.log("Time:", Date.now());
    next();
});
app.get("/", (request, response) => {
    logger_1.logger.log("info", "Received GET Request to / endpoint");
    response.send("مرحبا");
});
app.use(bodyParser.json());
app.use("/root", root_1.rootHandler);
app.use("/noun", noun_1.nounHandler);
(0, db_1.initDB)()
    .then((database) => {
    startListening();
})
    .catch((err) => {
    console.error("Error connecting to the database:", err);
});
function startListening() {
    if (LOCAL) {
        app.listen(PORT, () => {
            console.log(`API listening port ${PORT}...`);
        });
    }
    else {
        const httpServer = http_1.default.createServer(app);
        const httpsServer = https_1.default.createServer({
            key: fs_1.default.readFileSync("/etc/letsencrypt/live/api.hanswehr.com/privkey.pem"),
            cert: fs_1.default.readFileSync("/etc/letsencrypt/live/api.hanswehr.com/fullchain.pem"),
        }, app);
        httpServer.listen(80, () => {
            console.log("HTTP Server running on port 80");
        });
        httpsServer.listen(443, () => {
            console.log("HTTPS Server running on port 443");
        });
    }
}
