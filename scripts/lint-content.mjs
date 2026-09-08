import { readdir, readFile } from 'node:fs/promises';
import { extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { topics } from '../src/lib/topics.mjs';

const contentRoot = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const allowedSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const contentExtensions = new Set(['.md', '.mdx']);
const allowedTopics = new Set(topics);
const requiredFrontmatter = ['title', 'description', 'topic', 'draft', 'lastReviewed'];
const forbiddenSecrets = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/u, 'chave privada'],
  [/[?&](?:X-Amz-Signature|X-Goog-Signature|Signature)=/iu, 'URL assinada'],
  [/\b(?:api[_-]?key|secret|token|password|senha)\s*[:=]\s*["']?[A-Za-z0-9_./+-]{8,}/iu, 'credencial'],
  [/\bqa-customer\b/iu, 'identidade de QA'],
  [/\/Users\/[A-Za-z0-9._-]+\//u, 'caminho local'],
  [/\b(?:localhost|127\.0\.0\.1)(?::\d+)?\b/iu, 'endereço local'],
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...await walk(path));
    } else if (contentExtensions.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
}

function bodyLines(source) {
  const lines = source.split(/\r?\n/u);
  let inFrontmatter = lines[0] === '---';
  let inFence = false;

  return lines.flatMap((line, index) => {
    if (index > 0 && inFrontmatter && line === '---') {
      inFrontmatter = false;
      return [];
    }

    if (inFrontmatter) {
      return [];
    }

    if (/^\s*(```|~~~)/u.test(line)) {
      inFence = !inFence;
      return [];
    }

    return inFence ? [] : [{ line, number: index + 1 }];
  });
}

function frontmatterOf(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  return match?.[1] ?? null;
}

function scalar(frontmatter, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const match = frontmatter.match(new RegExp(`^${escapedKey}:\\s*(.+?)\\s*$`, 'mu'));

  if (!match) {
    return null;
  }

  return match[1].replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/u, '$1$2').trim();
}

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

function unapprovedEmails(source) {
  const matches = source.match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/giu) ?? [];
  return matches.filter((email) => {
    const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase();
    return !['example.com', 'example.org', 'example.net', 'exemplo.com', 'exemplo.org'].includes(domain);
  });
}

const violations = [];

for (const path of await walk(contentRoot)) {
  const relativePath = relative(contentRoot, path);
  const pathSegments = relativePath.split(sep);
  const filename = pathSegments.pop();
  const stem = filename.slice(0, -extname(filename).length);

  for (const segment of [...pathSegments, stem]) {
    if (!allowedSegment.test(segment)) {
      violations.push(`${relativePath}: slug não canônico: ${segment}`);
    }
  }

  const source = await readFile(path, 'utf8');
  const frontmatter = frontmatterOf(source);

  if (frontmatter === null) {
    violations.push(`${relativePath}: frontmatter ausente ou inválido`);
    continue;
  }

  for (const key of requiredFrontmatter) {
    if (scalar(frontmatter, key) === null) {
      violations.push(`${relativePath}: frontmatter obrigatório ausente: ${key}`);
    }
  }

  const title = scalar(frontmatter, 'title') ?? '';
  const description = scalar(frontmatter, 'description') ?? '';
  const topic = scalar(frontmatter, 'topic') ?? '';
  const draft = scalar(frontmatter, 'draft') ?? '';
  const lastReviewed = scalar(frontmatter, 'lastReviewed') ?? '';

  if (!allowedTopics.has(topic)) {
    violations.push(`${relativePath}: topic fora da allowlist: ${topic || '(vazio)'}`);
  }

  if (pathSegments.length > 0 && pathSegments[0] !== topic) {
    violations.push(`${relativePath}: topic não corresponde ao diretório: ${topic}`);
  }

  if (!['true', 'false'].includes(draft)) {
    violations.push(`${relativePath}: draft deve ser true ou false`);
  }

  if (!isRealDate(lastReviewed)) {
    violations.push(`${relativePath}: lastReviewed deve ser uma data YYYY-MM-DD válida`);
  }

  if (/^slug\s*:/mu.test(frontmatter)) {
    violations.push(`${relativePath}: slug em frontmatter é proibido, use o caminho do arquivo`);
  }

  for (const [label, value] of [['title', title], ['description', description]]) {
    if (value.includes('—') || value.includes(';')) {
      violations.push(`${relativePath}: ${label} viola a pontuação editorial`);
    }
  }

  for (const [pattern, label] of forbiddenSecrets) {
    if (pattern.test(source)) {
      violations.push(`${relativePath}: conteúdo proibido detectado: ${label}`);
    }
  }

  for (const email of unapprovedEmails(source)) {
    violations.push(`${relativePath}: e-mail público não aprovado: ${email}`);
  }

  for (const { line, number } of bodyLines(source)) {
    if (line.includes('—')) {
      violations.push(`${relativePath}:${number}: travessão longo não permitido`);
    }

    if (line.includes(';')) {
      violations.push(`${relativePath}:${number}: ponto e vírgula não permitido`);
    }

    if (/<script\b/iu.test(line)) {
      violations.push(`${relativePath}:${number}: tag <script> não permitida no corpo`);
    }

    if (/\son[a-z]+\s*=/iu.test(line)) {
      violations.push(`${relativePath}:${number}: manipulador de evento inline não permitido no corpo`);
    }

    if (/\]\(\s*javascript:/iu.test(line)) {
      violations.push(`${relativePath}:${number}: link com esquema javascript: não permitido`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Content policy: PASS');
}
