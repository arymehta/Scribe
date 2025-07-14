export const botName = "@bot";
export const APP_NAME = process.env.APP_NAME;
export const invalidCommandFormat =
  `Invalid command format. Use one of the following:\n\n` +
  `\`\`\`\n` +
  `${botName} doc <path>\n` +
  `${botName} fix <path>\n` +
  `${botName}  refactor <path>\n` +
  `${botName} explain <path>\n` +
  `\`\`\``;


export const invalidPermissions = `Sorry, this request cannot be processed because you do not have sufficient permissions on this repository. 
Only users with write or admin access can request documentation generation with ${botName}.`;

export const generationSuccess = "Documentation created Successfully";
