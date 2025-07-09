import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { commentOnIssue, createCommit } from "./src/controllers/webhookController.js";
import { SystemPrompt } from "./src/prompts/issuePrompt.js";

const app = express();
app.use(bodyParser.json());
app.use(express.json());

app.post("/webhook", commentOnIssue);
// app.post("/webhook", createCommit);

app.get("/", (req, res) => {
  return res.json({ msg: "AM HERE!" });
});

app.listen(process.env.PORT, () => {
  console.log(`Docbot is running at http://localhost:${process.env.PORT}`);
});
