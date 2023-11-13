import * as fsPromises from "fs/promises";
import * as childProcess from "child_process";
import * as util from "util";
import { getInput, setOutput, setFailed, info } from "@actions/core";
import * as semver from "semver";

const exec = util.promisify(childProcess.exec);

type PackageJson = {
  name: string;
  version: string;
};

const inputKey = "steps.packages.outputs.output";
const outputKey = "versions";

async function getRemoteNpmVersion(name: string): Promise<string | null> {
  try {
    const response = await exec(`npm view ${name} version --json`);
    if (response.stderr) throw response.stderr;
    return response.stdout;
  } catch (error) {
    return null;
  }
}

try {
  info(getInput("steps.packages"));
  info(getInput("packages"));
  info(getInput(inputKey));
  const maybePackagePaths = getInput(inputKey);
  if (!maybePackagePaths) {
    throw new Error("Package file path not provided. Check the matrix setup");
  }
  const packagePaths = JSON.parse(maybePackagePaths);
  const outdated: string[] = [];
  for (const packagePath of packagePaths) {
    const file = await fsPromises.readFile(packagePath, {
      encoding: "utf-8",
    });
    const { name, version }: PackageJson = JSON.parse(file);
    const maybeVersion = await getRemoteNpmVersion(name);
    if (!maybeVersion || semver.lt(maybeVersion, version)) {
      outdated.push(name);
    }
  }
  setOutput(outputKey, outdated);
} catch (error) {
  if (error instanceof Error) {
    setFailed(error.message);
  } else {
    setFailed(`Unknown Error: ${JSON.stringify(error)}`);
  }
}
