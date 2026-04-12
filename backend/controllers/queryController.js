import { generate_embeddings } from "./embeddingsGeneration.js";
import cosineSimilarity from "compute-cosine-similarity";
import { LLMresponseStream } from "./generation.js";
import { db } from "../src/db/index.js";
import { chunks, chats, documents } from "../src/db/schema.js";
import { eq, and } from "drizzle-orm";

export const queryController = async (req, res) => {
    const { question, documentId } = req.body;

    if (!question) {
        return res.status(400).json({ message: "Question required" });
    }
    
    if (!documentId) {
        return res.status(400).json({ message: "Document ID required" });
    }

    try {
        // 1. Generate query embedding
        const [queryEmbedding] = await generate_embeddings([question]);

        // Security Check: Verify document exists and belongs to the user
        const docRecord = await db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.userId, req.user.uid)));
        if (!docRecord || docRecord.length === 0) {
            return res.status(403).json({ message: "Unauthorized or document not found" });
        }

        // 2. Fetch chunks for the specified document from the database
        const documentChunks = await db.select().from(chunks).where(eq(chunks.documentId, documentId));

        if (!documentChunks || documentChunks.length === 0) {
            return res.status(404).json({ message: "No context chunks found for this document" });
        }

        // 3. Compute similarity with all chunks
        const scoredChunks = documentChunks.map(chunk => ({
            content: chunk.content,
            score: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));

        // 4. Sort descending
        scoredChunks.sort((a, b) => b.score - a.score);

        // 5. Pick top 3 chunks
        const topChunks = scoredChunks.slice(0, 3);
        
        // 6. Format context text for the LLM
        const contextText = topChunks.map(chunk => chunk.content).join("\n\n");
        
        // 7. Call the LLM for llm response stream
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const stream = await LLMresponseStream(contextText, question);
        let fullAnswer = "";

        for await (const chunk of stream) {
            if (chunk.text) {
                fullAnswer += chunk.text;
                res.write(chunk.text);
            }
        }
        res.end(); // close connection

        // 8. Save the Q&A to the chats table
        await db.insert(chats).values({
            documentId: documentId,
            question: question,
            response: fullAnswer
        });

        // Answer is already streamed successfully, no .json needed
    } catch (error) {
        console.error("Error processing query:", error);
        if (!res.headersSent) {
           return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
};