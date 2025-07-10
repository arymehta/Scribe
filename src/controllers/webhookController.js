import { createOctokitClient } from "../appAuth.js";
import { getMarkdownContent } from "../utils/parserUtils.js";
import { commentOnIssue, detectMergePR, createCommit } from "../utils/githubUtils.js";

export const RouteWebhookRequest = async (req, res) => {
  const event = req?.headers["x-github-event"];
  const action = req?.body?.action;
  try {
    const installationId = req?.body?.installation?.id;
    const octokitClient = createOctokitClient(installationId);
    const repo = req?.body?.repository;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;

    if (event === "issues" && action === "opened") {
      const body = req.body.comment?.body?.trim() || req.body.issue?.body?.trim() || "";
      if (!body.toLowerCase().startsWith("@bot")) {
        return res.sendStatus(200);
      }
      const match = body.match(/^@bot\s+(doc|fix|refactor|explain)\s+(.+)$/i);
      if (!match) {
        await commentOnIssue(
          req,
          octokitClient,
          `Invalid command format. Use one of the following:\n\n` +
            `\`\`\`\n` +
            `@bot doc <path>\n` +
            `@bot fix <path>\n` +
            `@bot refactor <path>\n` +
            `@bot explain <path>\n` +
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
          await commentOnIssue(req, octokitClient);
          const docContent = await getMarkdownContent(octokitClient, owner, repoName, safePath);
          await createCommit(req, octokitClient, docContent, safePath);
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
