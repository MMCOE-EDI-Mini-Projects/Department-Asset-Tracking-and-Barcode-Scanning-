const sharp = require("sharp");
const { createWorker } = require("tesseract.js");

/**
 * Preprocesses an uploaded image (grayscale + contrast + resize) to improve
 * OCR accuracy, runs Tesseract.js on it, and extracts a token that looks
 * like an asset code / barcode value (e.g. CE-LAB3-042).
 */
async function extractAssetCodeFromImage(imageBuffer) {
  const processedBuffer = await sharp(imageBuffer)
    .grayscale()
    .normalize()
    .resize({ width: 1200, withoutEnlargement: false })
    .toBuffer();

  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(processedBuffer);

    const match = text.match(/[A-Z0-9]+(?:-[A-Z0-9]+){1,4}/i);
    const extractedCode = match ? match[0].toUpperCase() : null;

    return { rawText: text.trim(), extractedCode };
  } finally {
    await worker.terminate();
  }
}

module.exports = { extractAssetCodeFromImage };
