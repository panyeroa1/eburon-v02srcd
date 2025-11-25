import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ApartmentSearchFilters, NLUResponse } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Audio Helpers ---

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const createAudioContext = (sampleRate: number): AudioContext => {
  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioCtor({ sampleRate });
};

// --- NLU for Text Search ---

export async function parseUserUtterance(
  userText: string, 
  stateFilters: ApartmentSearchFilters
): Promise<NLUResponse> {
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `
  You are Homie, a real estate assistant for Belgium.
  User said: "${userText}"
  Current filters: ${JSON.stringify(stateFilters)}
  
  Your task:
  1. Analyze the user's request.
  2. Update the search filters based on their input (e.g., location, price, type).
  3. Generate a short, friendly reply confirming the action.
  
  Return a JSON object.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intent: { type: Type.STRING, enum: ["APARTMENT_SEARCH", "REFINE_FILTERS", "ASK_DETAILS", "SMALL_TALK", "END_SESSION"] },
          filters: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING, nullable: true },
              minPrice: { type: Type.NUMBER, nullable: true },
              maxPrice: { type: Type.NUMBER, nullable: true },
              minSize: { type: Type.NUMBER, nullable: true },
              bedrooms: { type: Type.NUMBER, nullable: true },
              petsAllowed: { type: Type.BOOLEAN, nullable: true },
              type: { type: Type.STRING, nullable: true },
              sortBy: { type: Type.STRING, nullable: true }
            },
            nullable: true
          },
          assistantReply: { type: Type.STRING },
        },
        required: ["intent", "assistantReply"]
      }
    }
  });

  if (!response.text) throw new Error("No response from NLU");
  return JSON.parse(response.text) as NLUResponse;
}

// --- Chat Helpers ---

export async function getGeminiChatResponse(
  message: string,
  history: any[],
  toolsConfig: { search?: boolean, maps?: boolean }
): Promise<GenerateContentResponse> {
    const tools: any[] = [];
    if (toolsConfig.search) {
        tools.push({ googleSearch: {} });
    }
    if (toolsConfig.maps) {
        tools.push({ googleMaps: {} });
    }

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            tools: tools.length > 0 ? tools : undefined,
        }
    });

    const response = await chat.sendMessage({ message });
    return response as GenerateContentResponse;
}

// --- Analysis Helpers (Thinking Model) ---

export async function analyzeMatchWithThinking(resume: string, jobDesc: string): Promise<string> {
    const prompt = `
    You are an expert HR Technical Recruiter.
    Please analyze the candidate's fit for the job based on the provided text.
    
    RESUME:
    ${resume}
    
    JOB DESCRIPTION:
    ${jobDesc}
    
    Using your reasoning capabilities:
    1. Identify the top 3 matches in skills/experience.
    2. Identify the top 3 gaps or missing qualifications.
    3. Provide a Match Score (0-100%).
    4. Provide a final verdict: Strong Match, Potential Match, or Not a Match.
    
    Format the output as Markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 2048 // Allocate tokens for thinking process
                }
            }
        });
        return response.text || "Analysis complete but no text returned.";
    } catch (error) {
        console.error("Thinking Analysis Error:", error);
        return "Sorry, I encountered an error while analyzing the match.";
    }
}

export async function getFastJobTips(topic: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Give me a single, high-value, actionable tip about "${topic}" for a job seeker. Keep it concise (max 20 words).`,
        });
        return response.text || "Keep your resume updated!";
    } catch (error) {
        console.error("Tip Error:", error);
        return "Always tailor your resume to the job description.";
    }
}