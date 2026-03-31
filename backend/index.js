import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";

const port = 5000;
const app = express();
const upload = multer({ dest: 'uploads/' });

app.get("/", (req, res) => {
    res.send("app is up and running!")
})

app.listen(port, () => {
    console.log("server is running on https://localhost:5000");
})

// file upload endpoint using multer
app.post("/upload", upload.single('file'), function (req, res, next) {
    const file = req.file;
    const name = file.originalname;
    if (!(name.endsWith('.pdf') || name.endsWith(".xlsx"))) {
        res.status(400).json({ message: "upload only pdf/xlsx files!" })
    }
    const text = PDFParse.toString(file);
    console.log(text);
    // console.log(`uploaded ${file.originalname}`);
})