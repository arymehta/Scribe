import { getBaseBranch } from "./githubUtils.js";

export const initialArray = [
  // JavaScript / TypeScript
  "*.js",
  "*.ts",

  // Python
  "*.py",

  // Java & JVM
  "*.java",
  "*.scala",

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

  // Ruby & Crystal
  "*.rb",
  "*.cr",

  // PHP
  "*.php",
  "*.phtml",

  // C#
  "*.cs",

  // Swift / Objective-C
  "*.swift",
  "*.m",
  "*.mm",

  // Dart
  "*.dart",

  // SQL / DB scripts
  "*.sql",
  "*.psql",
  "*.pgsql",

  // Template Engines
  "*.ejs",
  "*.hbs",

  // Web logic
  "*.vue",
  "*.svelte",

  // Misc
  "*.make",
  "Makefile",
  "Dockerfile",
  "build.gradle",
  "Cargo.toml",
  "pyproject.toml",
];

const getIncludeList = async (req, octokitClient) => {
  console.log("Reading .botignore");
  try {
    const repo = req?.body?.repository;
    const owner = repo?.owner?.login;
    const repoName = repo?.name;
    const response = await octokitClient.rest.repos.getContent({
      owner: owner,
      repo: repoName,
      path: ".botinclude",
      ref: await getBaseBranch(octokitClient, owner, repoName),
    });
    const content = Buffer.from(response.data.content, "base64").toString("utf-8").split("\n");
    return content;
  } catch (err) {
    
    console.log(err);
    return [];
  }
};

export const updateIncludeList = async (req, octokitClient) => {
  const botIncludeArray = await getIncludeList(req, octokitClient);
  const finalAnswer = [...initialArray, ...botIncludeArray];
  return finalAnswer;
};
