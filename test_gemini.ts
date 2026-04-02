import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    try {
        console.log("Testing with API Key:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: 'say hello',
        });
        console.log("Response:", response.text);
    } catch (e: any) {
        console.error("Error from Gemini API:");
        console.error(e.message);
    }
}
test();
