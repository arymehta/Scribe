import { createOctokitClient } from "../appAuth.js";
import { parseDirectory, parseFileContents, parseMarkdown } from "../utils/parseDirectory.js";
import { llmResponse } from "../utils/llm_integration.js";

export const commentOnIssue = async (req, res) => {
  const event = req.headers["x-github-event"];
  const action = req.body.action;
  if (event === "issues" && action === "opened") {
    const issue = req.body.issue;
    const repo = req.body.repository;
    const installationId = req.body.installation.id;
    const owner = repo.owner.login;
    const repoName = repo.name;
    const issueNumber = issue.number;
    const octokitClient = createOctokitClient(installationId);
    const path = "";
    try {
      const results = await parseDirectory(octokitClient, owner, repoName, path);
      const finalBody = await parseFileContents(results);
      console.log("The final Body = ", finalBody);
      const llmOutput = await llmResponse(finalBody);
      const finalAnswer = parseMarkdown(llmOutput);
      await octokitClient.rest.issues.createComment({
        owner,
        repo: repoName,
        issue_number: issueNumber,
        body: finalAnswer,
      });
      res.status(200).json({ message: "Successfull" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "An error occurred." });
    }
  } else {
    res.status(300).json({ message: "Invalid event." });
  }
};
