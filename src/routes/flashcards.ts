import express, { Request, Response } from "express";
import { getFlashcardsForUser, insertFlashcards, lookupUsername } from "../utils/db";
import { authenticateToken } from "./auth"; // Import the authenticateToken middleware

const flashcardRouter = express.Router();

// Function to verify the structure of flashcards
function verifyFlashcardsStructure(flashcards: any): boolean {
    if (!flashcards || typeof flashcards !== 'object') {
        return false;
    }

    // Verify that flashcards contains at least one collection
    const collections = Object.values(flashcards);
    if (collections.length === 0 || !collections.every(Array.isArray)) {
        return false;
    }

    // Optionally, you can add more specific checks for flashcard objects within each collection
    // Example: Check that each flashcard object has the required properties (word, wordID, root, definition)

    return true;
}



// Create a protected route for inserting a flashcard
flashcardRouter.post('/insert', authenticateToken, async (req: Request, res: Response) => {
    try {
        // Check if 'username' and 'flashcards' are present in the request body
        if (!req.body.username || !req.body.flashcards) {
            return res.status(400).json({ message: "Missing 'username' or 'flashcards' in request body" });
        }

        const username = req.body.username;
        const flashcards = req.body.flashcards;

        if (!verifyFlashcardsStructure(flashcards)) {
            return res.status(400).json({ message: "Invalid flashcards structure" });
        }

        insertFlashcards(username, flashcards, (error) => {
            return res.status(500).json({ message: `Internal server error: ${error}` });
        })

        return res.status(200).json({ message: "Successfully inserted flashcards" });

    } catch (error) {
        console.error('Error inserting flashcard:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create a protected GET route to retrieve flashcards for a specific user
flashcardRouter.get('/get', authenticateToken, async (req: Request, res: Response) => {
    try {
        const username = req.body.username; // Extract the username from the request body or token, depending on your authentication setup

        // Call the getFlashcardsForUser function to retrieve the flashcards
        getFlashcardsForUser(username, (error, flashcards) => {
            if (error) {
                return res.status(500).json({ message: "Internal server error" });
            }

            // Send the retrieved flashcards in the response
            res.json({ flashcards });
        });
    } catch (error) {
        console.error('Error retrieving flashcards:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default flashcardRouter;
