const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 📂 Load dataset
const datasetPath = path.join(__dirname, "crop_yield_dataset.csv");
let dataset = [];

if (fs.existsSync(datasetPath)) {
  fs.createReadStream(datasetPath)
    .pipe(csv())
    .on("data", (row) => dataset.push(row))
    .on("end", () => {
      console.log(`✅ Dataset loaded: ${dataset.length} rows`);
    });
} else {
  console.error("❌ Dataset not found at:", datasetPath);
}

// ✅ Root route (for backend status check)
app.get("/", (req, res) => {
  res.send("✅ Backend server is running");
});

// ✅ Prediction route
app.post("/predict", (req, res) => {
  try {
    const { temperature, rainfall, humidity, soilType, weatherType, cropType } = req.body;

    if (
      temperature === undefined ||
      rainfall === undefined ||
      humidity === undefined ||
      !soilType ||
      !weatherType ||
      !cropType
    ) {
      return res.status(400).json({ error: "Missing input fields" });
    }

    // 🌱 Dummy Prediction Logic (replace later with ML model)
    // Simple weighted formula
    const predictedYield =
      (parseFloat(temperature) * 0.3 +
        parseFloat(rainfall) * 0.25 +
        parseFloat(humidity) * 0.2 +
        (soilType.length + weatherType.length + cropType.length) * 0.1) /
      10;

    res.json({
      predictedYield: predictedYield.toFixed(2),
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
