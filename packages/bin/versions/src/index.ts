import * as fsPromises from "fs/promises";
import * as childProcess from "child_process";
import * as util from "util";
import * as path from "path";
import { setOutput, setFailed, info } from "@actions/core";
import * as semver from "semver";

const exec = util.promisify(childProcess.exec);

type PackageJson = {
  name: string;
  version: string;
};

const outputKey = "output";

async function getRemoteNpmVersion(name: string): Promise<string | null> {
  try {
    const response = await exec(`npm view ${name} version --json`);
    if (response.stderr) throw response.stderr;
    return response.stdout;
  } catch (error) {
    return null;
  }
}

function isOutdated(a: string | null, b: string): boolean {
  if (!a) return true;
  if (a === b) return false;
  return semver.lt(a, b);
}

try {
  const maybePackagePaths = process.env.packages;
  if (!maybePackagePaths) {
    throw new Error(
      "Package file path not provided. Check the packages action was ran before this action and the env var packages' is set.",
    );
  }
  const workspacePaths = JSON.parse(maybePackagePaths);
  const outdated: string[] = [];
  for (const workspacePath of workspacePaths) {
    info(`Checking package "${workspacePath.split("/").pop()}"'s version`);
    const packagePath = path.join(workspacePath, "package.json");
    const file = await fsPromises.readFile(packagePath, {
      encoding: "utf-8",
    });
    const { name, version }: PackageJson = JSON.parse(file);
    const maybeVersion = await getRemoteNpmVersion(name);
    info(!maybeVersion ? "No Version found" : `Version ${maybeVersion} found`);
    if (isOutdated(maybeVersion, version)) {
      info(`Package "${name}" is outdate.`);
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
