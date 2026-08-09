const { GoogleGenAI } = require('@google/genai');

const aiService = {
  parseTransaction: async (text) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Parse the following text into a JSON object representing a financial transaction.
      The JSON object must have exactly these fields:
      - amount (number)
      - category (string, choose from: Food, Shopping, Transport, Bills, Entertainment, Health, Education, Other)
      - date (string, YYYY-MM-DD format, assume today if not specified)
      - description (string)
      - type (string, either 'expense' or 'income'. Assume 'expense' if it's a purchase/spending)
      
      Return ONLY valid JSON, no markdown formatting or backticks.
      
      Text: "${text}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let responseText = response.text;
      return JSON.parse(responseText);
    } catch (error) {
      console.error('AI Parse Error:', error);
      throw new Error('Failed to parse transaction using AI');
    }
  },

  generateInsights: async (transactions) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are a helpful, encouraging financial advisor. 
      Here are the user's recent transactions:
      ${JSON.stringify(transactions)}
      
      Provide a short, 2-3 sentence summary of their spending habits, followed by 2 actionable tips to reduce unnecessary expenses or improve savings based strictly on the provided data.
      Format the response as plain text with simple bullet points. Keep it brief and friendly.`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('AI Insights Error:', error);
      throw new Error('Failed to generate insights using AI');
    }
  }
};

module.exports = aiService;
