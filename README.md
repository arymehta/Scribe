# Scribe ✒️

Dont you just **hate** writing documentation? Wouldnt you rather jump into the exciting bit - writing code instead of spending precious time at your job or in a hackathon writing that README.md? We sure felt that way!

This is why we decided to create: *Scribe*

#### Scribe -- is an easy to use github integration that automates documentation! 

## Steps to use Scribe:
1)  Go to the application page for scribe: ```https://github.com/apps/scribedoc```
2) Follow the instructions to install the app to any repo you like
3) Create an issue
4) Type in the following command in the issue description or any issue comment
```
@scribe doc <directory_path>
```
5) Watch as scribe gets to work!

(As a demo, check the [issues](https://github.com/arymehta/Scribe/issues/16) and documentation of Scribe itself [here](https://github.com/arymehta/Scribe/tree/main/src/utils), and [here](https://github.com/arymehta/Scribe/tree/main/src/controllers))

## Features
- Processes files *directory wise* for the following reasons:
    - Larger, more complex projects generally have directory specific documentation to prevent clutter 
- Creates and makes all its *changes on a separate branch* .
- Once done, commits on the branch at the *specified directory* and *opens a PR* (you can easily edit the contents before merging)
- Detects when a @docbot PR is closed and *deletes the extra branch*
- *Notifies the invoker* in a comment when the process is finished
- Only users with *proper write priviledges* can invoke scribe (This prevents any random user raising a request for documentation leading to wastefull requests)
- And -- * our favorite feature yet * -- the *".botconfig"* file. More on that later.

### NOTE
The bot **will not** mess with any user-owned branches or non-invoking comments


## .botconfig
1. Users can add a .botconfig file in the home directory of the repo to further customize the fiels to be included in the documentation.
2. This was inspired by git's .gitignore

Scribe's code has a list of default extentions that we thought should always be INCLUDED in documentation

[(click here for the full list)](https://github.com/arymehta/Scribe/blob/main/src/utils/includeList.js)
```js
export const initialArray = [
  // JavaScript / TypeScript
  "*.js",
  "*.ts",

  // Python
  "*.py",

  // Java & JVM
  "*.java",
  ...
```
However, if you decide that you want .html files as well... then create the .botconfig file in ```/``` and add: 

.botconfig
```
*.html
```
Thus, all files with html extension will be included

This works for specific file names as well -- 
```
Makefile
App.tsx
```
Will include those specific filenames aswell

This is really powerful as we can chain these together as well.
For example, if i want to EXclude all .jsx files (because frontend tends to get very large), but want to INCLUDE only App.jsx (for the route information) i can...
```
!.jsx
App.jsx
```
Much like .gitignore, it follows a top-down approach, meaning all ```.jsx``` files will be ignored, but ```App.jsx``` will be included in document generation.

Conversely: 
```
App.jsx
!.jsx
```

Here ```!.jsx```(exclude all jsx) overwrites the ```App.jsx``` (include App.jsx) and so all ```.jsx``` files are excuded.

```
*.jsx
!App.jsx
```
Includes all ```.jsx``` files except for ```App.jsx```

The .botconfig will also override the default contents
```
!*.py
```
will exclude all python files even if they are included by default

This allows the user to have complete controll over what goes for document generation and what dosent. We hope this provides the user with enough flexibility and controll over the bot functions!

## 🤝 Contributing

We welcome contributions from the community! If you'd like to help improve this project, follow the steps below to get started:

### 🛠️ Setup Instructions

1. **Fork this repository** and clone it locally:

   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/YOUR_FORK.git
   cd YOUR_FORK

   \`\`\`

2. Follow the instructions above to run the project locally

## 🙌 How to Contribute

- Create a new branch for your feature or bug fix:

\`\`\`bash
git checkout -b feature/your-feature-name
\`\`\`

- Make your changes and ensure everything works as expected.

- Commit your changes with a clear message:

\`\`\`bash
git commit -m "Add your message here"
\`\`\`

- Push your branch to your fork:

\`\`\`bash
git push origin feature/your-feature-name
\`\`\`

- Open a Pull Request from your branch to the main branch of the original repository.

- Describe your PR clearly — mention what you changed, why you did it, and any issues it closes.

- Any Improvements in UI/UX or color-schemes are encouraged as designing is not our forte.

## 💡 Tips for Contributing

- Make sure your code follows the project's coding standards.

- Add tests for new features or bug fixes.

- Document your code where necessary.

- Create clear, descriptive commit messages.


here are some of the areas we intend on improving for you to get started...

## Todo/Issues.

### The current approach involves passing the name of a directory to the chatbot in a specified format

##### The format looks like this - 
```ts
    @scribe <action> <path>
```

- However the above approach is limited to a sub-directory simply because LLM larger token size would mean higher cost.

## In Future there are a few approaches, which we read about 
- Clone the repo, creat a vector db for it and query. But cloning would mean that repo should be public so that looks like a limitation.
- Another apporach would be to go through sub directories and document each of them individually. Then finally append all of them together to parent directory.
- Third would be to keep docs for each sub dir seperate, a common practice in large code bases. (the route we took)


Made by [Hardik Mutha](https://github.com/HardikMutha) and [Aryan Mehta](https://github.com/arymehta)
