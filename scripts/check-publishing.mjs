// Gate de publicação estática segura (DOCS-06). Executável por
// `node scripts/check-publishing.mjs` e importável pelos testes de regressão
// em tests/publishing.test.ts. Valida a CONFIGURAÇÃO (fontes em `public/` e
// `wrangler.jsonc`) e o ARTEFATO construído (`dist/`) em conjunto:
//
// - `_headers`: CSP com o conjunto EXATO de hashes dos scripts inline
//   servidos (nem faltando, nem órfão), sem `unsafe-inline` em script-src,
//   headers de segurança globais, cache imutável só para assets com hash no
//   nome e `X-Robots-Tag: noindex` APENAS na origem `workers.dev`, deixando
//   o custom domain indexável;
// - `robots.txt`: permite o rastreamento e aponta o sitemap canônico;
// - sitemap: toda URL listada é uma página real do `dist`;
// - 404 custom servido e fora do índice de busca;
// - `llms*.txt` servidos com a política pública de uso do acervo;
// - `wrangler.jsonc`: static assets com 404 real, sem SPA fallback, sem
//   script de Worker (respostas de Worker não recebem os `_headers`).
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

const securityHeaderNames = [
	'Content-Security-Policy',
	'Strict-Transport-Security',
	'X-Content-Type-Options',
	'X-Frame-Options',
	'Referrer-Policy',
	'Permissions-Policy',
];

/**
 * @typedef {Object} HeaderRule
 * @property {string} source
 * @property {Map<string, string>} headers
 */

/**
 * Parse do formato `_headers` (blocos `[fonte]` seguidos de linhas
 * indentadas `Nome: valor`). Linhas em branco encerram o bloco. Retorna as
 * regras e os erros estruturais encontrados, sem abortar o parse inteiro.
 *
 * @param {string} text
 * @returns {{ rules: HeaderRule[], errors: string[] }}
 */
export function parseHeadersFile(text) {
	/** @type {HeaderRule[]} */
	const rules = [];
	const errors = [];
	let current = null;

	for (const [index, rawLine] of text.split(/\r?\n/u).entries()) {
		const lineNumber = index + 1;

		if (rawLine.length > 2_000) {
			errors.push(`_headers:${lineNumber}: linha excede 2000 caracteres`);
		}

		if (rawLine.trim() === '') {
			current = null;
			continue;
		}

		const indented = /^[ \t]/u.test(rawLine);

		if (indented) {
			const separator = rawLine.indexOf(':');

			if (separator === -1) {
				errors.push(`_headers:${lineNumber}: linha de header sem separador ":"`);
				continue;
			}

			if (current === null) {
				errors.push(`_headers:${lineNumber}: header sem regra anterior`);
				continue;
			}

			current.headers.set(
				rawLine.slice(0, separator).trim(),
				rawLine.slice(separator + 1).trim(),
			);
			continue;
		}

		current = { source: rawLine.trim(), headers: new Map() };
		rules.push(current);
	}

	for (const rule of rules) {
		if (rule.headers.size === 0) {
			errors.push(`_headers: regra sem headers: ${rule.source}`);
		}
	}

	if (rules.length > 100) {
		errors.push(`_headers: mais de 100 regras: ${rules.length}`);
	}

	return { rules, errors };
}

/**
 * Quebra o valor de uma CSP em diretivas e fontes.
 *
 * @param {string} value
 * @returns {Map<string, string[]>}
 */
export function parseCsp(value) {
	/** @type {Map<string, string[]>} */
	const directives = new Map();

	for (const part of value.split(';')) {
		const trimmed = part.trim();

		if (trimmed === '') {
			continue;
		}

		const [directive, ...sources] = trimmed.split(/\s+/u);
		directives.set(directive, sources);
	}

	return directives;
}

/**
 * Hashes SHA-256 (forma `sha256-<base64>`) de TODO script inline da página:
 * o mesmo conteúdo que o browser valida contra a CSP. Scripts com `src`
 * são carregamento externo e não são afetados por hash.
 *
 * @param {string} html
 * @returns {Set<string>}
 */
export function extractInlineScriptHashes(html) {
	/** @type {Set<string>} */
	const hashes = new Set();
	const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gu;
	let match;

	while ((match = re.exec(html)) !== null) {
		hashes.add(`sha256-${createHash('sha256').update(match[2], 'utf8').digest('base64')}`);
	}

	return hashes;
}

/**
 * Host de uma fonte de regra `_headers`, quando a fonte é URL completa.
 * Fontes só de caminho (como `/*`) não têm host e valem para qualquer
 * domínio que sirva os assets, inclusive o custom domain.
 *
 * @param {string} source
 * @returns {string | null}
 */
export function sourceHost(source) {
	const match = source.match(/^[a-z]+:\/\/([^/]+)/iu);

	return match?.[1] ?? null;
}

