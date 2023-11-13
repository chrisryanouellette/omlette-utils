import * as childProcess from "child_process";
import * as util from "util";
import { setFailed, info } from "@actions/core";

const exec = util.promisify(childProcess.exec);

try {
  const maybePackagePaths = process.env.packages;
  if (!maybePackagePaths) {
    throw new Error(
      "Package file path not provided. Check the packages action was ran before this action and the env var packages' is set.",
    );
  }
  const packages: string[] = JSON.parse(maybePackagePaths);
  for (const name of packages) {
    info(`Deploying "${name}"...`);
    await exec(`yarn nx run ${name}:deploy`);
  }
  info(`Successfully deployed ${packages.length} packages(s)`);
} catch (error) {
  if (error instanceof Error) {
    setFailed(error.message);
  } else {
    setFailed(`Unknown Error: ${JSON.stringify(error)}`);
  }
}
