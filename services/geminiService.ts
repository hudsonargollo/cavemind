import { GoogleGenAI, Type } from "@google/genai";
import { GeminiFlowResponse } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateFlowFromPrompt = async (
  prompt: string
): Promise<GeminiFlowResponse | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique ID for the node" },
                  label: { type: Type.STRING, description: "Short label for the node" },
                  details: { type: Type.STRING, description: "Optional longer description" },
                },
                required: ["id", "label"],
              },
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique ID for the edge (e.g., e1-2)" },
                  source: { type: Type.STRING, description: "ID of source node" },
                  target: { type: Type.STRING, description: "ID of target node" },
                  label: { type: Type.STRING, description: "Optional label for the connection" },
                },
                required: ["id", "source", "target"],
              },
            },
          },
          required: ["nodes", "edges"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiFlowResponse;
    }
    return null;
  } catch (error) {
    console.error("Gemini Flow Generation Error:", error);
    throw error;
  }
};

export const summarizeFlow = async (
  nodes: { label: string }[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const nodeList = nodes.map(n => n.label).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize this strategic workflow into an executive summary and 3 key action items: ${nodeList}`,
      config: {
        systemInstruction: "You are a strategic advisor. Be concise. Use Markdown.",
      }
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Error generating summary.";
  }
};