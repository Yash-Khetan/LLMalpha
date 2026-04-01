import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import cosinesimilarity from "compute-cosine-similarity";
import dotenv from "dotenv";
dotenv.config();


const port = 5000;
const app = express();
const upload = multer({ dest: 'uploads/' });

app.get("/", (req, res) => {
    res.send("app is up and running!")
})

app.listen(port, () => {
    console.log("server is running on https://localhost:5000");
})




// generating the chunks 
function chunkTextWithOverlap(text, chunkSize, overlap) {
    const chunks = [];
    const step = Math.max(1, chunkSize - overlap); //
    for (let i = 0; i < text.length; i += step) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    // console.log(chunks);
    return chunks;
}

// generating the embeddings of the chunks 
async function generate_embeddings(chunks) {

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: chunks,
    });

    //    save the embeddings in db for now console log it 
    console.log(response.embeddings);
}


// file upload endpoint using multer
app.post("/upload", upload.single('file'), async function (req, res, next) {
    const file = req.file;
    const name = file.originalname;
    if (!(name.endsWith('.pdf') || name.endsWith(".xlsx") || name.endsWith('.txt'))) {
        res.status(400).json({ message: "upload only pdf/xlsx/.txt files!" })
    }
    const parser = new PDFParse({ url: file.path });
    const data = await parser.getText();
    if (!data) {
        return res.status(400).json({ message: "No text found" })

    }

    // calling the chunks functions
    const chunks = chunkTextWithOverlap(data.text, 400, 100);
    generate_embeddings(chunks);

    // console.log(chunks.toString());

    return res.status(200).json({ message: "text extracted", data: data });
})


// query api 
app.post("/query", (req, res) => {
    const query = req.body;
    // generate the embedding of the query
    generate_embeddings(query);

    // do the similarity between the query embeddings and the doc embeddings 
    const similarity = cosine


})