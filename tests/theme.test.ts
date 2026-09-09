import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);

const FONT_SHA: Record<string, string> = {
	'CalSans-SemiBold.woff2': '099beb6bb141bbde40ca0bd7141c327b68967d86d48a0d4e88ea709e943411c8',
	'Outfit-Variable.woff2': 'a8a1fe406bb4b86b02bf3165fa4c2774b706aee8d08204036abe7da02eff719f',
	'OFL-CalSans.txt': '05a6691e4394bf5791fdf81bf2494f292a1cacf910b166977562579648387019',
	'OFL-Outfit.txt': '8fc6af31312082959cc8297b30e04d94ff457faecc9fb0aeeb8906bf448f20e6',
};

async function sha256(path: URL): Promise<string> {
	const data = await readFile(path);
	return createHash('sha256').update(data).digest('hex');
}

function stripComments(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('fontes locais', () => {
	it('serve exatamente os dois WOFF2 registrados e as duas licenças OFL', async () => {
		const files = await readdir(new URL('public/fonts/', root));

		expect(files.sort()).toEqual([
			'CalSans-SemiBold.woff2',
			'OFL-CalSans.txt',
			'OFL-Outfit.txt',
			'Outfit-Variable.woff2',
		]);
	});

	it('bate os SHA-256 do registro de proveniência, byte a byte', async () => {
		const registry = await readFile(new URL('docs/fonts.md', root), 'utf8');

		for (const [name, expected] of Object.entries(FONT_SHA)) {
			expect(await sha256(new URL(`public/fonts/${name}`, root))).toBe(expected);
			// O registro é a autoridade: o hash também precisa estar escrito nele.
			expect(registry).toContain(expected);
			expect(registry).toContain(`\`${name}\``);
		}
	});

	it('declara duas @font-face locais com swap, sem provedor externo', async () => {
		const css = stripComments(await readFile(new URL('src/styles/fonts.css', root), 'utf8'));

		const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
		expect(faces).toHaveLength(2);

		expect(faces.join('\n')).toContain("font-family: 'Cal Sans'");
		expect(faces.join('\n')).toContain('font-weight: 600');
		expect(faces.join('\n')).toContain("font-family: 'Outfit'");
		expect(faces.join('\n')).toContain('font-weight: 100 900');

		for (const face of faces) {
			expect(face).toMatch(/src:\s*url\('\/fonts\/[A-Za-z-]+\.woff2'\) format\('woff2'\)/);
			expect(face).toContain('font-display: swap');
			expect(face).not.toMatch(/https?:|\/\//);
		}
	});
});

describe('tema via variáveis públicas', () => {
	it('define as paletas dark e light nos seletores espelhados do Starlight', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		// O dark é o padrão em :root (com ::backdrop) e o claro sobrescreve
		// com [data-theme='light'], exatamente como o props.css do vendor.
		expect(css).toMatch(/:root,\s*\n\s*::backdrop\s*\{/);
		expect(css).toMatch(/:root\[data-theme='light'\],\s*\n\s*\[data-theme='light'\] ::backdrop\s*\{/);

		const selectors = (css.match(/^\s*[^{}/@]+{/gm) ?? []).map((s) =>
			s.trim().replace(/\s*{$/, '').replace(/\s+/g, ' '),
		);
		expect(selectors).toEqual([
			':root, ::backdrop',
			":root[data-theme='light'], [data-theme='light'] ::backdrop",
			'h1, h2, h3, h4, h5, h6',
		]);
	});

	it('declara apenas propriedades --sl-* fora da regra de heading', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		const declarations =
			css.match(/^[ \t]*(--[\w-]+|[a-z-]+)\s*:\s*[^;]+;/gm) ?? [];

		for (const declaration of declarations.map((d) => d.trim())) {
			const property = /^([a-z-]+|--[\w-]+)\s*:/.exec(declaration)?.[1] ?? '';
			const isPublicVar = property.startsWith('--sl-');
			const isHeadingTypography = property === 'font-family' || property === 'font-weight';
			expect(
				isPublicVar || isHeadingTypography,
				`propriedade fora da superfície pública: ${declaration}`,
			).toBe(true);
		}

		expect(css).not.toContain('@import');
		expect(css).not.toMatch(/https?:|\/\/|url\(/);
		expect(css).not.toContain('tokens.css');
	});

	it('usa Outfit no corpo e mantém Cal Sans só nos headings', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		expect(css).toContain("--sl-font: 'Outfit', 'Segoe UI', Helvetica, Arial, sans-serif;");
		expect(css).toMatch(/h1,\s*\nh2,\s*\nh3,\s*\nh4,\s*\nh5,\s*\nh6\s*\{/);
		expect(css).toContain("font-family: 'Cal Sans', var(--sl-font)");
	});
});

describe('orçamento de desempenho da /busca/', () => {
	it('revela o bloco de busca antes da primeira pintura, sem CLS', async () => {
		const page = await readFile(new URL('src/pages/busca.astro', root), 'utf8');

		// O bloco nasce hidden no HTML (degradação sem JavaScript) e um script
		// inline síncrono o revela antes de a seção de áreas ser parseada.
		// A revelação tardia pelo script bundled empurrava as áreas para baixo
		// depois da primeira pintura (CLS 0.07 medido em DOCS-05).
		const fimDoBloco = page.indexOf('</search>');
		const reveal = page.indexOf(
			"document.querySelector('[data-busca]')?.removeAttribute('hidden')",
		);
		const areas = page.indexOf('<section aria-labelledby="busca-areas">');

		expect(page).toContain("document.querySelector('[data-busca]')?.removeAttribute('hidden')");
		expect(fimDoBloco).toBeGreaterThan(-1);
		expect(reveal).toBeGreaterThan(fimDoBloco);
		expect(areas).toBeGreaterThan(reveal);
	});
});

describe('fiação do tema no config', () => {
	it('liga customCss, pré-carrega as duas fontes e não sobrescreve componente', async () => {
		const config = await readFile(new URL('astro.config.mjs', root), 'utf8');

		expect(config).toContain(
			"customCss: ['/src/styles/fonts.css', '/src/styles/theme.css']",
		);
		expect(config.match(/rel: 'preload'/g)).toHaveLength(2);
		expect(config).toContain("href: '/fonts/Outfit-Variable.woff2'");
		expect(config).toContain("href: '/fonts/CalSans-SemiBold.woff2'");
		expect(config).toContain("as: 'font'");
		expect(config).toContain("crossorigin: 'anonymous'");

		// Nenhum override de componente do Starlight sem nova decisão.
		expect(config).not.toContain('components:');
		expect(config).not.toMatch(/import\s+\*\s+as\s+StarlightPage/);
	});

	it('coloca o gate de contraste no verify', async () => {
		const packageJson = JSON.parse(
			await readFile(new URL('package.json', root), 'utf8'),
		) as { scripts: Record<string, string> };

		expect(packageJson.scripts.verify).toContain(
			'node scripts/check-theme-contrast.mjs',
		);
	});
});
