import { createOctokitClient } from "../appAuth.js";

export const commentOnIssue = async (req, res) => {
  console.log("Req recieved");
  console.log(req.body);
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
    try {
      const res = await octokitClient.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner,
          repo: repoName,
          issue_number: issueNumber,
          body: "Thanks for opening this issue! The bot is active.",
        }
      );
      console.log(res);
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "An Error Occured" });
    }
  } else {
    res.status(400).json({ message: "Invalid dude" });
  }
};
