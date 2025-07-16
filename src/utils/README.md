# Overview

This project is designed to automate the generation of documentation for GitHub repositories. It interacts with the GitHub API via Octokit to manage repository branches, commits, and pull requests. The primary audience is developers looking to enhance their workflow by generating documentation easily. The project features functions for retrieving repository details, creating and managing branches, generating documentation files, and commenting on issues.

## Features

- Fetch the base branch of a repository.
- Retrieve the latest commit SHA from a specified branch.
- Create new branches and documents within a repository.
- Manage commits and pull requests automatically.
- Parse directories and files in the repository, based on specified inclusion patterns.


# Function/Class Documentation

## getBaseBranch

- **Purpose:** Fetches the default branch of a specified GitHub repository.
- **Parameters:**
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
    - `owner` (`string`): GitHub username or organization name.
    - `repoName` (`string`): Name of the repository.
- **Return Type:** `Promise<string | undefined>` - Name of the default branch or undefined in case of error.
- **Inline Comments:**
    - Retrieves repository data using the GitHub API's `repos.get` method.
- **Snippet:**
```javascript
export const getBaseBranch = async (octokitClient, owner, repoName) => {
```

## getLatestCommitSHA

- **Purpose:** Fetches the SHA of the latest commit from a specified branch.
- **Parameters:**
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
    - `owner` (`string`): GitHub username or organization name.
    - `repoName` (`string`): Name of the repository.
    - `baseBranch` (`string`): Base branch from which to fetch the latest commit.
- **Return Type:** `Promise<string | undefined>` - SHA of the latest commit or undefined if an error occurs.
- **Inline Comments:**
    - Uses the `git.getRef` API method to get reference data for the specified branch.
- **Snippet:**
```javascript
export const getLatestCommitSHA = async (octokitClient, owner, repoName, baseBranch) => {
```

## creatingNewBranch

- **Purpose:** Creates a new branch off the current commit SHA.
- **Parameters:**
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
    - `owner` (`string`): GitHub username or organization name.
    - `repoName` (`string`): Name of the repository.
    - `newBranchName` (`string`): Name for the new branch to be created.
    - `commitSha` (`string`): SHA of the commit from which to branch off.
- **Return Type:** `Promise<string | undefined>` - SHA of the new branch or undefined if an error occurs.
- **Inline Comments:**
    - Calls the `git.createRef` API method to create a new branch reference.
- **Snippet:**
```javascript
export const creatingNewBranch = async (octokitClient, owner, repoName, newBranchName, commitSha) => {
```

## createDocument

- **Purpose:** Creates a document (blob) to be committed to a repository.
- **Parameters:**
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
    - `owner` (`string`): GitHub username or organization name.
    - `repoName` (`string`): Name of the repository.
    - `docContent` (`string`): Content of the document; defaults to "Default value".
- **Return Type:** `Promise<object>` - Data representing the created blob.
- **Inline Comments:**
    - Uses the `git.createBlob` API to create a new blob with the specified content.
- **Snippet:**
```javascript
export const createDocument = async (octokitClient, owner, repoName, docContent = "Default value") => {
```

## createTree

- **Purpose:** Creates a new tree in the GitHub repository.
- **Parameters:**
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
    - `owner` (`string`): GitHub username or organization name.
    - `repoName` (`string`): Name of the repository.
    - `newTreeSha` (`string`): SHA of the base tree.
    - `blobData` (`object`): Data of the blob to be included in the tree.
    - `path` (`string`): The path where the new file resides.
- **Return Type:** `Promise<object>` - New tree object data.
- **Inline Comments:**
    - Calls `git.createTree` to create a tree comprising a single file.
- **Snippet:**
```javascript
export const createTree = async (octokitClient, owner, repoName, newTreeSha, blobData, path) => {
```

## createPR

- **Purpose:** Creates a pull request for the newly created branch.
- **Parameters:**
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
    - `owner` (`string`): GitHub username or organization name.
    - `repoName` (`string`): Name of the repository.
    - `issueNumber` (`number`): The associated issue number.
    - `newBranchName` (`string`): The name of the new branch.
    - `baseBranch` (`string`): The branch against which the new branch will be merged.
    - `title` (`string`): Title for the pull request; defaults to "Dummy Title".
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Utilizes the `pulls.create` API for creating the pull request.
- **Snippet:**
```javascript
export const createPR = async (octokitClient, owner, repoName, issueNumber, newBranchName, baseBranch, title = "Dummy Title") => {
```

## createCommit

- **Purpose:** Handles the full process of creating a commit in response to a request.
- **Parameters:**
    - `req` (`object`): Incoming request object.
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
    - `docContent` (`string`): The content for the documentation to be committed.
    - `path` (`string`): Optional path for the documentation file.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Orchestrates calls to get base branch, latest commit SHA, create document, and create pull request.
- **Snippet:**
```javascript
export const createCommit = async (req, octokitClient, docContent, path = "") => {
```

## detectMergePR

- **Purpose:** Detects when a pull request has been closed or merged, and deletes the associated branch if it was created by this bot.
- **Parameters:**
    - `req` (`object`): Incoming request object.
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Analyzes the event and action from the incoming request headers to determine if it matches the criteria for branch deletion.
- **Snippet:**
```javascript
export const detectMergePR = async (req, octokitClient) => {
```

## commentOnIssue

- **Purpose:** Posts a comment on a specified issue.
- **Parameters:**
    - `req` (`object`): Incoming request object.
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
    - `commentMessage` (`string`): Optional message to include; defaults to a standard message.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Retrieves issue and repository information to post the comment via the `issues.createComment` API.
- **Snippet:**
```javascript
export const commentOnIssue = async (req, octokitClient, commentMessage = defaultCommentMessage) => {
```

## checkPermissions

- **Purpose:** Checks if the user has the necessary permissions to perform certain actions on the repository.
- **Parameters:**
    - `req` (`object`): Incoming request object.
    - `octokitClient` (`object`): Instance of Octokit for making API calls.
- **Return Type:** `Promise<boolean>` - Returns true if the user has `admin` or `write` access, false otherwise.
- **Inline Comments:**
    - Uses the `repos.getCollaboratorPermissionLevel` API method to check user permissions.
- **Snippet:**
```javascript
export const checkPermissions = async (req, octokitClient) => {
```

# Dependencies

- **@octokit/rest:** A library to interact with the GitHub API.
    - *Assumption:* This library is utilized throughout the project for making authenticated API requests.

- **minimatch:** A utility for matching file paths based on keywords.
    - *Assumption:* Used within `includeList.js` to assess a set of file patterns for inclusion or exclusion.

- **Buffer:** Native Node.js class for handling binary data.
    - *Assumption:* Used to decode the base64 content of files from GitHub API responses.

# Development Setup

To set up the development environment, the following steps are required:

1. Ensure that **Node.js** is installed on your machine.
2. Install necessary dependencies using npm:
```bash
npm install @octokit/rest minimatch
```
3. Obtain a GitHub API token and configure it within your app using `createOctokitClient(installationId)`.

# Notes

- Several functions rely on external modules and APIs, and they are inferred based on their usage. It is necessary to validate their availability in your project setup.
- No dedicated deployment or environment configuration files were supplied; ensure your project adheres to best practices for environment variables and API token management when deploying.