import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import fs from 'fs';

export const createOctokitClient = (installationId) => {
  const privateKey = fs.readFileSync('/home/amehta/Desktop/DocBot/github-app-private-key.pem', 'utf8');
  // console.log(privateKey);
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey, // correct format with newlines preserved
      installationId,
    },
  });

  return octokit;
};
// createOctokitClient();