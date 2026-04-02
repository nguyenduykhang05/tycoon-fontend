import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
    try {
        console.log("Đang thử nghiệm với API Key:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent('Hỏi: Tycoon là gì? Đáp (trả lời ngắn gọn):');
        const response = await result.response;
        console.log("Phản hồi từ AI:", response.text());
    } catch (e: any) {
        console.error("Lỗi từ Gemini API:");
        console.error(e.message);
    }
}
test();
