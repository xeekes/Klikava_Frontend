import fs from "fs";
import path from "path";

const ROOT = path.resolve("src");
const CACHE_PATH = path.resolve("scripts/comment-translation-cache.json");
const EXTS = new Set([".js", ".jsx", ".scss"]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadCache = () => {
  if (!fs.existsSync(CACHE_PATH)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
};

const saveCache = (cache) => {
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
};

const translateText = async (text, cache) => {
  if (cache[text]) {
    return cache[text];
  }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translate failed (${response.status}) for: ${text.slice(0, 80)}`);
  }
  const payload = await response.json();
  const translated = payload?.[0]?.map((entry) => entry?.[0] || "").join("") || text;
  cache[text] = translated;
  saveCache(cache);
  await sleep(120);
  return translated;
};

const hasCyrillic = (value) => /[а-яА-ЯіїєІЇЄ]/.test(value);

const translateCommentBody = async (body, cache) => {
  const lines = body.split("\n");
  const translatedLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!hasCyrillic(trimmed)) {
      translatedLines.push(line);
      continue;
    }
    const prefixMatch = line.match(/^(\s*(?:\/\*{1,2}\s?|\*\s?|\/\/\s?)?)([\s\S]*?)(\s*\*\/\s*)?$/);
    if (!prefixMatch) {
      translatedLines.push(line);
      continue;
    }
    const [, prefix = "", content = "", suffix = ""] = prefixMatch;
    const trailing = content.endsWith("*/") ? "*/" : "";
    const core = trailing ? content.slice(0, -2).trimEnd() : content;
    if (!hasCyrillic(core)) {
      translatedLines.push(line);
      continue;
    }
    const translatedCore = await translateText(core, cache);
    translatedLines.push(`${prefix}${translatedCore}${trailing}${suffix}`.trimEnd());
  }
  return translatedLines.join("\n");
};

const processBlockComment = async (source, startIndex, cache) => {
  const endIndex = source.indexOf("*/", startIndex + 2);
  if (endIndex === -1) {
    return null;
  }
  const full = source.slice(startIndex, endIndex + 2);
  if (!hasCyrillic(full)) {
    return { nextIndex: endIndex + 2, replacement: full };
  }
  const translated = await translateCommentBody(full, cache);
  return { nextIndex: endIndex + 2, replacement: translated };
};

const processLineComment = async (source, startIndex, cache) => {
  let endIndex = startIndex;
  while (endIndex < source.length && source[endIndex] !== "\n") {
    endIndex += 1;
  }
  const full = source.slice(startIndex, endIndex);
  if (!hasCyrillic(full)) {
    return { nextIndex: endIndex, replacement: full };
  }
  const translated = await translateCommentBody(full, cache);
  return { nextIndex: endIndex, replacement: translated };
};

const translateCommentsInSource = async (source, cache) => {
  let index = 0;
  let output = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let escaped = false;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (inSingleQuote) {
      output += char;
      if (!escaped && char === "'") {
        inSingleQuote = false;
      }
      escaped = !escaped && char === "\\";
      index += 1;
      continue;
    }

    if (inDoubleQuote) {
      output += char;
      if (!escaped && char === '"') {
        inDoubleQuote = false;
      }
      escaped = !escaped && char === "\\";
      index += 1;
      continue;
    }

    if (inTemplate) {
      output += char;
      if (!escaped && char === "`") {
        inTemplate = false;
      }
      escaped = !escaped && char === "\\";
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      const result = await processBlockComment(source, index, cache);
      output += result.replacement;
      index = result.nextIndex;
      continue;
    }

    if (char === "/" && next === "/") {
      const result = await processLineComment(source, index, cache);
      output += result.replacement;
      index = result.nextIndex;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      escaped = false;
      output += char;
      index += 1;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      escaped = false;
      output += char;
      index += 1;
      continue;
    }

    if (char === "`") {
      inTemplate = true;
      escaped = false;
      output += char;
      index += 1;
      continue;
    }

    output += char;
    index += 1;
  }

  return output;
};

const walk = async (dir, cache, stats) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, cache, stats);
      continue;
    }
    if (!EXTS.has(path.extname(entry.name))) {
      continue;
    }
    const original = fs.readFileSync(fullPath, "utf8");
    if (!hasCyrillic(original)) {
      continue;
    }
    const translated = await translateCommentsInSource(original, cache);
    if (translated !== original) {
      fs.writeFileSync(fullPath, translated, "utf8");
      stats.updated += 1;
      process.stdout.write(`updated ${path.relative(process.cwd(), fullPath)}\n`);
    }
  }
};

const main = async () => {
  const cache = loadCache();
  const stats = { updated: 0 };
  await walk(ROOT, cache, stats);
  saveCache(cache);
  process.stdout.write(`\nDone. Updated ${stats.updated} files.\n`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
