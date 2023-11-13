import * as fsPromises from "fs/promises";
import * as path from "path";
import * as url from "url";
import { setFailed } from "@actions/core";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../../../../.npmrc");

try {
  const content = `//registry.npmjs.org/:_authToken=${process.env.token}
registry=https://registry.npmjs.org/
always-auth=true`;
  await fsPromises.writeFile(root, content);
} catch (error) {
  if (error instanceof Error) {
    setFailed(error.message);
  } else {
    setFailed(`Unknown Error: ${JSON.stringify(error)}`);
  }
}
