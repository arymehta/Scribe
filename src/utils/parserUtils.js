import { minimatch } from "minimatch";
import { llmResponse } from "../services/llmService.js";
import { createOctokitClient } from "../appAuth.js";
import { updateIncludeList } from "./includeList.js";

export const parseDirectory = async (octokitClient, owner, repoName, path, includeList) => {
  console.log("Parsing Directory here");
  const results = [];
  let response;

  try {
    response = await octokitClient?.rest?.repos?.getContent({
      owner,
      repo: repoName,
      path,
    });
  } catch (err) {
    // Handle invalid path or repo errors
    if (err?.status === 404) {
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
    if (file.type === "file" && shouldIncludeFile(file?.name, includeList)) {
      const fileResponse = await octokitClient?.rest?.repos?.getContent({
        owner,
        repo: repoName,
        path: file?.path,
      });
      const content = Buffer?.from(fileResponse?.data?.content, "base64").toString("utf-8");
      results.push({
        fileName: file?.name,
        content,
      });
    }
  }

  return results;
};

const shouldIncludeFile = (fileName, includeList) => {
  let included = false;
  for (const pattern of includeList) {
    const trimmed = pattern.trim();
    if (!trimmed || trimmed.startsWith("#")) continue; // skip empty lines & comments
    
    const isNegation = trimmed.startsWith("!");
    const cleanPattern = isNegation ? trimmed.slice(1) : trimmed;
    
    if (minimatch(fileName, cleanPattern)) {
      included = !isNegation;
    }
  }
  console.log(`Checking file ${fileName} → ${included ? "INCLUDED" : "SKIPPED"}`);
  return included;
};



export const parseFileContents = async (fileContent) => {
  let finalOutput = "";
  for (const content of fileContent) {
    finalOutput += `File Name - ${content?.fileName}\n\nFile Content -\n ${content?.content}\n\n`;
  }
  return finalOutput;
};

export const parseMarkdown = (markdownString) => {
  return markdownString
    .replace(/^```markdown\s*/, "")
    .replace(/```$/, "")
    .trim();
};

export const getMarkdownContent = async (req, octokitClient, owner, repoName, path = "") => {
  const finalIncludeList = await updateIncludeList(req, octokitClient);
  const results = await parseDirectory(octokitClient, owner, repoName, path, finalIncludeList);
  const finalBody = await parseFileContents(results);
  const llmOutput = await llmResponse(finalBody);
  const finalAnswer = parseMarkdown(llmOutput);
  return finalAnswer;
};

export const parseRequest = (req) => {
  const installationId = req?.body?.installation?.id;
  const octokitClient = createOctokitClient(installationId);
  const repo = req?.body?.repository;
  const owner = repo?.owner?.login;
  const repoName = repo?.name;
  const author = req?.body?.sender?.login;
  return { octokitClient, owner, repoName, author };
};
