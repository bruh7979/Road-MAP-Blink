
import { GoogleGenAI, Type } from "@google/genai";
import { RoadmapItem, Status, Priority } from "../types";

// Fixed: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMilestones = async (projectDescription: string): Promise<Partial<RoadmapItem>[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Com base nesta descrição de projeto: "${projectDescription}", sugira 5 marcos críticos (milestones) para um roadmap. Retorne-os como uma lista JSON. Use APENAS os valores permitidos para status e prioridade. Responda em Português do Brasil.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: Object.values(Status) },
            priority: { type: Type.STRING, enum: Object.values(Priority) },
            durationDays: { type: Type.NUMBER, description: "Duração estimada em dias" }
          },
          required: ["title", "description", "status", "priority", "durationDays"]
        }
      }
    }
  });

  try {
    // response.text is a property, not a method. Ensure it's not undefined before parsing.
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (e) {
    console.error("Falha ao analisar resposta da IA", e);
    return [];
  }
};
