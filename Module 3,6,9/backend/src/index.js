const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const assetRoutes = require("./routes/assets");
const disposalRoutes = require("./routes/disposal");
const lookupRoutes = require("./routes/lookups");
const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 8000;

// Week 3 hardening: tesseract.js's language-data download (OCR) can fail
// for reasons outside our control (network hiccup, blocked CDN, offline
// moment) and — without this — that failure crashes the ENTIRE server,
// taking registration/disposal/reports down with it, not just the OCR
// request. These handlers stop that: the failed request still errors out,
// but the server keeps running for everything else.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection (server stays up):", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception (server stays up):", err);
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(authRoutes);
app.use(assetRoutes);
app.use(disposalRoutes);
app.use(lookupRoutes);
app.use(reportRoutes);

app.use(express.static(path.join(__dirname, "../../frontend")));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
