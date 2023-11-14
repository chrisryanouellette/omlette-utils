import * as fsPromises from "fs/promises";
import * as childProcess from "child_process";
import * as util from "util";
import * as path from "path";
import { setOutput, setFailed, info, error as logError } from "@actions/core";
import * as semver from "semver";

const exec = util.promisify(childProcess.exec);

type PackageJson = {
  name: string;
  version: string;
};

const outputKey = "output";

async function getRemoteNpmVersion(name: string): Promise<string | null> {
  try {
    const response = await exec(`yarn info ${name} version --json`);
    if (response.stderr) throw response.stderr;
    return JSON.parse(response.stdout).data;
  } catch (error) {
    if (error instanceof Error) {
      logError(error);
    } else {
      logError(`Unknown Error: ${JSON.stringify(error)}`);
    }
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
    const packagePath = path.join(workspacePath, "package.json");
    const file = await fsPromises.readFile(packagePath, {
      encoding: "utf-8",
    });
    const { name, version }: PackageJson = JSON.parse(file);
    info(`Checking package "${name}"'s version`);
    const maybeVersion = await getRemoteNpmVersion(name);
    info(!maybeVersion ? "No Version found" : `Version ${maybeVersion} found`);
    if (isOutdated(maybeVersion, version)) {
      info(`Package "${name}" is outdate.`);
      outdated.push(name);
    } else {
      info(`Skipping, version ${maybeVersion} found, local version ${version}`);
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
