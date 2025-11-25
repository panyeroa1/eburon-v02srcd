import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { ApartmentSearchFilters, NLUResponse } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Audio Helpers ---

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64data = reader.result as string;
        // remove data:audio/wav;base64, prefix
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

// --- NLU Fallback (Text Mode) ---

export async function parseUserUtterance(
  userText: string, 
  stateFilters: ApartmentSearchFilters
): Promise<NLUResponse> {
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `
  You are Homie, a real estate assistant for Belgium.
  User said: "${userText}"
  Current filters: ${JSON.stringify(stateFilters)}
  
  Extract filters and generate a warm, short reply.
  Return JSON.
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

// --- New Capabilities ---

export async function analyzeMatchWithThinking(resume: string, jobDesc: string): Promise<string | undefined> {
  // Use gemini-2.5-flash which supports thinking config
  const modelId = 'gemini-2.5-flash'; 
  const prompt = `
  Resume: ${resume}
  Job Description: ${jobDesc}
  
  Analyze the fit between this resume and job description. 
  Highlight strengths, weaknesses, and give a match score out of 10.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      // Thinking budget and maxOutputTokens must be set together
      thinkingConfig: { thinkingBudget: 2048 },
      maxOutputTokens: 8192,
    }
  });

  return response.text;
}

export async function getFastJobTips(topic: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Give me one quick, actionable tip for ${topic}. Keep it under 20 words.`,
  });
  return response.text || "Keep persistent!";
}

export async function getGeminiChatResponse(
  message: string,
  history: any[], // Accepts array of { role, parts }
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
