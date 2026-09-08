import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { topics } from '../src/lib/topics.mjs';

const contentRoot = new URL('../src/content/docs/', import.meta.url);

describe('content model', () => {
  it('has one index page for every public topic', async () => {
    for (const topic of topics) {
      const source = await readFile(new URL(`${topic}/index.md`, contentRoot), 'utf8');

      expect(source).toContain(`topic: ${topic}`);
      expect(source).toContain('draft: false');
      expect(source).toMatch(/lastReviewed: \d{4}-\d{2}-\d{2}/u);
    }
  });

  it('does not expose undeclared top-level content directories', async () => {
    const entries = await readdir(contentRoot, { withFileTypes: true });
    const directories = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(directories).toEqual([...topics].sort());
  });
});
