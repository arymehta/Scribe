import { botName } from "../constants/botNames.js";
export const checkCommandFormat = (body) => {
  const pattern = new RegExp(`^${botName}\\s+(doc|fix|refactor|explain)\\s+(.+)$`, "i");
  const match = body?.match(pattern);
  return match;
};

export const formatPath = (command) => {
  const action = command[1]?.toLowerCase();
  const path = command[2];
  const safePath = path?.replace(/^\/+|^\.\/*|\/+$/g, "");
  return [action, safePath];
};
