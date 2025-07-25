import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { RouteWebhookRequest } from "./src/controllers/webhookController.js";

const app = express();
app.use(bodyParser.json());
app.use(express.json());

app.post("/webhook", RouteWebhookRequest);

app.get("/", (req, res) => {
  return res.json({ msg: "AM HERE!" });
});

app.listen(process.env.PORT, () => {
  console.log(`Docbot is running at http://localhost:${process.env.PORT}`);
});
