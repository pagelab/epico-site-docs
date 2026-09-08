import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);

describe('reproducible scaffold', () => {
  it('pins the runtime and every direct dependency', async () => {
    const packageJson = JSON.parse(
      await readFile(new URL('package.json', root), 'utf8'),
    ) as {
      engines: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.engines).toEqual({ node: '24.20.0', npm: '11.19.0' });

    for (const version of [
      ...Object.values(packageJson.dependencies),
      ...Object.values(packageJson.devDependencies),
    ]) {
      expect(version).toMatch(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u);
    }
  });

  it('keeps source content free from the Starlight examples', async () => {
    const config = await readFile(new URL('astro.config.mjs', root), 'utf8');

    expect(config).not.toContain('Example Guide');
    expect(config).not.toContain('withastro/starlight');
  });
});
