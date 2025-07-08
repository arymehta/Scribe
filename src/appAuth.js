import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import fs from "fs";
import path from "path";

export const createOctokitClient = (installationId) => {
  const filePath = path.join(__dirname, "github-app-private-key.pem");
  const privateKey = fs.readFileSync(filePath, "utf8");
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
// createOctokitClient();
