require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test(modelName) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Parse this: Spent 2000 for health",
    });
    console.log(`Success with ${modelName}:`, response.text);
  } catch (error) {
    console.error(`Error with ${modelName}:`, error.message);
  }
}

async function run() {
  await test('gemini-flash-latest');
  await test('gemini-2.0-flash');
  await test('gemini-2.5-flash');
}

run();
