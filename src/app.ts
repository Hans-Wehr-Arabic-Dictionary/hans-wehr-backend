import express from "express";
import https from "https";
import fs from "fs";
import http from "http";
import { logger } from "./utils/logger";
import { initDB } from "./utils/db";
import { rootHandler } from "./routes/root";
import { nounHandler }  from "./routes/noun";

const app = express();

const PORT = process.env.PORT || 8080,
  LOCAL = process.env.LOCAL || 0;

const swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");

var bodyParser = require("body-parser");

// Routes

const options = {
  definition: {
    swagger: "2.0",
    info: {
      title: "Hans Wehr DB API",
      version: "0.1.0",
      description:
        "This is an API used to query the Hans Wehr dictionary database.",
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

logger.log("info", "API Initialized");

const specs = swaggerJsdoc(options);

var cors = require("cors");
const { NOTFOUND } = require("dns");
app.use(
  cors({
    origin: "*",
    allowedHeaders: "*",
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use((req, res, next) => {
  console.log("Time:", Date.now());
  next();
});

app.get("/", (request, response) => {
  logger.log("info", "Received GET Request to / endpoint");
  response.send("مرحبا");
});

app.use(bodyParser.json());

app.use("/root", rootHandler);
app.use("/noun", nounHandler);

initDB()
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
  } else {
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(
      {
        key: fs.readFileSync(
          "/etc/letsencrypt/live/api.hanswehr.com/privkey.pem"
        ),
        cert: fs.readFileSync(
          "/etc/letsencrypt/live/api.hanswehr.com/fullchain.pem"
        ),
      },
      app
    );

    httpServer.listen(80, () => {
      console.log("HTTP Server running on port 80");
    });

    httpsServer.listen(443, () => {
      console.log("HTTPS Server running on port 443");
    });
  }
}
