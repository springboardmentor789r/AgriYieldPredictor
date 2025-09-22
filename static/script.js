document.getElementById("yieldForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const formData = {
    cropType: document.getElementById("cropType").value,
    soilType: document.getElementById("soilType").value,
    soilQuality: document.getElementById("soilQuality").value,
    n: document.getElementById("n").value,
    p: document.getElementById("p").value,
    k: document.getElementById("k").value,
    temperature: document.getElementById("temperature").value,
    humidity: document.getElementById("humidity").value,
    ph: document.getElementById("ph").value,
    windSpeed: document.getElementById("windSpeed").value,
  };

  console.log("Form Data Submitted:", formData);

  document.getElementById("predictionValue").innerText = "⏳ Predicting...";

  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.prediction !== undefined) {
      document.getElementById("predictionValue").innerText =
        "✅ Predicted Yield: " + result.prediction + " tons/ha";
    } else {
      document.getElementById("predictionValue").innerText =
        "⚠️ Error: " + result.error;
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("predictionValue").innerText =
      "⚠️ Failed to connect to server.";
  }
});
