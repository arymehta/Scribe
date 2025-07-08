import express from 'express';
import bodyParser from 'body-parser';
import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';
import fs from 'fs';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());

const APP_ID = process.env.APP_ID;
// const PRIVATE_KEY = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const PRIVATE_KEY = process.env.PRIVATE_KEY
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;


const githubApp = new App({
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhooks: {
    secret: WEBHOOK_SECRET,
  },
});

app.listen(3000, () => {
  console.log('Docbot is running at http://localhost:3000');
});

app.post("/webhook", (req, res) =>{
    console.log(req?.body)
    return res.json({msg: "Webhook post request recieved!"})
})

app.get("/", (req, res)=>{
    return res.json({msg:"AM HERE!"})
})
