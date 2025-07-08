import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";

export const createOctokitClient = (installationId) => {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: installationId,
    },
  });
  return octokit;
};
