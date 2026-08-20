const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const assetRoutes = require("./routes/assets");
const disposalRoutes = require("./routes/disposal");
const lookupRoutes = require("./routes/lookups");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(assetRoutes);
app.use(disposalRoutes);
app.use(lookupRoutes);

// Serve the plain HTML/CSS/JS frontend directly from the backend,
// so you only need to run one server for the demo.
app.use(express.static(path.join(__dirname, "../../frontend")));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