async function walkHtmlFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	/** @type {string[]} */
	const files = [];

	for (const entry of entries) {
		const path = join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...await walkHtmlFiles(path));
		} else if (entry.name.endsWith('.html')) {
			files.push(path);
		}
	}

	return files.sort();
}

/**
 * Valida fontes e artefato da publicação estática. Retorna a lista de
 * violações (vazia = PASS).
 *
 * @param {string} root Raiz do repositório (padrão: a deste script).
 * @returns {Promise<string[]>}
 */
export async function checkPublishing(root = repoRoot) {
	const violations = [];
	const read = async (relative) => {
		try {
			return await readFile(join(root, relative), 'utf8');
		} catch {
			return null;
		}
	};
	const readRequired = async (relative, label) => {
		const content = await read(relative);

		if (content === null) {
			violations.push(`${label}: arquivo ausente: ${relative}`);
		}

		return content;
	};

	const astroConfig = await readRequired('astro.config.mjs', 'astro');
	const site = astroConfig?.match(/site:\s*'([^']+)'[^'"]*/u)?.[1];

	if (astroConfig !== null && site === undefined) {
		violations.push('astro: site canônico não encontrado no astro.config.mjs');
	}

	// --- _headers: fonte, cópia fiel e formato ---
	const headersSource = await readRequired('public/_headers', '_headers');
	const headersDist = await readRequired('dist/_headers', '_headers');

	if (headersSource !== null && headersDist !== null && headersSource !== headersDist) {
		violations.push('_headers: dist/_headers difere de public/_headers (build desatualizado)');
	}

	const parsed = headersSource === null ? { rules: [], errors: ['ausente'] } : parseHeadersFile(headersSource);
	violations.push(...parsed.errors);

	const rules = parsed.rules;
	const globalRule = rules.find((rule) => rule.source === '/*');

	if (globalRule === undefined) {
		violations.push('_headers: regra global /* ausente');
	}

	// --- CSP: diretivas e conjunto exato de hashes dos scripts servidos ---
	/** @type {Set<string>} */
	const servedHashes = new Set();

	for (const path of await walkHtmlFiles(join(root, 'dist'))) {
		for (const hash of extractInlineScriptHashes(await readFile(path, 'utf8'))) {
			servedHashes.add(hash);
		}
	}

	if (globalRule !== undefined) {
		const cspValue = globalRule.headers.get('Content-Security-Policy');

		if (cspValue === undefined) {
			violations.push('_headers: regra /* sem Content-Security-Policy');
		} else {
			const csp = parseCsp(cspValue);

			if ((csp.get('default-src') ?? []).includes("'self'") === false) {
				violations.push('_headers: CSP sem default-src \'self\'');
			}

			const scriptSources = csp.get('script-src') ?? [];

			if (!scriptSources.includes("'self'")) {
				violations.push("_headers: CSP script-src sem 'self'");
			}

			// O Pagefind (busca do Starlight) compila WASM no browser: sem o
			// token estrito `wasm-unsafe-eval`, o índice do modal falha com
			// CompileError (achado do QA interativo do DOCS-07). O token
			// autoriza SÓ WebAssembly, não eval de JavaScript.
			if (!scriptSources.includes("'wasm-unsafe-eval'")) {
				violations.push("_headers: CSP script-src sem 'wasm-unsafe-eval' (a busca do Pagefind não carrega o WASM sem ele)");
			}

			for (const forbidden of ["'unsafe-inline'", "'unsafe-eval'"]) {
				if (scriptSources.includes(forbidden)) {
					violations.push(`_headers: CSP script-src não pode conter ${forbidden}`);
				}
			}

			const declaredHashes = new Set(
				scriptSources
					.filter((source) => /^'sha256-[A-Za-z0-9+/=]+'$/u.test(source))
					.map((source) => source.slice(1, -1)),
			);
			const missing = [...servedHashes].filter((hash) => !declaredHashes.has(hash));
			const orphan = [...declaredHashes].filter((hash) => !servedHashes.has(hash));

			if (missing.length > 0) {
				violations.push(
					`_headers: script inline servido sem hash na CSP (script bloqueado pelo browser): ${missing.join(', ')}`,
				);
			}

			if (orphan.length > 0) {
				violations.push(`_headers: hash órfão na CSP (script não existe mais no dist): ${orphan.join(', ')}`);
			}

			if (servedHashes.size === 0) {
				violations.push('_headers: nenhum script inline encontrado no dist (extraindo hashes de páginas erradas?)');
			}

			// img-src admite data: porque o vendor injeta ícones SVG como data URI
			// em <img> (SVG em img não executa script, é sanitizado pelo browser).
			const expectOnlySelf = ['font-src', 'connect-src', 'worker-src'];

			for (const directive of expectOnlySelf) {
				if ((csp.get(directive) ?? []).join(' ') !== "'self'") {
					violations.push(`_headers: CSP ${directive} deve ser exatamente 'self'`);
				}
			}

			const expectExact = new Map([
				['style-src', ["'self'", "'unsafe-inline'"]],
				['img-src', ["'self'", 'data:']],
				['object-src', ["'none'"]],
				['base-uri', ["'self'"]],
				['form-action', ["'self'"]],
				['frame-ancestors', ["'none'"]],
			]);

			for (const [directive, expected] of expectExact) {
				if ((csp.get(directive) ?? []).join(' ') !== expected.join(' ')) {
					violations.push(`_headers: CSP ${directive} deve ser exatamente ${expected.join(' ')}`);
				}
			}
		}

		const expectHeader = [
			['X-Content-Type-Options', 'nosniff'],
			['X-Frame-Options', 'DENY'],
			['Referrer-Policy', 'strict-origin-when-cross-origin'],
		];

		for (const [name, value] of expectHeader) {
			if (globalRule.headers.get(name) !== value) {
				violations.push(`_headers: regra /* deve ter ${name}: ${value}`);
			}
		}

		if (!/max-age=\d+/u.test(globalRule.headers.get('Strict-Transport-Security') ?? '')) {
			violations.push('_headers: regra /* deve ter Strict-Transport-Security com max-age');
		}

		if ((globalRule.headers.get('Permissions-Policy') ?? '').trim() === '') {
			violations.push('_headers: regra /* deve ter Permissions-Policy');
		}
	}

	// Headers de segurança só na regra global: regra mais específica com o
	// mesmo header teria os valores UNIDOS por vírgula pelo Cloudflare.
	for (const rule of rules.filter((rule) => rule.source !== '/*')) {
		for (const name of securityHeaderNames) {
			if (rule.headers.has(name)) {
				violations.push(`_headers: ${name} só pode existir na regra /* (união de valores duplicados): ${rule.source}`);
			}
		}
	}

	// --- noindex: só na origem workers.dev, nunca global ---
	const workersDevRules = rules.filter((rule) => (sourceHost(rule.source) ?? '').endsWith('.workers.dev'));
	let productionShape = false;
	let previewShape = false;

	for (const rule of workersDevRules) {
		const robotsTag = rule.headers.get('X-Robots-Tag') ?? '';

		if (!robotsTag.includes('noindex')) {
			violations.push(`_headers: regra workers.dev sem X-Robots-Tag: noindex: ${rule.source}`);
		}

		const placeholders = ((sourceHost(rule.source) ?? '').match(/:[A-Za-z][A-Za-z0-9_]*/gu) ?? []).length;

		if (placeholders >= 2) {
			productionShape = true;
		}

		if (placeholders >= 3) {
			previewShape = true;
		}
	}

	if (!productionShape) {
		violations.push('_headers: falta regra noindex cobrindo workers.dev de produção (ex.: https://:script.:account.workers.dev/*)');
	}

	if (!previewShape) {
		violations.push('_headers: falta regra noindex cobrindo preview de versão do workers.dev (ex.: https://:version.:script.:account.workers.dev/*)');
	}

	for (const rule of rules) {
		const host = sourceHost(rule.source);

		if (host === null && rule.headers.has('X-Robots-Tag')) {
			violations.push(`_headers: X-Robots-Tag em regra sem host indexaria o custom domain como noindex: ${rule.source}`);
		}

		if (host !== null && !host.endsWith('.workers.dev') && rule.headers.has('X-Robots-Tag')) {
			violations.push(`_headers: X-Robots-Tag em host que não é workers.dev: ${rule.source}`);
		}
	}

	// --- cache imutável para assets com hash no nome ---
	const astroRule = rules.find((rule) => rule.source === '/_astro/*');

	if (astroRule === undefined || !/immutable/u.test(astroRule.headers.get('Cache-Control') ?? '')) {
		violations.push('_headers: regra /_astro/* deve ter Cache-Control com immutable (assets com hash no nome)');
	}

	// --- robots.txt ---
	const robotsSource = await readRequired('public/robots.txt', 'robots');
	const robotsDist = await readRequired('dist/robots.txt', 'robots');

	if (robotsSource !== null && robotsDist !== null && robotsSource !== robotsDist) {
		violations.push('robots: dist/robots.txt difere de public/robots.txt (build desatualizado)');
	}

	if (robotsSource !== null) {
		if (!/^User-agent: \*$/mu.test(robotsSource) || !/^Allow: \/$/mu.test(robotsSource)) {
			violations.push('robots: precisa de "User-agent: *" e "Allow: /"');
		}

		if (/^Disallow: \/$/mu.test(robotsSource)) {
			violations.push('robots: "Disallow: /" bloqueia o rastreamento do acervo público');
		}

		if (site !== undefined && !robotsSource.includes(`Sitemap: ${site}sitemap-index.xml`)) {
			violations.push(`robots: Sitemap deve apontar ${site}sitemap-index.xml`);
		}
	}

	// --- sitemap: toda URL listada é página real do dist ---
	const sitemapIndex = await readRequired('dist/sitemap-index.xml', 'sitemap');
	const sitemap = await readRequired('dist/sitemap-0.xml', 'sitemap');

	if (sitemapIndex !== null && site !== undefined && !sitemapIndex.includes(`<loc>${site}sitemap-0.xml</loc>`)) {
		violations.push('sitemap: sitemap-index.xml não referencia sitemap-0.xml do site canônico');
	}

	if (sitemap !== null && site !== undefined) {
		const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);

		if (locations.length === 0) {
			violations.push('sitemap: sitemap-0.xml sem URLs');
		}

		for (const location of locations) {
			if (!location.startsWith(site) || !location.endsWith('/')) {
				violations.push(`sitemap: URL fora do canônico (site com barra final): ${location}`);
				continue;
			}

			const distPath = join('dist', location.slice(site.length), 'index.html');

			if (await read(distPath) === null) {
				violations.push(`sitemap: URL sem página correspondente no dist: ${location}`);
			}
		}
	}

	// --- 404 custom servido e fora do índice ---
	const notFound404 = await readRequired('dist/404.html', '404');
	const notFoundSource = await read('src/content/docs/404.md');
	const customTitle = notFoundSource?.match(/^title:\s*(.+)$/mu)?.[1];

	if (notFound404 === null || (customTitle !== undefined && !notFound404.includes(customTitle))) {
		violations.push('404: dist/404.html não corresponde ao 404 custom de src/content/docs/404.md');
	}

	if (notFoundSource !== null && customTitle === undefined) {
		violations.push('404: src/content/docs/404.md sem title');
	}

	const searchIndex = await read('dist/search-index.json');

	if (searchIndex !== null) {
		try {
			const parsedIndex = JSON.parse(searchIndex);

			if (parsedIndex.entries?.some((entry) => entry.url === '/404/')) {
				violations.push('404: página utilitária não pode entrar no índice de busca');
			}
		} catch {
			violations.push('404: dist/search-index.json não parseia');
		}
	}

	// --- llms: servidos e com a política pública de uso ---
	for (const name of ['llms.txt', 'llms-full.txt', 'llms-small.txt']) {
		const content = await read(`dist/${name}`);

		if (content === null || content.trim() === '') {
			violations.push(`llms: dist/${name} ausente ou vazio`);
		}
	}

	const llms = await read('dist/llms.txt');

	if (llms !== null) {
		for (const keyword of ['busca', 'citação', 'grounding', 'treinamento']) {
			if (!llms.includes(keyword)) {
				violations.push(`llms: política pública de uso sem "${keyword}" em dist/llms.txt`);
			}
		}
	}

	// --- wrangler.jsonc: static assets com 404 real ---
	let wrangler = null;

	try {
		wrangler = JSON.parse((await readRequired('wrangler.jsonc', 'wrangler')) ?? 'null');
	} catch (error) {
		violations.push(`wrangler: wrangler.jsonc não parseia como JSON (sem comentários): ${error.message}`);
	}

	if (wrangler !== null && typeof wrangler === 'object') {
		if (typeof wrangler.name !== 'string' || wrangler.name === '') {
			violations.push('wrangler: name ausente');
		}

		if (!/^\d{4}-\d{2}-\d{2}$/u.test(wrangler.compatibility_date ?? '')) {
			violations.push('wrangler: compatibility_date deve ser data fixa YYYY-MM-DD');
		}

		if (wrangler.assets?.directory !== './dist') {
			violations.push('wrangler: assets.directory deve ser ./dist');
		}

		if (wrangler.assets?.html_handling !== 'auto-trailing-slash') {
			violations.push('wrangler: assets.html_handling deve ser auto-trailing-slash (canônico do acervo)');
		}

		if (wrangler.assets?.not_found_handling !== '404-page') {
			violations.push('wrangler: assets.not_found_handling deve ser 404-page (404 real, sem SPA fallback)');
		}

		if (wrangler.main !== undefined) {
			violations.push('wrangler: main não pode existir (respostas de Worker não recebem os _headers)');
		}

		if (wrangler.assets?.run_worker_first !== undefined && wrangler.assets.run_worker_first !== false) {
			violations.push('wrangler: run_worker_first desvia o tráfego do asset server e dos _headers');
		}
	}

	return violations;
}

const invokedDirectly = process.argv[1] !== undefined
	&& import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
	const violations = await checkPublishing();

	if (violations.length > 0) {
		console.error(violations.join('\n'));
		process.exitCode = 1;
	} else {
		console.log('Static publishing: PASS');
	}
}
