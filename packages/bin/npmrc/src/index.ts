import * as fsPromises from "fs/promises";
import * as path from "path";
import { setFailed } from "@actions/core";

const content = `//registry.npmjs.org/:_authToken=${process.env.token}
registry=https://registry.npmjs.org/
always-auth=true`;

try {
  const maybePackagePaths = process.env.packages;
  if (!maybePackagePaths) {
    throw new Error(
      "Package file path not provided. Check the packages action was ran before this action and the env var packages' is set.",
    );
  }
  const workspacePaths = JSON.parse(maybePackagePaths);
  for (const workspacePath of workspacePaths) {
    const filePath = path.join(workspacePath, ".npmrc");
    await fsPromises.writeFile(filePath, content);
  }
} catch (error) {
  if (error instanceof Error) {
    setFailed(error.message);
  } else {
    setFailed(`Unknown Error: ${JSON.stringify(error)}`);
  }
}
