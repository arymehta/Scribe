import { createOctokitClient } from "../appAuth.js";
import { getMarkdownContent } from "../utils/parserUtils.js";
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
    const installationId = req?.body?.installation?.id;
    const octokitClient = createOctokitClient(installationId);
    const repo = req?.body?.repository;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;
    // console.log(req.body);
    if (event === "issues" && action === "opened") {
      await commentOnIssue(req, octokitClient);
      const docContent = await getMarkdownContent(octokitClient, owner, repoName, "");
      await createCommit(req, octokitClient, docContent);
    } else if (event === "pull_request" && action === "closed") {
      await detectMergePR(req, octokitClient);
    }
  } catch (error) {
    console.log(error);
  }
};

// ----------------------MAIN SERVICES------------------------------
const defaultCommentMessage = "Hold on!, generating documentation...";
const commentOnIssue = async (req, octokitClient, commentMessage = defaultCommentMessage) => {
  const event = req?.headers["x-github-event"];
  const action = req?.body?.action;
  if (event === "issues" && action === "opened") {
    const issue = req?.body?.issue;
    const repo = req?.body?.repository;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;
    const issueNumber = issue?.number;

    try {
      await octokitClient.rest.issues.createComment({
        owner,
        repo: repoName,
        issue_number: issueNumber,
        body: commentMessage,
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    // res.status(300).json({ message: "Invalid event." });
    throw new Error("Invalid Action");
  }
};

const createCommit = async (req, octokitClient, docContent) => {
  console.log("Req recieved");

  const event = req.headers["x-github-event"];
  const action = req.body.action;

  if (event === "issues" && action === "opened") {
    const issue = req?.body?.issue;
    const repo = req?.body?.repository;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;
    const issueNumber = issue?.number;

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
      const commitMessage = `Issue #${issueNumber} : Creating documentation on branch ${newBranchName}`;
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

const detectMergePR = async (req, octokitClient) => {
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
        const owner = repo?.owner?.login;
        const repoName = repo?.name;

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
