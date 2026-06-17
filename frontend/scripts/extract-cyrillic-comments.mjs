import fs from "fs";
import path from "path";

const root = path.resolve("src");
const exts = new Set([".js", ".jsx", ".scss"]);
const lines = new Set();

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!exts.has(path.extname(entry.name))) {
      continue;
    }
    const text = fs.readFileSync(fullPath, "utf8");
    for (const line of text.split("\n")) {
      if (/[а-яА-ЯіїєІЇЄ]/.test(line) && /\/\*|\/\/|\*\s/.test(line)) {
        lines.add(line.trim());
      }
    }
  }
};

walk(root);
process.stdout.write([...lines].sort().join("\n"));
