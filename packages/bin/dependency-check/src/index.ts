import * as fsPromises from "fs/promises";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as semver from "semver";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const packagesDir = path.join(__dirname, "../../../");

type PackageJson = {
  name: string;
  version: string;
  dependencies?: {
    [index: string]: string;
  };
  scripts?: {
    deploy?: string;
  };
};

type PackageVersions = { [index: string]: semver.SemVer };

/** Gets all the packages in the monorepo */
async function search(sources: fs.Dirent[]): Promise<string[]> {
  const results: string[] = [];
  for (const src of sources) {
    if (!src.isDirectory()) continue;
    const dirPath = path.join(src.path, src.name);
    const packageJsonPath = path.join(dirPath, "./package.json");
    if (!fs.existsSync(packageJsonPath)) {
      const subDir = await fsPromises.readdir(dirPath, { withFileTypes: true });
      results.push(...(await search(subDir)));
    } else {
      results.push(dirPath);
    }
  }
  return results;
}

/** Parses and returns all the deployable package.json files */
async function parse(directories: string[]): Promise<PackageJson[]> {
  const packages: PackageJson[] = [];
  for (const dir of directories) {
    const packageJsonPath = path.join(dir, "./package.json");
    if (!fs.existsSync(packageJsonPath)) continue;
    const file = await fsPromises.readFile(packageJsonPath, {
      encoding: "utf-8",
    });
    const json: PackageJson = JSON.parse(file);
    if (!json.scripts?.deploy) continue;
    packages.push(json);
  }

  return packages;
}

/** Returns the version for each package */
function getVersions(files: PackageJson[]): PackageVersions {
  const latest: PackageVersions = {};
  for (const file of files) {
    const result = semver.parse(file.version);
    if (!result) continue;
    latest[file.name] = result;
  }
  return latest;
}

function audit(files: PackageJson[], version: PackageVersions): string[] {
  const outdated: string[] = [];
  for (const file of files) {
    if (!file.dependencies) continue;
    for (const dep of Object.keys(file.dependencies)) {
      if (!dep.startsWith("@ouellettec")) continue;
      const parsed = file.dependencies[dep].replace(/[\^~]/, "");
      const latest = version[dep];
      try {
        const result = semver.compare(latest, parsed);
        if (result === 0) continue;
        outdated.push(
          `\n\tPackage: "${file.name}"\n\tIssue: "${dep}"\n\tVersion: ${latest}`,
        );
      } catch (error) {
        console.error(
          `Unable to parse package "${dep}" when looking at ${file.name}\n`,
          `Parsed ${parsed}, Latest ${latest}\n`,
          error,
        );
        process.exit(1);
      }
    }
  }
  return outdated;
}

try {
  const output = await fsPromises.readdir(packagesDir, { withFileTypes: true });
  const directories = await search(output);
  const packages = await parse(directories);
  const versions = getVersions(packages);
  const results = audit(packages, versions);
  results.forEach((i) => console.error(`\x1b[41m ERROR \x1b[0m ${i}`));
  if (results.length) process.exit(1);
} catch (error) {
  console.error(error);
  process.exit(1);
}
