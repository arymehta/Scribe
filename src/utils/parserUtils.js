import { llmResponse } from "../services/llmService.js";

export const parseDirectory = async (octokitClient, owner, repoName, path) => {
  console.log("Parsing Directory here");
  const results = [];
  let response;

  try {
    response = await octokitClient.rest.repos.getContent({
      owner,
      repo: repoName,
      path,
    });
  } catch (err) {
    // Handle invalid path or repo errors
    if (err.status === 404) {
      throw new Error("This directory does not exist! Please enter a valid directory");
    }
    throw err; // rethrow other errors
  }

  const allFiles = response?.data;

  if (!Array.isArray(allFiles)) {
    console.log("The path is not a directory");
    throw new Error("The path is not a directory");
  }

  // If it's a valid empty directory, return an empty array
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
  const results = await parseDirectory(octokitClient, owner, repoName, path);
  const finalBody = await parseFileContents(results);
  const llmOutput = await llmResponse(finalBody);
  const finalAnswer = parseMarkdown(llmOutput);
  return finalAnswer;
};
