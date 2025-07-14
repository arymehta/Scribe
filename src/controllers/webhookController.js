import { createOctokitClient } from "../appAuth.js";
import { getMarkdownContent } from "../utils/parserUtils.js";
import { commentOnIssue, detectMergePR, createCommit } from "../utils/githubUtils.js";

export const botName = "@bot";

export const RouteWebhookRequest = async (req, res) => {
  const event = req?.headers["x-github-event"];
  const action = req?.body?.action;
  try {
    const installationId = req?.body?.installation?.id;
    const octokitClient = createOctokitClient(installationId);
    const repo = req?.body?.repository;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;

    if ((event === "issues" && action === "opened") || (event === "issue_comment" && action === "created")) {
      const body = req.body.comment?.body?.trim() || req.body.issue?.body?.trim() || "";
      if (!body.toLowerCase().startsWith(botName)) {
        return res.sendStatus(200);
      }

      const pattern = new RegExp(`^${botName}\\s+(doc|fix|refactor|explain)\\s+(.+)$`, "i");
      const match = body.match(pattern);
      // console.log(match)
      if (!match) {
        await commentOnIssue(
          req,
          octokitClient,
          `Invalid command format. Use one of the following:\n\n` +
            `\`\`\`\n` +
            `${botName} doc <path>\n` +
            `${botName} fix <path>\n` +
            `${botName}  refactor <path>\n` +
            `${botName} explain <path>\n` +
            `\`\`\``
        );
        return res.status(401).json({ message: "Invalid " });
      }
      const action = match[1].toLowerCase();
      const path = match[2];
      const safePath = path.replace(/^\/+|^\.\/*|\/+$/g, "");
      console.log(safePath);
      switch (action) {
        case "doc":
          // default comment to acknowledge the user that the bot has started its work.
          try {
            const docContent = await getMarkdownContent(octokitClient, owner, repoName, safePath);
            await commentOnIssue(req, octokitClient);
            await createCommit(req, octokitClient, docContent, safePath);
            await commentOnIssue(req, octokitClient, "Documentation created Successfully");
            return res.status(200).json({ message: "PR Created! " });
          } catch (error) {
            const errMsg = error.message || "Bot ran into an Error";
            await commentOnIssue(req, octokitClient, errMsg);
          }
          break;
        default:
          return res.status(400).json({ message: "You have suffered Aura Loss" });
      }
      return res.status(200).json({ message: "Successfull" });
    } else if (event === "pull_request" && action === "closed") {
      await detectMergePR(req, octokitClient);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An Error Occured" });
  }
};
