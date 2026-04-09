#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const root = path.resolve('./');
const srcDir = path.join(root, 'frontend', 'src');
const devLoggerPath = path.join(srcDir, 'utils', 'devLogger');

const exts = ['.ts', '.tsx', '.js', '.jsx'];
const skipFiles = ['replace-emojis.js'];
const eslintDisableMarker = 'eslint-disable no-console';

function posixify(p) {
  return p.split(path.sep).join('/');
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...await walk(full));
    } else if (e.isFile()) {
      if (exts.includes(path.extname(e.name)) && !skipFiles.includes(e.name)) {
        files.push(full);
      }
    }
  }
  return files;
}

function computeImportPath(fromFile) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, devLoggerPath);
  // Remove extension if present
  rel = rel.replace(/\\.m?js$|\\.ts$|\\.tsx$/, '');
  if (!rel.startsWith('.')) rel = './' + rel;
  // use posix separators
  rel = posixify(rel);
  return rel;
}

async function processFile(file) {
  let content = await fs.readFile(file, 'utf8');
  if (!content.includes('console.')) return false;
  if (content.includes(eslintDisableMarker)) return false;

  // Replace console methods
  const replaced = content.replace(/\bconsole\.(log|error|warn|info|debug|group|groupEnd)\b/g, 'dev.$1');
  if (replaced === content) return false;

  // Ensure import exists
  const importRegex = /import\s+dev\s+from\s+['"](.*devLogger)['"];?/;
  const requireRegex = /const\s+dev\s*=\s*require\(['"](.*devLogger)['"]\);?/;
  if (!importRegex.test(replaced) && !requireRegex.test(replaced)) {
    const rel = computeImportPath(file);
    // Insert after the last import statement, or at top
    const lines = replaced.split(/\r?\n/);
    let insertAt = 0;
    for (let i = 0; i < Math.min(lines.length, 40); i++) {
      if (/^import\s.+from\s.+;?$/.test(lines[i])) insertAt = i + 1;
    }
    lines.splice(insertAt, 0, `import dev from '${rel}';`);
    content = lines.join('\n');
  } else {
    content = replaced;
  }

  await fs.writeFile(file, content, 'utf8');
  console.log(`Patched: ${path.relative(root, file)}`);
  return true;
}

(async () => {
  try {
    const files = await walk(srcDir);
    let count = 0;
    for (const f of files) {
      try {
        const ok = await processFile(f);
        if (ok) count++;
      } catch (err) {
        console.error('Error processing', f, err.message || err);
      }
    }
    console.log(`\nDone. Modified ${count} files.`);
  } catch (err) {
    console.error('Fatal error:', err.message || err);
    process.exit(1);
  }
})();
