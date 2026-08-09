require('dotenv').config();
const aiService = require('./services/aiService');

async function test() {
  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: 'Parse the following text into a JSON object: Spent 2000 on study at today',
        config: { responseMimeType: "application/json" }
    });
    console.log("Success:", JSON.parse(res.text));
  } catch(e) {
    console.error("Test error:", e);
  }
}
test();
