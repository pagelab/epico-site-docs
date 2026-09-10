/**
 * Regressão do gate de publicação estática (DOCS-06). A suíte cobre as
 * funções puras do `scripts/check-publishing.mjs` e, com uma fixture mínima
 * em diretório temporário, cada barreira do `checkPublishing`: a fixture
 * válida passa limpa e cada mutação precisa produzir a violação esperada.
 */
import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	checkPublishing,
	extractInlineScriptHashes,
	parseCsp,
	parseHeadersFile,
	sourceHost,
} from '../scripts/check-publishing.mjs';

const SITE = 'https://tutoriais.epico.site/';
const INLINE_SCRIPT = "console.log('fixture')";

function fixtureHash() {
	return `sha256-${createHash('sha256').update(INLINE_SCRIPT, 'utf8').digest('base64')}`;
}

function fixtureHeaders(hash = fixtureHash()) {
	return [
		'/*',
		`  Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' '${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`,
		'  X-Content-Type-Options: nosniff',
		'  X-Frame-Options: DENY',
		'  Referrer-Policy: strict-origin-when-cross-origin',
		'  Permissions-Policy: camera=(), microphone=(), geolocation=()',
		'  Strict-Transport-Security: max-age=31536000; includeSubDomains',
		'',
		'/_astro/*',
		'  Cache-Control: public, max-age=31556952, immutable',
		'',
		'https://:script.:account.workers.dev/*',
		'  X-Robots-Tag: noindex',
		'',
		'https://:version.:script.:account.workers.dev/*',
		'  X-Robots-Tag: noindex',
		'',
	].join('\n');
}

function fixtureRobots() {
	return `User-agent: *
Allow: /

Sitemap: ${SITE}sitemap-index.xml
`;
}

function fixtureWrangler() {
	return `${JSON.stringify(
		{
			name: 'epico-site-docs',
			compatibility_date: '2026-09-07',
			workers_dev: true,
			preview_urls: true,
			routes: [{ pattern: new URL(SITE).hostname, custom_domain: true }],
			assets: {
				directory: './dist',
				html_handling: 'auto-trailing-slash',
				not_found_handling: '404-page',
			},
		},
		null,
		'\t',
	)}\n`;
}

/** Fixture mínima e VÁLIDA: `checkPublishing` precisa retornar zero violações. */
async function makeFixture() {
	const root = await mkdtemp(join(tmpdir(), 'docs-publishing-'));

	await mkdir(join(root, 'public'), { recursive: true });
	await mkdir(join(root, 'dist/busca'), { recursive: true });
	await mkdir(join(root, 'src/content/docs'), { recursive: true });

	await writeFile(join(root, 'astro.config.mjs'), `export default { site: '${SITE}' };\n`);
	await writeFile(join(root, 'public/_headers'), fixtureHeaders());
	await writeFile(join(root, 'public/robots.txt'), fixtureRobots());
	await writeFile(join(root, 'wrangler.jsonc'), fixtureWrangler());
	await writeFile(
		join(root, 'src/content/docs/404.md'),
		`---\ntitle: Página não encontrada\ndescription: Fixture.\n---\n\nCorpo.\n`,
	);
	await writeFile(join(root, 'dist/_headers'), fixtureHeaders());
	await writeFile(join(root, 'dist/robots.txt'), fixtureRobots());
	await writeFile(
		join(root, 'dist/index.html'),
		`<html><body><script>${INLINE_SCRIPT}</script></body></html>`,
	);
	await writeFile(
		join(root, 'dist/busca/index.html'),
		`<html><body><script>${INLINE_SCRIPT}</script><script src="/_astro/x.js"></script></body></html>`,
	);
	await writeFile(
		join(root, 'dist/404.html'),
		`<html><head><title>Página não encontrada</title></head><body>404</body></html>`,
	);
	await writeFile(
		join(root, 'dist/sitemap-index.xml'),
		`<sitemapindex><sitemap><loc>${SITE}sitemap-0.xml</loc></sitemap></sitemapindex>`,
	);
	await writeFile(
		join(root, 'dist/sitemap-0.xml'),
		`<urlset><url><loc>${SITE}</loc></url><url><loc>${SITE}busca/</loc></url></urlset>`,
	);
	await writeFile(
		join(root, 'dist/llms.txt'),
		`Política de uso: busca, citação, grounding e treinamento.\n- ${SITE}llms-full.txt\n`,
	);
	await writeFile(join(root, 'dist/llms-full.txt'), 'conteúdo completo\n');
	await writeFile(join(root, 'dist/llms-small.txt'), 'conteúdo reduzido\n');
	await writeFile(
		join(root, 'dist/search-index.json'),
		JSON.stringify({ version: 1, entries: [{ url: '/', title: 'Início', description: 'd', topic: 'x', lastReviewed: '2026-09-08' }] }),
	);

	return root;
}

