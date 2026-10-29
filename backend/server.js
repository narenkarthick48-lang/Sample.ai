
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ app: "VISHU AI", status: "Backend running" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Please send a message." });
    }

    if (!process.env.NVIDIA_API_KEY) {
      return res.status(503).json({
        error: "NVIDIA_API_KEY is not configured."
      });
    }

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct",
          messages: [{ role: "user", content: message }],
          max_tokens: 512
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("NVIDIA API error:", response.status, data);
      return res.status(502).json({
        error: "NVIDIA request failed. Check model access and backend logs."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({ error: "No AI reply received." });
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`VISHU AI backend running on port ${PORT}`);
});
