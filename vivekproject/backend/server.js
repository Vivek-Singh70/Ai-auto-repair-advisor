const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post('/api/diagnose', async (req, res) => {
  const { issue, carType } = req.body;

  if (!issue || !carType) {
    return res.status(400).json({ error: 'Issue and carType are required' });
  }

  try {
    const prompt = `You are an expert Auto Repair Advisor. 
The user has a ${carType} vehicle and is reporting the following issue: "${issue}".
Diagnose the car problem and provide the response in a structured JSON format with the following keys:
- "causes": An array of strings explaining possible causes.
- "troubleshooting": An array of strings with step-by-step troubleshooting instructions.
- "fixes": An array of strings with recommended fixes.
- "difficulty": A string, either "Easy", "Medium", or "Hard".
- "isCritical": A boolean indicating if the issue is a critical safety risk (e.g., brake failure, engine overheating).

Output strictly in JSON. Do not include any markdown code blocks or extra text outside the JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiResponse = JSON.parse(response.text);
    res.json(aiResponse);
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Failed to diagnose the issue. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
