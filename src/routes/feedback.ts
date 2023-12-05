import express, { Request, Response } from "express";
import { logger } from "../utils/logger";
import { getFeedbackByRoot, getRecentFeeedback, insertFeedback } from "../utils/db";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

logger.info(EMAIL_USERNAME)
logger.info(EMAIL_PASSWORD)

if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
  logger.error("database: Error: No EMAIL Credentials");
  throw new Error("Error: No Email Credentials found. Check the .env file");
}
const EMAIL_LIST = ["manaf.asif12@gmail.com"];

export interface Feedback {
  type: string;
  name: string | undefined;
  email: string | undefined;
  root: string;
  message: string | undefined;
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USERNAME, // Replace with your Gmail email
    pass: EMAIL_PASSWORD, // Replace with your Gmail password or an app-specific password
  },
});

export const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const body: Feedback = req.body
  if (!("root" in body)) {
    logger.info("Recieved bad feedback request");
    res.status(400).send("Sorry, there is no root field");
  } else if (!("message" in body)) {
    logger.info("Recieved bad feedback request");
    res.status(400).send("Sorry, there is no message field");
  } else if (!("type" in body)) {
    logger.info("Recieved bad feedback request");
    res.status(400).send("Sorry, there is no message field");
  }
  else {
    logger.info("Recieved feedback request", body["message"]);
    await insertFeedback(body);

    const subject = "Feedback Report";
    const text = `New Feedback:\nType: ${body.type}\nName: ${body.name}\nEmail: ${body.email}\nRoot: ${body.root}\nMessage: ${body.message}`;

    const mailOptions = {
      from: EMAIL_USERNAME, // Replace with your Gmail email
      to: EMAIL_LIST.join(", "),
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    res.send("Thank you for your feedback, it has been processed");
  }
})

// get's 10 most recent feedback requests
router.get("/recent", async (_req: Request, res: Response) => {
  let feedback = await getRecentFeeedback()
  res.send(feedback)
})

router.get("/root/:root", async (req: Request, res: Response) => {
  let feedback = await getFeedbackByRoot(req.params["root"])
  console.log("feedback");
  logger.info(feedback);
  res.send(feedback)
})

export const feedbackHandler = router;
