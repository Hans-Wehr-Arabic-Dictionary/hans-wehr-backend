import express, { Request, Response } from "express";
import { logger } from "../utils/logger";
import { insertFeedback } from "../utils/db";

export const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  const body = req.body
  if(!("root" in body)) {
    logger.info("Recieved bad feedback request");
    res.status(400).send("Sorry, there is no root field");
  } else if(!("message" in body)) {
    logger.info("Recieved bad feedback request");
    res.status(400).send("Sorry, there is no message field");
  } else {
    logger.info("Recieved feedback request", body["message"]);
    insertFeedback(body);
    res.send("Thank you for your feedback, it has been processed");
  }
})

export const feedbackHandler = router;
