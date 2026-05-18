import { prisma } from "../lib/prisma.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const sanitizeFilename = (filename = "resume.pdf") =>
  filename
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "resume.pdf";

export async function uploadResume(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF file" });
    }

    const isPdf =
      req.file.mimetype === "application/pdf" ||
      req.file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    const parsed = await pdfParse(req.file.buffer);
    const extractedText = (parsed.text || "").trim();
    const storagePath = "local";

    const resume = await prisma.resume.create({
      data: {
        userId,
        storagePath,
        filename: req.file.originalname,
        extractedText,
        skills: [],
      },
      select: {
        id: true,
        extractedText: true,
      },
    });

    return res.status(201).json({
      success: true,
      resumeId: resume.id,
      extractedText: resume.extractedText,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return res.status(500).json({ error: error.message || "Failed to upload resume" });
  }
}