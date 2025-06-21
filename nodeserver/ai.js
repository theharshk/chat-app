// nodeserver/ai.js
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Set this in your Railway or .env

async function handleAIMessage(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const candidates = response.data.candidates;
    return candidates?.[0]?.content?.parts?.[0]?.text || "🤖 Gemini returned an empty response."; // ✅ safe fallback

  } catch (err) {
    console.error("Gemini AI Error:", err.message);
    return "❌ Gemini AI service is not responding.";
  }
}

module.exports = { handleAIMessage };
