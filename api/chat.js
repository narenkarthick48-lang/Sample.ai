
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://narenkarthick48-lang.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "NVIDIA API key is not configured." });
    }

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct",
          messages: [{ role: "user", content: message.trim() }],
          max_tokens: 512
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("NVIDIA API error:", response.status, data);
      return res.status(502).json({
        error: "NVIDIA request failed. Check model access and API settings."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({ error: "No AI reply received." });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
