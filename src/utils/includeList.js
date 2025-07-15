import { getBaseBranch } from "./githubUtils.js";
import { botConfigFile } from "../constants/botNames.js";
export const initialArray = [
  // JavaScript / TypeScript
  "*.js",
  "*.ts",

  // Python
  "*.py",

  // Java & JVM
  "*.java",

  // C-family
  "*.c",
  "*.cpp",
  "*.cc",
  "*.h",
  "*.hpp",

  // Go
  "*.go",

  // Rust
  "*.rs",

  // Ruby
  "*.rb",

  // PHP
  "*.php",

  // C#
  "*.cs",

  // Swift / Objective-C
  "*.swift",

  // Dart
  "*.dart",

  // SQL / DB scripts
  "*.sql",
  "*.pgsql",

  // Template Engines
  "*.ejs",
  "*.hbs",

  // Web logic
  "*.vue",

  // Misc
  "*.make",
  "Makefile",
  "Dockerfile",
  "pyproject.toml",

  "!.botignore",
];

export const updateIncludeList = async (req, octokitClient) => {
  const botIncludeArray = await getIncludeList(req, octokitClient);
  const finalAnswer = [...initialArray, ...botIncludeArray];
  return finalAnswer;
};

const getIncludeList = async (req, octokitClient) => {
  console.log(`Reading ${botConfigFile}`);
  try {
    const repo = req?.body?.repository;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;
    const response = await octokitClient.rest.repos.getContent({
      owner: owner,
      repo: repoName,
      path: botConfigFile,
      ref: await getBaseBranch(octokitClient, owner, repoName),
    });

    const content = Buffer.from(response.data.content, "base64").toString("utf-8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  } catch (err) {
    console.log(`No ${botConfigFile} found! Sticking to defaults`);
    return [];
  }
};
