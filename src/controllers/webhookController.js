import { createOctokitClient } from "../appAuth.js";
import { parseDirectory, parseFileContents, parseMarkdown } from "../utils/parserUtils.js";
import { llmResponse } from "../utils/parserUtils.js";
import {
  getBaseBranch,
  getLatestCommitSHA,
  creatingNewBranch,
  createTree,
  createPR,
  createDocument,
} from "../utils/githubUtils.js";

export const RouteWebhookRequest = async (req, res) => {
  const event = req?.headers["x-github-event"];
  const action = req?.body?.action;

  try {
    if (event === "issues" && action === "opened") {
      const docContent = await commentOnIssue(req, res);
      createCommit(req, res, docContent);
    } else if (event === "pull_request" && action === "closed") {
      await detectMergePR(req, res);
    }
  } catch (error) {
    console.log(error);
    res?.status(401)?.json({ message: "An Error Occured" });
  }
};

// ----------------------MAIN SERVICES------------------------------
const commentOnIssue = async (req, res) => {
  const event = req?.headers["x-github-event"];
  const action = req?.body?.action;
  if (event === "issues" && action === "opened") {
    const issue = req?.body?.issue;
    const repo = req?.body?.repository;
    const installationId = req?.body?.installation?.id;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;
    const issueNumber = issue?.number;
    const octokitClient = createOctokitClient(installationId);
    const path = "";
    try {
      const results = await parseDirectory(octokitClient, owner, repoName, path);
      const finalBody = await parseFileContents(results);
      // console.log("The final Body = ", finalBody);
      const llmOutput = await llmResponse(finalBody);
      const finalAnswer = parseMarkdown(llmOutput);
      await octokitClient.rest.issues.createComment({
        owner,
        repo: repoName,
        issue_number: issueNumber,
        body: "Hold on!, generating documentation...",
      });
      return finalAnswer;
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "An error occurred." });
    }
  } else {
    res.status(300).json({ message: "Invalid event." });
  }
};

const createCommit = async (req, res, docContent) => {
  console.log("Req recieved");

  const event = req.headers["x-github-event"];
  const action = req.body.action;

  if (event === "issues" && action === "opened") {
    const issue = req?.body?.issue;
    const repo = req?.body?.repository;
    const installationId = req?.body?.installation?.id;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;
    const issueNumber = issue?.number;
    const octokitClient = createOctokitClient(installationId);

    try {
      // gets the base branch (main/ master)
      const baseBranch = await getBaseBranch(octokitClient, owner, repoName);

      // Getting the SHA of the last commit after which we want to commit
      const commitSha = await getLatestCommitSHA(octokitClient, owner, repoName, baseBranch);
      console.log("Commit SHA: ", commitSha);

      // Creating a new branch off the current commit SHA
      const newBranchName = `docbot/docs-${Date.now()}`;
      const newTreeSha = await creatingNewBranch(octokitClient, owner, repoName, newBranchName, commitSha);

      // Create Document to be committed
      // TODO: create a separate function for this where there is an AI call
      // const docContent = await commentOnIssue(req, res);
      console.log(docContent);
      const blobData = await createDocument(octokitClient, owner, repoName, docContent);

      // Create new tree(branch)
      const newTree = await createTree(octokitClient, owner, repoName, newTreeSha, blobData);

      // Create a commit
      console.log("Commiting on that Tree");
      const commitMessage = `Closes #${issueNumber} : Creating documentation on branch ${newBranchName}`;
      const { data: newCommit } = await octokitClient.git.createCommit({
        owner,
        repo: repoName,
        message: commitMessage,
        tree: newTree?.sha,
        parents: [commitSha],
      });

      // Update the head of the new branch to the katest commit
      console.log("Updating the head of that branch to the new commit SHA ");
      await octokitClient.git.updateRef({
        owner,
        repo: repoName,
        ref: `heads/${newBranchName}`,
        sha: newCommit?.sha,
      });

      // Create a pull Request
      await createPR(octokitClient, owner, repoName, issueNumber, newBranchName, baseBranch, commitMessage);
    } catch (error) {
      console.log(error);
    }
  }
};

const detectMergePR = async (req, res) => {
  const event = req?.headers["x-github-event"];
  const action = req?.body?.action;

  // Handle pull request events (closed/merged)
  if (event === "pull_request" && action === "closed") {
    console.log("Pull Request Closed Detected!");

    const pr = req?.body?.pull_request;
    const mergedStatus = pr?.merged;
    const branchRef = pr?.head.ref;

    if (branchRef.startsWith("docbot/docs-")) {
      try {
        const repo = req?.body?.repository;
        const installationId = req?.body?.installation?.id;
        const owner = repo?.owner?.login;
        const repoName = repo?.name;
        const octokitClient = createOctokitClient(installationId);

        console.log(`PR was ${mergedStatus ? "merged" : "closed without merging"}`);
        console.log(`Branch to delete: ${branchRef}`);

        octokitClient.rest.git.deleteRef({
          owner: owner,
          repo: repoName,
          ref: `heads/${branchRef}`,
        });

        console.log("Branch Deleted Successfully");
      } catch (error) {
        console.log("Error in Deleting Branch!");
      }
    } else {
      console.log("Branch was not Generated by docbot, skipping...");
    }
  }
};