describe('publishing: funções puras', () => {
	it('parseHeadersFile lê blocos, múltiplos headers e fontes com host', () => {
		const { rules, errors } = parseHeadersFile('/*\n  A: 1\n  B: 2\n\nhttps://x.dev/*\n\tC: 3\n');

		expect(errors).toEqual([]);
		expect(rules).toHaveLength(2);
		expect(rules[0]?.source).toBe('/*');
		expect(Object.fromEntries(rules[0]?.headers ?? [])).toEqual({ A: '1', B: '2' });
		expect(rules[1]?.source).toBe('https://x.dev/*');
		expect(rules[1]?.headers.get('C')).toBe('3');
	});

	it('parseHeadersFile rejeita header órfão, sem separador, regra sem headers, excesso de regras e linha longa', () => {
		const orphan = parseHeadersFile('  A: 1\n');
		expect(orphan.errors[0]).toMatch(/header sem regra anterior/);

		const noSeparator = parseHeadersFile('/*\n  A 1\n');
		expect(noSeparator.errors[0]).toMatch(/sem separador/);

		const emptyRule = parseHeadersFile('/*\n\n  A: 1\n');
		expect(emptyRule.errors.some((error) => error.includes('regra sem headers'))).toBe(true);

		const tooMany = parseHeadersFile(Array.from({ length: 101 }, (_unused, index) => `/r${index}\n  A: 1\n`).join('\n'));
		expect(tooMany.errors.some((error) => error.includes('mais de 100 regras'))).toBe(true);

		const longLine = parseHeadersFile(`/*\n  A: ${'x'.repeat(2_000)}\n`);
		expect(longLine.errors[0]).toMatch(/excede 2000 caracteres/);
	});

	it('parseCsp separa diretivas e fontes', () => {
		const csp = parseCsp("default-src 'self'; script-src 'self' sha256-abc; object-src 'none'");

		expect([...csp.keys()]).toEqual(['default-src', 'script-src', 'object-src']);
		expect(csp.get('script-src')).toEqual(["'self'", 'sha256-abc']);
	});

	it('extractInlineScriptHashes pega todo script sem src, com ou sem atributos', () => {
		const html = `<html><body><script>${INLINE_SCRIPT}</script><script type="module">${INLINE_SCRIPT}</script><script src="/x.js"></script></body></html>`;
		const hashes = extractInlineScriptHashes(html);

		expect(hashes.size).toBe(1);
		expect(hashes.has(fixtureHash())).toBe(true);
	});

	it('sourceHost distingue fonte só de caminho de URL completa', () => {
		expect(sourceHost('/*')).toBeNull();
		expect(sourceHost('https://:a.:b.workers.dev/*')).toBe(':a.:b.workers.dev');
	});
});

