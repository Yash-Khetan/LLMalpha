import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
export async function generate_embeddings(texts) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: texts,
    });

    return response.embeddings.map(e => e.values);
}