import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function LLMresponseStream(chunks, query) {
    const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: `You are a helpful document assistant. Answer the user's question based ONLY on 
the provided document context. If the context doesn't contain enough information, 
say so clearly. Be precise and cite specific parts of the document when possible. Provide answers without any formatting, keep the answers simple and direct. 

CONTEXT:
${chunks}

QUESTION:
${query}`,
    });
    return responseStream;
}

