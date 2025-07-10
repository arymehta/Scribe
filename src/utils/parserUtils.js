import { llmResponse } from "../utils/llmUtils.js";

export const parseDirectory = async (octokitClient, owner, repoName, path) => {
  console.log("Parsing Directory here");
  const results = [];
  const response = await octokitClient.rest.repos.getContent({
    owner,
    repo: repoName,
    path: path,
  });
  const allFiles = response?.data;
  if (!Array.isArray(allFiles) || allFiles.length == 0) {
    console.log("The path is not a directory");
    throw new Error("The path is not a directory");
  }
  for (const file of allFiles) {
    if (file.type === "file") {
      const fileResponse = await octokitClient.rest.repos.getContent({
        owner,
        repo: repoName,
        path: file?.path,
      });
      const content = Buffer.from(fileResponse.data.content, "base64").toString("utf-8");
      results.push({
        fileName: file?.name,
        content,
      });
    }
  }
  return results;
};

export const parseFileContents = async (fileContent) => {
  let finalOutput = "";
  for (const content of fileContent) {
    finalOutput += `File Name - ${content.fileName}\n\nFile Content - ${content.content}\n\n`;
  }
  return finalOutput;
};

export const parseMarkdown = (markdownString) => {
  return markdownString
    .replace(/^```markdown\s*/, "")
    .replace(/```$/, "")
    .trim();
};

export const getMarkdownContent = async (octokitClient, owner, repoName, path = "") => {
  try {
    const results = await parseDirectory(octokitClient, owner, repoName, path);
    const finalBody = await parseFileContents(results);
    const llmOutput = await llmResponse(finalBody);
    const finalAnswer = parseMarkdown(llmOutput);
    return finalAnswer;
  } catch (error) {
    console.log(error);
    console.log("Error getting markdown content");
  }
};
