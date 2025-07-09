import { SystemPrompt } from "../prompts/issuePrompt.js";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

export const llmResponse = async (llm_input) => {
  const wrapperString = `The issue is as follows - ${llm_input}.`;
  const response = await openai.chat.completions.create({
    model: process.env.OPEN_AI_MODEL,
    messages: [
      {
        role: "system",
        content: SystemPrompt,
      },
      {
        role: "user",
        content: wrapperString,
      },
    ],
  });
  const finalResponse = response.choices[0].message.content;
  return finalResponse;
};
