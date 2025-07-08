// index.js
import ray from 'ray-js';
import { json } from 'ray-body-parser';
import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';
import fs from 'fs';
import 'dotenv/config';

const app = ray();
app.use(json());

const APP_ID = process.env.APP_ID;
const PRIVATE_KEY = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const githubApp = new App({
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhooks: {
    secret: WEBHOOK_SECRET,
  },
});

// Handle webhook
app.post('/webhook', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);

  const computed = `sha256=${crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed))) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.headers['x-github-event'];
  const body = req.body;

  if (event === 'issue_comment' && body.comment.body.includes('@docbot generate docs')) {
    const installationId = body.installation.id;
    const token = await githubApp.getInstallationAccessToken({ installationId });
    const octokit = new Octokit({ auth: token });

    const owner = body.repository.owner.login;
    const repo = body.repository.name;
    const issue_number = body.issue.number;

    // Example: read files from `src/` directory
    const dir = 'src';
    const files = await octokit.repos.getContent({ owner, repo, path: dir });

    let result = '';
    for (const file of files.data) {
      if (file.type === 'file' && file.name.endsWith('.js')) {
        const contentData = await octokit.repos.getContent({ owner, repo, path: file.path });
        const code = Buffer.from(contentData.data.content, 'base64').toString();
        const doc = summarizeCode(code); // Replace with real logic or OpenAI call
        result += `### ${file.name}\n${doc}\n\n`;
      }
    }

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number,
      body: `📄 Generated Docs:\n\n${result}`,
    });
  }

  res.send('OK');
});

function summarizeCode(code) {
  // TODO: Replace with GPT/OpenAI or AST analysis
  return `This file defines ${code.split('\n').length} lines of JS code.`;
}

app.listen(3000, () => {
  console.log('🚀 GitHub Docbot running on http://localhost:3000');
});
