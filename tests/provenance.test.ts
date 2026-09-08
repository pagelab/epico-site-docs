import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const provenanceFile = new URL('../docs/provenance.md', import.meta.url);
const contentRoot = new URL('../src/content/docs/', import.meta.url);

const migrationSources = [
  '01-entenda-o-novo-formato.md',
  '02-precos-e-hospedagem.md',
  '03-edicao-e-personalizacao.md',
  '04-suporte-e-propriedade.md',
  'FAQ.md',
  'FAQ-consolidado.md',
];

function parseRows(markdown: string) {
  return markdown
    .split(/\r?\n/u)
    .filter((line) => /^\| (?:`|\()/u.test(line))
    .map((line) => line.split('|').map((cell) => cell.trim()));
}

function canonicalDestination(row: string[]) {
  return row[3].match(/\[`([^`]+)`\]/u)?.[1] ?? null;
}

async function readProvenance() {
  return readFile(provenanceFile, 'utf8');
}

describe('provenance map', () => {
  it('registers every known migration source exactly once', async () => {
    const sources = parseRows(await readProvenance()).map((row) => row[1].replaceAll('`', ''));
    const namedSources = sources.filter((source) => source !== '(sem origem)');

    expect(sources).toEqual(expect.arrayContaining(migrationSources));
    expect(new Set(namedSources).size).toBe(namedSources.length);
  });

  it('points every migrated or fused row at an existing canonical article', async () => {
    const rows = parseRows(await readProvenance()).filter((row) =>
      /^(?:migrado|fundido)/u.test(row[5]),
    );

    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      const destination = canonicalDestination(row);

      expect(destination, `linha sem destino canônico: ${row[1]}`).not.toBeNull();
      const article = await readFile(new URL(`${destination}.md`, contentRoot), 'utf8');
      expect(article, `${destination} sem frontmatter de artigo`).toContain(`topic: ${destination?.split('/')[0]}`);
    }
  });

  it('does not send two sources to the same canonical destination', async () => {
    const destinations = parseRows(await readProvenance())
      .filter((row) => row[5].startsWith('migrado'))
      .map((row) => canonicalDestination(row));

    expect(new Set(destinations).size).toBe(destinations.length);
  });
});
