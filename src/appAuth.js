import { createAppAuth } from "@octokit/auth-app";
import dotenv from "dotenv";
dotenv.config();
import { Octokit } from "@octokit/rest";

const auth = createAppAuth({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  clientId: process.env.CLIENT_ID,
});

const fetchData = async () => {
  const appAuthentication = await auth({ type: "app" });
  console.log(appAuthentication);
};

fetchData();
