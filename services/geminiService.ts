import { GoogleGenAI, Type } from "@google/genai";
import { GeminiFlowResponse, SketchProcessingResponse } from "../types";
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

export const processSketchImage = async (
  imageFile: File,
  retryCount: number = 0
): Promise<SketchProcessingResponse> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second base delay

  try {
    // Convert file to base64
    const base64Image = await fileToBase64(imageFile);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this hand-drawn sketch and convert it into a structured diagram. 
              Identify all shapes (rectangles, circles, diamonds, parallelograms), text labels, and connections/arrows.
              Return a JSON structure with nodes and edges that can be used to recreate the diagram.
              
              For each node, provide:
              - A unique id
              - The type (caveNode for shapes, caveText for standalone text)
              - Position (x, y coordinates, estimate based on the image)
              - Data including label text and shape type (process, decision, circle, parallelogram)
              
              For each edge/arrow, provide:
              - A unique id
              - Source and target node ids
              - Whether it should be animated (true for all)`,
            },
            {
              inlineData: {
                mimeType: imageFile.type,
                data: base64Image.split(',')[1], // Remove data URL prefix
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  position: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                    },
                    required: ["x", "y"],
                  },
                  data: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      text: { type: Type.STRING },
                      shape: { type: Type.STRING },
                    },
                  },
                },
                required: ["id", "type", "position", "data"],
              },
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  animated: { type: Type.BOOLEAN },
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
      const result = JSON.parse(response.text) as SketchProcessingResponse;
      
      // Validate the response structure
      if (!result.nodes || !Array.isArray(result.nodes)) {
        throw new Error("Invalid response: missing nodes array");
      }
      if (!result.edges || !Array.isArray(result.edges)) {
        throw new Error("Invalid response: missing edges array");
      }
      
      return result;
    }
    
    throw new Error("No response text from AI");
  } catch (error) {
    console.error("Sketch Processing Error:", error);
    
    // Retry logic with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return processSketchImage(imageFile, retryCount + 1);
    }
    
    throw error;
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};