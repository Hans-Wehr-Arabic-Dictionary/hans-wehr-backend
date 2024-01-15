import express, { Request, Response } from "express";
import { logger } from "../utils/logger";
import { lookupUsername, insertUser, User } from "../utils/db";
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// This is the router for the auth route
const router = express.Router();

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 5;

if (!SECRET_KEY) {
    throw new Error("Error: No JWT Secret Key found. Check the .env file");
}

// Define an interface for your JWT payload
interface MyJwtPayload extends JwtPayload {
    username: string;
    password: string;
}


// Registration endpoint
router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Missing username or password in request");
        return;
    }

    let existingUser = await lookupUsername(username);

    // console.log(`Existing user : ${existingUser}`);

    if (existingUser !== null) {
        res.status(200).send({ status: "Error" });
        return;
    }

    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Internal server error');
            return;
        }
        insertUser(username, hash, (err) => {
            res.status(500).send('Internal server error');
        }).then(() => {
            res.send({ status: "Successful", message: `${username} registered` });
        });
    });
});

// check username endpoint
router.post('/check-username', async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) {
        res.status(400).json({ message: "Missing 'username' in request body" });
        return;
    }

    try {
        const existingUser = await lookupUsername(username);

        if (existingUser !== null) {
            res.status(200).json({ status: "Error", message: `${username} already taken` });
        } else {
            res.status(200).json({ status: "Successful", message: `${username} registered` });
        }
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Missing username or password in request");
        return;
    }

    let existingUser = await lookupUsername(username);

    if (existingUser === undefined) {
        // user not found
        res.status(401).send('Invalid username or password');
        return;
    }

    bcrypt.compare(password, existingUser?.password, (err, result) => {
        if (result) {
            // Generate a JWT token
            const token = jwt.sign({ username }, SECRET_KEY);

            // Authentication successful
            logger.debug("successfully authenticated ", username)
            res.json({ message: 'Authentication successful', token });
        } else {
            // Authentication failed
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

// Middleware to verify JWT token
export const authenticateToken = (req: Request, res: Response, next: Function) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded: MyJwtPayload) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.body.username = decoded.username; // Add username to the request body
        next();
    });
};

export const authHandler = router;
