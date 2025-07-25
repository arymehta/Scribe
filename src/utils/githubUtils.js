const defaultCommentMessage = "Hold on!, generating documentation...";

// gets the base branch (main/ master)
export const getBaseBranch = async (octokitClient, owner, repoName) => {
  console.log("Getting the base branch: ");
  try {
    const { data: repoData } = await octokitClient.repos.get({
      owner,
      repo: repoName,
    });
    return repoData?.default_branch;
  } catch (error) {
    console.log("Error Getting Base Branch");
    return;
  }
};

// Getting the SHA of the last commit after which we want to commit
export const getLatestCommitSHA = async (octokitClient, owner, repoName, baseBranch) => {
  try {
    console.log("Getting the last head of main branch: ");
    const { data: refData } = await octokitClient.rest.git.getRef({
      owner: owner,
      repo: repoName,
      ref: `heads/${baseBranch}`, // e.g., 'heads/main' or 'heads/master'
    });
    return refData?.object?.sha;
  } catch (error) {
    console.log("Error Getting latest commit SHA");
  }
};

// Creating a new branch off the current commit SHA
export const creatingNewBranch = async (octokitClient, owner, repoName, newBranchName, commitSha) => {
  try {
    console.log("Creating a new Branch: ");
    const { data: newRef } = await octokitClient.git.createRef({
      owner,
      repo: repoName,
      ref: `refs/heads/${newBranchName}`,
      sha: commitSha,
    });
    return newRef?.object?.sha;
  } catch (error) {
    console.log("Error Creating New Branch");
  }
};

// Create Document to be committed
// TODO: create a separate function to populate docContent where there is an AI call

export const createDocument = async (octokitClient, owner, repoName, docContent = "Default value") => {
  try {
    console.log("Creating Document ");
    // Default value for testing
    // const docContent = `# Auto-Generated Documentation\n\nGenerated by @docbot on ${new Date().toISOString()}`;
    const { data: blobData } = await octokitClient.git.createBlob({
      owner,
      repo: repoName,
      content: docContent,
      encoding: "utf-8",
    });
    return blobData;
  } catch (error) {
    // console.error(error);
    console.log("Error Creating Blob");
    throw new Error("Error Creating Document: This may be a problem at our end!");
  }
};

// -- createTree followed by createCommit
export const createTree = async (octokitClient, owner, repoName, newTreeSha, blobData, path) => {
  try {
    if (path === "") {
      path = "README.md";
    } else {
      path = `${path}/README.md`;
    }
    console.log("Creating new Tree ");
    const { data: newTree } = await octokitClient.git.createTree({
      owner: owner,
      repo: repoName,
      base_tree: newTreeSha, // base is the latest commit's tree
      tree: [
        {
          path: path,
          mode: "100644",
          type: "blob",
          sha: blobData?.sha,
        },
      ],
    });
    return newTree;
  } catch (error) {
    console.log(error);
    console.log("Error Creating Tree");
  }
};

// Create a pull Request
export const createPR = async (
  octokitClient,
  owner,
  repoName,
  issueNumber,
  newBranchName,
  baseBranch,
  title = "Dummy Title"
) => {
  try {
    // Create a pull Request
    console.log("Creating Pull Request");

    await octokitClient.request("POST /repos/{owner}/{repo}/pulls", {
      owner,
      repo: repoName,
      issue_number: issueNumber,
      head: newBranchName,
      base: baseBranch,
      title: title,
    });
    console.log("PR Created!");
  } catch (error) {
    console.log(error);
  }
};

export const createCommit = async (req, octokitClient, docContent, path = "") => {
  console.log("Req recieved");

  // const event = req?.headers["x-github-event"];
  // const action = req?.body?.action;

  const issue = req?.body?.issue;
  const repo = req?.body?.repository;
  const owner = repo?.owner?.login;
  const repoName = repo?.name;
  const issueNumber = issue?.number;

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
  const blobData = await createDocument(octokitClient, owner, repoName, docContent);

  // Create new tree(branch)
  const newTree = await createTree(octokitClient, owner, repoName, newTreeSha, blobData, path);

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
};

export const detectMergePR = async (req, octokitClient) => {
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

export const commentOnIssue = async (req, octokitClient, commentMessage = defaultCommentMessage) => {
  const issue = req?.body?.issue;
  const repo = req?.body?.repository;
  const owner = repo?.owner?.login;
  const repoName = repo?.name;
  const issueNumber = issue?.number;

  // Get original comment body to quote
  const originalComment = req?.body?.comment?.body;
  const author = req?.body?.comment?.user?.login;

  // Quote original comment (if exists)
  let quoted = "";
  if (originalComment) {
    const quotedLines = originalComment
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
    quoted = `@${author}:\n${quotedLines}\n\n`;
  }

  try {
    await octokitClient.rest.issues.createComment({
      owner,
      repo: repoName,
      issue_number: issueNumber,
      body: `${quoted}${commentMessage}`,
    });
  } catch (error) {
    console.log(error);
  }
};

export const checkPermissions = async (req, octokitClient) => {
  try {
    const repo = req?.body?.repository;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;
    const author = req?.body?.sender?.login;

    const { data: permission } = await octokitClient.rest.repos.getCollaboratorPermissionLevel({
      owner: owner,
      repo: repoName,
      username: author,
    });

    if (permission.permission !== "admin" && permission.permission !== "write") {
      console.log(`@${author} does not have write access to this repository`);
      return false;
    }
    return true;
  } catch (error) {
    console.log("Error checking Permission!");
  }
};
