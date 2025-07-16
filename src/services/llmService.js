import { GoogleGenAI } from "@google/genai";
import { SystemPrompt } from "../prompts/issuePrompt.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const llmResponse = async (llm_input) => {
  const wrapperString = `The code is as follows - ${llm_input}.`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: wrapperString,
    config: {
      systemInstruction: SystemPrompt,
    },
  });

  return response.text;
};
