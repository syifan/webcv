#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const readline = require("readline");

const DEFAULT_REPO = "https://github.com/syifan/easycv.git";
// Keep in sync with the root easycv package version
const EASYCV_VERSION = "0.3.2";
const EASYCV_VERSION_RANGE = `^${EASYCV_VERSION}`;
const DEFAULT_REF = process.env.EASYCV_TEMPLATE_REF || `v${EASYCV_VERSION}`;
const TEMPLATES = {
  vanilla: {
    label: "Vanilla JS",
    path: path.join("example", "vanilla"),
  },
  react: {
    label: "React",
    path: path.join("example", "react"),
  },
};

function showHelp() {
  const help = `\nUsage: create-easycv [project-directory] [options]\n\nOptions:\n  -h, --help            Show this help message\n  -f, --force           Allow using a non-empty target directory\n  -r, --repo <repo>     Use a different template repository (owner/name or git url)\n      --ref <ref>       Checkout a specific branch, tag, or commit\n  -t, --template <name> Choose a template (vanilla or react). Prompts if omitted.\n\nExamples:\n  npx create-easycv my-cv\n  npx create-easycv . --force\n  npx create-easycv phd-site --ref v0.1.0\n  npx create-easycv demo --template react\n`;
  console.log(help);
}

function parseArgs(argv) {
  const options = {
    dir: undefined,
    repo: DEFAULT_REPO,
    ref: undefined,
    force: false,
    template: undefined,
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
      case "-t":
      case "--template": {
        const templateValue = argv[i + 1];
        if (!templateValue) {
          throw new Error("Missing value for --template");
        }
        options.template = templateValue;
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

function normalizeTemplate(input) {
  if (!input) return undefined;

  const value = input.toLowerCase();
  if (["vanilla", "vanilla-js", "vanillajs", "js"].includes(value)) {
    return "vanilla";
  }
  if (value === "react") {
    return "react";
  }

  throw new Error('Template must be "vanilla" or "react".');
}

function selectTemplate(preference) {
  const normalized = normalizeTemplate(preference);
  if (normalized) {
    return Promise.resolve(normalized);
  }

  if (!process.stdin.isTTY) {
    return Promise.resolve("vanilla");
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("\nChoose a template:");
    console.log("  1) Vanilla JS");
    console.log("  2) React");
    rl.question("Enter 1 or 2 [1]: ", (answer) => {
      rl.close();
      const normalizedAnswer = answer.trim();
      if (
        normalizedAnswer === "2" ||
        normalizedAnswer.toLowerCase() === "react"
      ) {
        resolve("react");
      } else {
        resolve("vanilla");
      }
    });
  });
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

function resolveTemplatePath(tempDir, template) {
  const templateMeta = TEMPLATES[template];
  if (!templateMeta) {
    throw new Error(`Unknown template "${template}".`);
  }
  return path.join(tempDir, templateMeta.path);
}

function copyTemplate(sourceDir, targetDir) {
  const skipEntries = new Set(["node_modules", "dist", ".DS_Store"]);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(sourceDir, targetDir, {
    recursive: true,
    dereference: true,
    filter: (src) => {
      const rel = path.relative(sourceDir, src);
      if (!rel) return true;

      const parts = rel.split(path.sep);
      return !parts.some((part) => skipEntries.has(part));
    },
  });
}

function allowPackageLock(targetDir) {
  const gitignorePath = path.join(targetDir, ".gitignore");
  if (!fs.existsSync(gitignorePath)) return;

  const content = fs.readFileSync(gitignorePath, "utf8");
  const lines = content.split(/\r?\n/);
  const filtered = lines.filter((line) => line.trim() !== "package-lock.json");

  if (filtered.length !== lines.length) {
    fs.writeFileSync(gitignorePath, `${filtered.join("\n")}\n`);
  }
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

function dropPackageLock(targetDir) {
  const lockPath = path.join(targetDir, "package-lock.json");
  if (fs.existsSync(lockPath)) {
    fs.rmSync(lockPath, { force: true });
  }
}

function normalizeEasycvDependency(targetDir) {
  const pkgPath = path.join(targetDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const sections = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ];

  let changed = false;
  for (const section of sections) {
    const deps = pkg[section];
    if (
      deps &&
      typeof deps.easycv === "string" &&
      deps.easycv.startsWith("file:")
    ) {
      deps.easycv = EASYCV_VERSION_RANGE;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    dropPackageLock(targetDir);
  }
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
  console.log("  npm run dev\n");
  console.log("Happy shipping!");
}

function resolveTargetDir(input) {
  if (!input || input === "." || input === "./") {
    return process.cwd();
  }
  return path.resolve(process.cwd(), input);
}

async function main() {
  try {
    ensureGitAvailable();
    const options = parseArgs(process.argv.slice(2));
    const dirInput = options.dir || "easycv-app";
    const targetDir = resolveTargetDir(dirInput);
    const usedCurrentDir = dirInput === "." || dirInput === "./";

    ensureTargetDirectory(targetDir, options.force);

    const template = await selectTemplate(options.template);
    console.log("Downloading EasyCV template...");
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "easycv-"));

    try {
      cloneTemplate(options.repo, options.ref, tempDir);
      const templateDir = resolveTemplatePath(tempDir, template);
      if (!fs.existsSync(templateDir)) {
        throw new Error(
          `Template folder "${templateDir}" not found. Make sure the repo contains example templates.`
        );
      }

      console.log(`Copying ${TEMPLATES[template].label} project files...`);
      copyTemplate(templateDir, targetDir);
      allowPackageLock(targetDir);
      updatePackageName(targetDir, dirInput);
      normalizeEasycvDependency(targetDir);
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
