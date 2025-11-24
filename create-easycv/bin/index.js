#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const DEFAULT_REPO = "https://github.com/syifan/easycv.git";
const DEFAULT_REF = process.env.EASYCV_TEMPLATE_REF || "main";

function showHelp() {
  const help = `\nUsage: create-easycv [project-directory] [options]\n\nOptions:\n  -h, --help          Show this help message\n  -f, --force         Allow using a non-empty target directory\n  -r, --repo <repo>   Use a different template repository (owner/name or git url)\n      --ref <ref>     Checkout a specific branch, tag, or commit\n\nExamples:\n  npx create-easycv my-cv\n  npx create-easycv . --force\n  npx create-easycv phd-site --ref v0.1.0\n`;
  console.log(help);
}

function parseArgs(argv) {
  const options = {
    dir: undefined,
    repo: DEFAULT_REPO,
    ref: undefined,
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        showHelp();
        process.exit(0);
        break;
      case "-f":
      case "--force":
        options.force = true;
        break;
      case "-r":
      case "--repo": {
        const value = argv[i + 1];
        if (!value) {
          throw new Error("Missing value for --repo");
        }
        options.repo = normalizeRepo(value);
        i += 1;
        break;
      }
      case "--ref": {
        const refValue = argv[i + 1];
        if (!refValue) {
          throw new Error("Missing value for --ref");
        }
        options.ref = refValue;
        i += 1;
        break;
      }
      default:
        if (!options.dir) {
          options.dir = arg;
        } else {
          throw new Error(`Unknown argument: ${arg}`);
        }
        break;
    }
  }

  return options;
}

function normalizeRepo(input) {
  if (/^https?:\/\//i.test(input) || /^git@/.test(input)) {
    return input;
  }

  if (/^[\w.-]+\/[\w.-]+$/.test(input)) {
    return `https://github.com/${input}.git`;
  }

  return input;
}

function ensureGitAvailable() {
  const result = spawnSync("git", ["--version"], { stdio: "ignore" });
  if (result.status !== 0) {
    throw new Error(
      "Git is required to download the EasyCV template. Please install git and try again."
    );
  }
}

function ensureTargetDirectory(targetDir, force) {
  if (!fs.existsSync(targetDir)) {
    return;
  }

  const entries = fs
    .readdirSync(targetDir)
    .filter((entry) => entry !== ".DS_Store");
  if (entries.length === 0) {
    return;
  }

  if (!force) {
    throw new Error("Target directory is not empty. Use --force to continue.");
  }
}

function cloneTemplate(repo, ref, tempDir) {
  const cloneArgs = ["clone", "--depth=1"];

  if (ref) {
    cloneArgs.push("--branch", ref);
  } else if (repo === DEFAULT_REPO && DEFAULT_REF) {
    cloneArgs.push("--branch", DEFAULT_REF);
  }

  cloneArgs.push(repo, tempDir);

  const result = spawnSync("git", cloneArgs, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error("Failed to download EasyCV from git.");
  }
}

function removeIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function cleanupClone(tempDir) {
  const stale = [
    ".git",
    "node_modules",
    "build",
    "dist",
    "easycv-0.1.0.tgz",
    "create-easycv",
  ];
  stale.forEach((entry) => removeIfExists(path.join(tempDir, entry)));
}

function copyTemplate(tempDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(tempDir, targetDir, { recursive: true });
}

function updatePackageName(targetDir, dirInput) {
  const pkgPath = path.join(targetDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const slug = makePackageName(
    path.basename(path.resolve(targetDir)),
    dirInput
  );
  pkg.name = slug;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function makePackageName(dirBase, originalInput) {
  if (originalInput === "." || originalInput === "./") {
    return sanitizeName(dirBase);
  }
  return sanitizeName(originalInput);
}

function sanitizeName(raw) {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  return cleaned || "easycv-app";
}

function printNextSteps(relativeDir, reusedDir) {
  const dirInstruction = reusedDir ? "" : `  cd ${relativeDir}\n`;
  console.log("\nNext steps:\n");
  process.stdout.write(dirInstruction);
  console.log("  npm install");
  console.log("  npm start\n");
  console.log("Happy shipping!");
}

function resolveTargetDir(input) {
  if (!input || input === "." || input === "./") {
    return process.cwd();
  }
  return path.resolve(process.cwd(), input);
}

function main() {
  try {
    ensureGitAvailable();
    const options = parseArgs(process.argv.slice(2));
    const dirInput = options.dir || "easycv-app";
    const targetDir = resolveTargetDir(dirInput);
    const usedCurrentDir = dirInput === "." || dirInput === "./";

    ensureTargetDirectory(targetDir, options.force);

    console.log("Downloading EasyCV template...");
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "easycv-"));

    try {
      cloneTemplate(options.repo, options.ref, tempDir);
      cleanupClone(tempDir);
      console.log("Copying project files...");
      copyTemplate(tempDir, targetDir);
      updatePackageName(targetDir, dirInput);
    } finally {
      removeIfExists(tempDir);
    }

    const relativeDir = usedCurrentDir
      ? "."
      : path.relative(process.cwd(), targetDir) || dirInput;
    console.log("EasyCV is ready!");
    printNextSteps(relativeDir || dirInput, usedCurrentDir);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main();
