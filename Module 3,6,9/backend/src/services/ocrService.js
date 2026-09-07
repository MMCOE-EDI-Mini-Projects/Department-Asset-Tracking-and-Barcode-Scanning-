const sharp = require("sharp");
const { createWorker } = require("tesseract.js");

/**
 * Week 3: improved OCR pipeline over Week 1/2's plain grayscale+normalize.
 *
 * Changes and why:
 * 1. Larger upscale target (1600px vs 1200px) — asset code labels are
 *    small text; more pixels gives Tesseract more to work with.
 * 2. Sharpen after resize — counteracts the slight blur upscaling
 *    introduces, which was hurting recognition of thin label fonts.
 * 3. Binarization via .threshold() — converts to pure black/white,
 *    which removes background texture/shadows on photographed labels
 *    and is the single biggest accuracy win for label-style OCR.
 * 4. Character whitelist — asset codes are only uppercase letters,
 *    digits, and hyphens (e.g. CE-LAB3-042), so restricting Tesseract's
 *    output alphabet eliminates a whole class of misreads (e.g. 'O'
 *    read as a stray symbol) that used to slip past the regex.
 * 5. PSM 7 (single text line) — asset code labels are one line of
 *    text, not a paragraph; the default page-segmentation mode was
 *    tuned for documents and sometimes fragmented the code.
 * 6. Returns a confidence score so low-confidence reads can be
 *    surfaced to the user instead of silently returning a bad match.
 */
async function extractAssetCodeFromImage(imageBuffer) {
  const processedBuffer = await sharp(imageBuffer)
    .grayscale()
    .resize({ width: 1600, withoutEnlargement: false })
    .sharpen()
    .normalize()
    .threshold(150)
    .toBuffer();

  const worker = await createWorker("eng");
  try {
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
      tessedit_pageseg_mode: "7",
    });

    const {
      data: { text, confidence },
    } = await worker.recognize(processedBuffer);

    const match = text.match(/[A-Z0-9]+(?:-[A-Z0-9]+){1,4}/i);
    const extractedCode = match ? match[0].toUpperCase() : null;

    return { rawText: text.trim(), extractedCode, confidence };
  } finally {
    await worker.terminate();
  }
}

module.exports = { extractAssetCodeFromImage };
