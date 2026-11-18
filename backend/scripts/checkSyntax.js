const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const ignoredDirs = new Set(["node_modules", "uploads"]);

const findJavaScriptFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...findJavaScriptFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
};

const files = findJavaScriptFiles(rootDir);
let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    failed = true;
    process.stderr.write(result.stderr || result.stdout || result.error?.message || `Syntax check failed: ${file}\n`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} backend files.`);
