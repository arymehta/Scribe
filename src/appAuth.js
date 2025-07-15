import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export const createOctokitClient = (installationId) => {
  const privateKey = Buffer.from(process.env.GITHUB_SECRET, "base64").toString("utf-8");
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: privateKey,
      installationId,
    },
  });

  return octokit;
};
