export const parseDirectory = async (octokitClient, owner, repoName, path) => {
  console.log("Parsing Directory here");
  const results = [];
  const response = await octokitClient.rest.repos.getContent({
    owner,
    repo: repoName,
    path: path,
  });
  const allFiles = response?.data;
  if (!Array.isArray(allFiles)) {
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