describe('publishing: gate sobre fixture válida e mutações', () => {
	it('fixture válida passa sem violações', async () => {
		expect(await checkPublishing(await makeFixture())).toEqual([]);
	});

	it('hash de script inline ausente na CSP bloquearia o script no browser', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders("sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/script inline servido sem hash na CSP/),
		);
	});

	it('hash órfão na CSP é sujeira que precisa sair', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders(`${fixtureHash()}' 'sha256-BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=`);
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/hash órfão na CSP/),
		);
	});

	it('unsafe-inline em script-src é proibido', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders().replace("'self' ", "'self' 'unsafe-inline' ");
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/script-src não pode conter 'unsafe-inline'/),
		);
	});

	it('script-src sem wasm-unsafe-eval quebra a busca do Pagefind no browser', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders().replace("script-src 'self' 'wasm-unsafe-eval'", "script-src 'self'");
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/script-src sem 'wasm-unsafe-eval'/),
		);
	});

	it('nosniff ausente na regra global é violação', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders().replace('  X-Content-Type-Options: nosniff\n', '');
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/X-Content-Type-Options/),
		);
	});

	it('header de segurança em regra específica seria unido por vírgula pelo Cloudflare', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders().replace('  Cache-Control: public, max-age=31556952, immutable', '  Cache-Control: public, max-age=31556952, immutable\n  X-Frame-Options: SAMEORIGIN');
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/X-Frame-Options só pode existir na regra \/\*/),
		);
	});

	it('X-Robots-Tag na regra global marcaria o custom domain como noindex', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders().replace('  Strict-Transport-Security: max-age=31536000; includeSubDomains', '  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  X-Robots-Tag: noindex');
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/X-Robots-Tag em regra sem host/),
		);
	});

	it('sem regra noindex para workers.dev de produção e preview de versão', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders()
			.replace('https://:script.:account.workers.dev/*\n  X-Robots-Tag: noindex\n\n', '')
			.replace('https://:version.:script.:account.workers.dev/*\n  X-Robots-Tag: noindex\n', '');
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		const violations = await checkPublishing(root);

		expect(violations).toContainEqual(expect.stringMatching(/workers.dev de produção/));
		expect(violations).toContainEqual(expect.stringMatching(/preview de versão/));
	});

	it('regra workers.dev sem noindex não protege a origem', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders().replaceAll('X-Robots-Tag: noindex', 'X-Robots-Tag: nosnippet');
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/regra workers.dev sem X-Robots-Tag: noindex/),
		);
	});

	it('img-src sem data: bloquearia os ícones SVG injetados pelo vendor', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders().replace("img-src 'self' data:", "img-src 'self'");
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/CSP img-src deve ser exatamente 'self' data:/),
		);
	});

	it('cache sem immutable para assets fingerprinted', async () => {
		const root = await makeFixture();
		const broken = fixtureHeaders().replace(
			'  Cache-Control: public, max-age=31556952, immutable',
			'  Cache-Control: public, max-age=0, must-revalidate',
		);
		await writeFile(join(root, 'public/_headers'), broken);
		await writeFile(join(root, 'dist/_headers'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/immutable/),
		);
	});

	it('robots.txt com Disallow: / bloquearia o acervo público', async () => {
		const root = await makeFixture();
		const broken = fixtureRobots().replace('Allow: /', 'Allow: /\nDisallow: /');
		await writeFile(join(root, 'public/robots.txt'), broken);
		await writeFile(join(root, 'dist/robots.txt'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/bloqueia o rastreamento do acervo público/),
		);
	});

	it('robots.txt sem Sitemap canônico', async () => {
		const root = await makeFixture();
		const broken = fixtureRobots().replace(`\nSitemap: ${SITE}sitemap-index.xml`, '');
		await writeFile(join(root, 'public/robots.txt'), broken);
		await writeFile(join(root, 'dist/robots.txt'), broken);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/Sitemap deve apontar/),
		);
	});

	it('URL de sitemap sem página no dist é listing mentiroso', async () => {
		const root = await makeFixture();
		await writeFile(
			join(root, 'dist/sitemap-0.xml'),
			`<urlset><url><loc>${SITE}fantasma/</loc></url></urlset>`,
		);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/URL sem página correspondente/),
		);
	});

	it('404.html que não é o custom do acervo', async () => {
		const root = await makeFixture();
		await writeFile(join(root, 'dist/404.html'), '<html><body>Not found</body></html>');

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/não corresponde ao 404 custom/),
		);
	});

	it('404 entrando no índice de busca', async () => {
		const root = await makeFixture();
		await writeFile(
			join(root, 'dist/search-index.json'),
			JSON.stringify({ version: 1, entries: [{ url: '/404/', title: '404', description: 'd', topic: 'x', lastReviewed: '2026-09-08' }] }),
		);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/página utilitária não pode entrar no índice/),
		);
	});

	it('llms.txt sem a política pública de uso', async () => {
		const root = await makeFixture();
		await writeFile(join(root, 'dist/llms.txt'), '# Épico Site\n');

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/política pública de uso sem "citação"/),
		);
	});

	it('wrangler com SPA fallback em vez de 404 real', async () => {
		const root = await makeFixture();
		await writeFile(
			join(root, 'wrangler.jsonc'),
			fixtureWrangler().replace('"not_found_handling": "404-page"', '"not_found_handling": "single-page-application"'),
		);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/not_found_handling deve ser 404-page/),
		);
	});

	it('wrangler com main desviaria do asset server e perderia os _headers', async () => {
		const root = await makeFixture();
		await writeFile(join(root, 'wrangler.jsonc'), fixtureWrangler().replace('{\n', '{\n\t"main": "worker.js",\n'));

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/main não pode existir/),
		);
	});

	it('wrangler sem workers_dev apaga o canary workers.dev da ADR 0002', async () => {
		const root = await makeFixture();
		await writeFile(
			join(root, 'wrangler.jsonc'),
			fixtureWrangler().replace('\t"workers_dev": true,\n', ''),
		);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/workers_dev deve ser true/),
		);
	});

	it('wrangler sem preview_urls tira os previews de *.workers.dev', async () => {
		const root = await makeFixture();
		await writeFile(
			join(root, 'wrangler.jsonc'),
			fixtureWrangler().replace('\t"preview_urls": true,\n', '\t"preview_urls": false,\n'),
		);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/preview_urls deve ser true/),
		);
	});

	it('wrangler com rota que não seja o custom domain canônico', async () => {
		const root = await makeFixture();
		await writeFile(
			join(root, 'wrangler.jsonc'),
			fixtureWrangler().replace(new URL(SITE).hostname, 'outro.exemplo.com'),
		);

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(new RegExp(`routes deve ser exatamente o custom domain ${new URL(SITE).hostname.replace(/\./gu, '\\.')}`)),
		);
	});

	it('dist/_headers diferente de public/_headers indica build desatualizado', async () => {
		const root = await makeFixture();
		await writeFile(join(root, 'dist/_headers'), fixtureHeaders() + '\n/stale/*\n  A: 1\n');

		expect(await checkPublishing(root)).toContainEqual(
			expect.stringMatching(/difere de public\/_headers/),
		);
	});
});
