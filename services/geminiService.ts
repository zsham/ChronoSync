import { GoogleGenAI } from "@google/genai";

// Ideally, this is injected via environment variables, but for this demo environment 
// we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

try {
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client", error);
}

export const getProductivityTip = async (role: string, timeOfDay: string): Promise<string> => {
  if (!ai) return "Stay focused and keep moving forward!";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give me a short, 1-sentence professional productivity tip or motivation quote for a ${role} working in the ${timeOfDay}. Be concise and inspiring.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Consistency is the key to success.";
  }
};

export const analyzeAttendance = async (records: any[]): Promise<string> => {
  if (!ai || records.length === 0) return "Not enough data for analysis.";

  try {
    // Summarize data to save tokens
    const summary = records.slice(-10).map(r => ({
      date: r.date,
      duration: r.workDurationMinutes,
      late: r.isLate
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these last 10 attendance records: ${JSON.stringify(summary)}. 
      Give a 2-sentence feedback to the employee about their punctuality and work hours consistency.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Great job keeping track of your time!";
  }
};