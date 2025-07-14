import { getBaseBranch } from "./githubUtils";

export const initialArray = [
  // JavaScript / TypeScript
  ".js",
  ".jsx",
  ".ts",
  ".tsx",

  // Python
  ".py",

  // Java & JVM
  ".java",
  ".kt",
  ".kts",
  ".scala",
  ".groovy",

  // C-family
  ".c",
  ".cpp",
  ".cc",
  ".h",
  ".hpp",
  ".hxx",
  ".cxx",

  // Go
  ".go",

  // Rust
  ".rs",

  // Ruby & Crystal
  ".rb",
  ".cr",

  // PHP
  ".php",
  ".phtml",

  // C#
  ".cs",

  // Swift / Objective-C
  ".swift",
  ".m",
  ".mm",

  // Dart
  ".dart",

  // Haskell & functional
  ".hs",
  ".lhs",
  ".ml",
  ".mli",
  ".clj",
  ".cljs",
  ".fs",
  ".fsi",
  ".ex",
  ".exs",

  // Shell / Bash / CLI
  ".sh",
  ".bash",
  ".zsh",
  ".fish",

  // SQL / DB scripts
  ".sql",
  ".psql",
  ".pgsql",

  // Template Engines
  ".ejs",
  ".hbs",
  ".pug",
  ".mustache",
  ".twig",
  ".njk",
  ".liquid",

  // Web logic
  ".vue",
  ".svelte",

  // Infrastructure as Code
  ".tf",
  ".tfvars",
  ".cue",

  // Misc
  ".make",
  ".mk",
  ".nix",
  ".re",
  ".res",
  ".elm",
  "Makefile",
  "Dockerfile",
  "Procfile",
  "Jenkinsfile",
  "Vagrantfile",
  "build.gradle",
  "gradle.kts",
  "Cargo.toml",
  "pyproject.toml",
  "justfile",
  "Rakefile",
  "mix.exs",
  "Dune",
];

export const updateIncludeList = async (req, octokitClient) => {
  const botIncludeArray = await getIncludeList(req, octokitClient);
  const finalAnswer = [...initialArray, ...botIncludeArray];
  return finalAnswer;
};

export const getIncludeList = async (req, octokitClient) => {
  try {
    const response = await octokitClient.rest.repos.getContent({
      owner,
      repo: repoName,
      path: ".botinclude",
      ref: await getBaseBranch(octokitClient, req?.owner?.login, req?.body?.repository?.name),
    });
    const finalAnswer = response?.split("\n");
    return finalAnswer;
  } catch (err) {
    return [];
  }
};
