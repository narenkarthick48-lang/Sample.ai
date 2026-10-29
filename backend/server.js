
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    app: "VISHU AI",
    status: "Backend running"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, model = "auto" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(503).json({
        error: "Hugging Face API token is not configured."
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.HF_MODEL || "deepseek-ai/DeepSeek-V3-0324",
          messages: [{ role: "user", content: message }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Hugging Face request failed:", response.status);
      return res.status(502).json({
        error: "AI provider request failed. Check the backend logs and model access."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: "The AI provider returned no response."
      });
    }

    res.json({ reply, model });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({
      error: "Server error. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`VISHU AI backend running on port ${PORT}`);
});
