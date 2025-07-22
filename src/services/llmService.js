// import { GoogleGenAI } from "@google/genai";
// import { SystemPrompt } from "../prompts/issuePrompt.js";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export const llmResponse = async (llm_input) => {
//   const wrapperString = `The code is as follows - ${llm_input}.`;

//   const response = await ai.models.generateContent({
//     model: process.env.GEMINI_MODEL,
//     contents: wrapperString,
//     config: {
//       systemInstruction: SystemPrompt,
//     },
//   });

//   return response.text;
// };

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SystemPrompt } from "../prompts/issuePrompt.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const llmResponse = async (llm_input) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: SystemPrompt,
    });

    const wrapperString = `The code is as follows - ${llm_input}.`;

    const result = await model.generateContent(wrapperString);
    const response = result.response;

    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};
