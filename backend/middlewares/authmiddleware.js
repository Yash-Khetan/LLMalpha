import admin from '../firebase-config.js';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided. Unauthorized.' });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify token using Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Attach user information to the request so controllers can use it
        req.user = decodedToken;

        // Sync user to Postgres DB if they don't exist yet
        const existingUser = await db.select().from(users).where(eq(users.id, decodedToken.uid));
        if (existingUser.length === 0) {
            await db.insert(users).values({
                id: decodedToken.uid,
                email: decodedToken.email || "no-email@firebase.local",
                name: decodedToken.name || "DocuMind User",
            });
        }

        next();
    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        return res.status(403).json({ error: 'Invalid or expired token. Unauthorized.' });
    }
};
