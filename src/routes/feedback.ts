import express from "express";
import { logger } from "../utils/logger";

export const router = express.Router();

router.get("/", (_req, res) => {
  logger.info("Testing feedback route");
  logger.warn("This is a warning (I'm testing the logger right now)");
  logger.error("This is an error");
  res.send("initial code for the feedback route");
})

export const feedbackHandler = router;
