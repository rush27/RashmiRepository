
import { GoogleGenAI, Type } from "@google/genai";
import { BrandContext, HistoryItem, MonthlyPlanItem } from "./types";

/**
 * This service uses the API key from the brand context if available, otherwise falls back to process.env.API_KEY.
 */

const getSystemInstruction = (brand: BrandContext) => `
You are a social media and WhatsApp assistant for an Indian MSME.
Business Name: ${brand.businessName}
Category: ${brand.category}
Location: ${brand.city}
${brand.businessDescription ? `Business Description: ${brand.businessDescription}` : ''}
Preferred Language: ${brand.language}
Tone: ${brand.tone}

Rules:
1. Always respond in ${brand.language}. If Hinglish, use Latin script but Hindi vocabulary.
2. Keep it short and task-focused.
3. Use ${brand.tone} tone.
4. Avoid excessive emojis. 
5. Content must be ready to copy-paste.
6. Use the business description to make content specific to their services.
7. For post generation, include emojis sparingly to keep it professional.
`;

const getAI = (userKey?: string) => {
  const key = userKey || process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please add your Gemini API Key in the settings.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export const generateTodayPost = async (brand: BrandContext, history: HistoryItem[]) => {
  const ai = getAI(brand.apiKey);
  const previousThemes = history.slice(0, 5).map(h => h.content).join("\n");
  
  const prompt = `Give me a post for today. 
  Recent posts to avoid repeating: ${previousThemes}
  Output format:
  [CAPTION]
  [HASHTAGS]
  [CTA]
  Keep caption under 100 words.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: getSystemInstruction(brand) }
  });
  return response.text || "";
};

export const generateImagePromptForPost = async (brand: BrandContext, postContent: string) => {
  const ai = getAI(brand.apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on: "${postContent}", generate a structured image prompt JSON.`,
    config: {
      systemInstruction: getSystemInstruction(brand),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          image_type: { type: Type.STRING },
          subject: { type: Type.STRING },
          setting: { type: Type.STRING },
          style: { type: Type.STRING },
          text_on_image: { type: Type.STRING },
          aspect_ratio: { type: Type.STRING }
        },
        required: ["platform", "image_type", "subject", "setting", "style", "text_on_image", "aspect_ratio"]
      }
    }
  });
  const text = response.text || "{}";
  try {
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
};

export const generateOffer = async (brand: BrandContext, productName: string, details: string) => {
  const ai = getAI(brand.apiKey);
  const prompt = `Create an offer for "${productName}". Details: ${details}. Provide WhatsApp and Instagram versions.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: getSystemInstruction(brand) }
  });
  return response.text || "";
};

export const generateReply = async (brand: BrandContext, customerMessage: string) => {
  const ai = getAI(brand.apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Reply to: "${customerMessage}". Focus on helpful intent.`,
    config: { systemInstruction: getSystemInstruction(brand) }
  });
  return response.text || "";
};

export const generateBroadcast = async (brand: BrandContext) => {
  const ai = getAI(brand.apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Short WhatsApp broadcast message for today. Non-spammy.`,
    config: { systemInstruction: getSystemInstruction(brand) }
  });
  return response.text || "";
};

export const generateImagePrompt = async (brand: BrandContext, topic: string) => {
  const ai = getAI(brand.apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate an image prompt for: ${topic}. Format as JSON.`,
    config: {
      systemInstruction: getSystemInstruction(brand),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          image_type: { type: Type.STRING },
          subject: { type: Type.STRING },
          setting: { type: Type.STRING },
          style: { type: Type.STRING },
          text_on_image: { type: Type.STRING },
          aspect_ratio: { type: Type.STRING }
        }
      }
    }
  });
  const text = response.text || "{}";
  try {
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
};

export const generateMonthlyPlan = async (brand: BrandContext): Promise<MonthlyPlanItem[]> => {
  const ai = getAI(brand.apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "30-day social media plan JSON.",
    config: {
      systemInstruction: getSystemInstruction(brand),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            type: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ["date", "type", "topic"]
        }
      }
    }
  });
  const text = response.text || "[]";
  try {
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
};
