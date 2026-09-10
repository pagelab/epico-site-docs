#!/usr/bin/env node
// Sonda de produção (DOCS-08): verifica a publicação real depois do deploy,
// no domínio canônico e na origem workers.dev. É ferramenta de sessão como o
// probe-csp e o measure-theme: depende de rede e de deploy vivo, por isso não
// faz parte do `verify`. Uso:
//   node scripts/probe-production.mjs [origem] [origemWorkersDev]
// Exit 0 somente com todas as verificações em verde.
//
// Cobertura exigida pelo DOCS-08, cada uma em verificação própria: DNS/TLS,
// HTTP, CORS, cache, ETag, sitemap, robots, llms e CSP. Os bytes servidos
// (search-index.json, sitemap, llms) são comparados com o `dist/` local quando
// disponível, provando que a produção serve exatamente a árvore construída.
import { readFile } from 'node:fs/promises';
import { lookup } from 'node:dns/promises';
import { connect as tlsConnect } from 'node:tls';

const ORIGIN = process.argv[2] ?? 'https://tutoriais.epico.site';
// Subdomínio workers.dev real da conta, confirmado via API em 2026-09-10 (o
// palpite `pagelab` do DOCS-06 estava errado; os placeholders `:script`/
// `:account` do `_headers` sempre casaram a origem correta).
const WORKERS_ORIGIN =
	process.argv[3] ?? 'https://epico-site-docs.epico.workers.dev';
const HOST = new URL(ORIGIN).hostname;

const results = [];
async function check(name, fn) {
	try {
		const detail = await fn();
		results.push({ name, ok: true, detail });
	} catch (error) {
		results.push({ name, ok: false, detail: error.message });
	}
}
function assert(condition, message) {
	if (!condition) throw new Error(message);
}
function header(headers, name) {
	return headers.get(name) ?? '';
}
// O certificado gerenciado do Custom Domain cobre o host por wildcard de um
// rótulo (`*.epico.site` cobre `tutoriais.epico.site`), então o SAN precisa
// ser casado por regra, não por substring literal.
function sanCoversHost(san, host) {
	return san
		.split(',')
		.map((part) => part.trim().replace(/^DNS:/iu, ''))
		.some((name) => {
			if (name === host) return true;
			if (!name.startsWith('*.')) return false;
			const suffix = name.slice(1);
			if (!host.endsWith(suffix)) return false;
			const label = host.slice(0, host.length - suffix.length);
			return label.length > 0 && !label.includes('.');
		});
}

async function get(path, origin = ORIGIN, redirect = 'follow') {
	return fetch(`${origin}${path}`, { redirect });
}

async function main() {
	const home = await get('/');
	const homeHtml = await home.clone().text();

	await check(`DNS: ${HOST} resolve`, async () => {
		const addresses = await lookup(HOST, { all: true });
		assert(addresses.length > 0, 'nenhum endereço resolvido');
		return addresses.map((entry) => entry.address).join(', ');
	});

	await check('TLS: certificado válido para o host', async () => {
		const info = await new Promise((resolve, reject) => {
			const socket = tlsConnect(
				{ host: HOST, port: 443, servername: HOST, timeout: 10_000 },
				() => {
					try {
						resolve(socket.getPeerCertificate());
					} catch (error) {
						reject(error);
					} finally {
						socket.end();
					}
				},
			);
			socket.on('error', reject);
			socket.on('timeout', () => {
				socket.destroy();
				reject(new Error('timeout no handshake TLS'));
			});
		});
		assert(
			sanCoversHost(info.subjectaltname ?? '', HOST),
			`SAN não cobre ${HOST}: ${info.subjectaltname ?? 'vazio'}`,
		);
		assert(
			new Date(info.valid_to).getTime() > Date.now(),
			`certificado expirado em ${info.valid_to}`,
		);
		return `emissor ${info.issuer?.O ?? 'desconhecido'}, válido até ${info.valid_to}`;
	});

	await check('HTTP: http:// redireciona para https://', async () => {
		const response = await fetch(`http://${HOST}/`, { redirect: 'manual' });
		assert(
			[301, 308].includes(response.status),
			`status ${response.status} em vez de redirect permanente`,
		);
		assert(
			header(response.headers, 'location').startsWith('https://'),
			'Location não aponta para https',
		);
		return `301/308 para ${header(response.headers, 'location')}`;
	});

	await check('HTTP: home 200 text/html sem noindex', async () => {
		assert(home.status === 200, `status ${home.status}`);
		assert(
			header(home.headers, 'content-type').includes('text/html'),
			`content-type ${header(home.headers, 'content-type')}`,
		);
		assert(
			!header(home.headers, 'x-robots-tag'),
			`custom domain recebeu X-Robots-Tag: ${header(home.headers, 'x-robots-tag')}`,
		);
		return `${homeHtml.length} bytes`;
	});

	await check('CSP: estrutura íntegra no domínio canônico', async () => {
		const csp = header(home.headers, 'content-security-policy');
		assert(csp.length > 0, 'header CSP ausente');
		const directives = new Map(
			csp.split(';').map((part) => {
				const [name, ...values] = part.trim().split(/\s+/u);
				return [name, values];
			}),
		);
		assert(
			directives.get('default-src')?.join(' ') === "'self'",
			`default-src ${directives.get('default-src')?.join(' ')}`,
		);
		const scriptSrc = directives.get('script-src') ?? [];
		assert(
			scriptSrc.some((token) => token.startsWith("'sha256-")),
			'script-src sem hashes SHA-256',
		);
		assert(
			scriptSrc.includes("'wasm-unsafe-eval'"),
			'script-src sem wasm-unsafe-eval (Pagefind quebrado)',
		);
		assert(!scriptSrc.includes("'unsafe-inline'"), 'script-src com unsafe-inline');
		assert(!scriptSrc.includes("'unsafe-eval'"), 'script-src com unsafe-eval');
		assert(
			directives.get('object-src')?.includes("'none'"),
			'object-src sem none',
		);
		assert(
			directives.get('frame-ancestors')?.includes("'none'"),
			'frame-ancestors sem none',
		);
		return `${scriptSrc.filter((t) => t.startsWith("'sha256-")).length} hashes`;
	});

	await check('Headers de segurança no domínio canônico', async () => {
		const expected = {
			'x-content-type-options': 'nosniff',
			'x-frame-options': 'DENY',
			'referrer-policy': 'strict-origin-when-cross-origin',
			'strict-transport-security': /max-age=\d+/u,
			'permissions-policy': /.+/u,
		};
		for (const [name, want] of Object.entries(expected)) {
			const got = header(home.headers, name);
			assert(
				want instanceof RegExp ? want.test(got) : got === want,
				`${name}: "${got}"`,
			);
		}
		return 'nosniff, DENY, referrer, HSTS e permissions presentes';
	});

	await check('CORS: nenhum Access-Control-Allow-Origin aberto', async () => {
		for (const path of ['/', '/search-index.json']) {
			const response = await get(path);
			assert(
				!response.headers.has('access-control-allow-origin'),
				`${path} responde ${header(response.headers, 'access-control-allow-origin')}`,
			);
		}
		return 'home e search-index.json sem ACAO';
	});

	await check('HTTP: /busca/ 200 e /busca redireciona', async () => {
		const page = await get('/busca/');
		assert(page.status === 200, `/busca/ status ${page.status}`);
		const redirect = await get('/busca', ORIGIN, 'manual');
		// O runtime de static assets emite 307 no redirect de barra final
		// (comportamento fixo da plataforma com auto-trailing-slash).
		assert(
			[301, 302, 307, 308].includes(redirect.status),
			`/busca status ${redirect.status}`,
		);
		assert(
			header(redirect.headers, 'location').endsWith('/busca/'),
			`location ${header(redirect.headers, 'location')}`,
		);
		return '200 e redirect com barra final';
	});

	await check('HTTP: 404 real com a página custom', async () => {
		const response = await get('/sonda-rota-inexistente-do08');
		assert(response.status === 404, `status ${response.status}`);
		const body = await response.text();
		assert(
			body.includes('não corresponde a nenhuma página'),
			'corpo não é o 404 custom',
		);
		return '404 com corpo custom';
	});

	await check(
		'Cache/ETag: /_astro/* immutable com revalidação 304',
		async () => {
			const match = homeHtml.match(/\/_astro\/[^"']+\.js/u);
			assert(match, 'home não referencia asset /_astro/');
			const asset = await get(match[0]);
			assert(asset.status === 200, `asset status ${asset.status}`);
			const cache = header(asset.headers, 'cache-control');
			assert(/immutable/u.test(cache), `cache-control "${cache}"`);
			const etag = header(asset.headers, 'etag');
			assert(etag.length > 0, 'asset sem ETag');
			const conditional = await fetch(`${ORIGIN}${match[0]}`, {
				redirect: 'manual',
				headers: { 'if-none-match': etag },
			});
			assert(
				conditional.status === 304,
				`If-None-Match respondeu ${conditional.status}`,
			);
			return `${match[0]} immutable, ETag revalidado com 304`;
		},
	);

	await check('Cache/ETag: HTML com ETag', async () => {
		const etag = header(home.headers, 'etag');
		assert(etag.length > 0, 'home sem ETag');
		const conditional = await fetch(`${ORIGIN}/`, {
			headers: { 'if-none-match': etag },
		});
		return `etag presente, If-None-Match respondeu ${conditional.status}`;
	});

	await check('Sitemap: produção idêntica ao dist local', async () => {
		const index = await get('/sitemap-index.xml');
		assert(index.status === 200, `sitemap-index status ${index.status}`);
		const indexBody = await index.text();
		assert(
			indexBody.includes('/sitemap-0.xml'),
			'sitemap-index não aponta sitemap-0.xml',
		);
		const live = await get('/sitemap-0.xml');
		assert(live.status === 200, `sitemap-0 status ${live.status}`);
		const liveUrls = [...(await live.text()).matchAll(/<loc>([^<]+)<\/loc>/gu)]
			.map((entry) => entry[1])
			.sort();
		let detail = `${liveUrls.length} URLs ao vivo`;
		try {
			const local = (await readFile('dist/sitemap-0.xml', 'utf8'))
				.match(/<loc>([^<]+)<\/loc>/gu)
				?.map((entry) => entry.replace(/<\/?loc>/gu, ''))
				.sort();
			assert(local, 'dist/sitemap-0.xml sem URLs');
			assert(
				JSON.stringify(local) === JSON.stringify(liveUrls),
				`conjunto divergente do dist: ${local?.length} locais, ${liveUrls.length} ao vivo`,
			);
			detail += ', 1:1 com o dist';
		} catch {
			detail += ' (dist local indisponível para comparação)';
		}
		for (const url of liveUrls) {
			assert(
				url.startsWith(`${ORIGIN}/`),
				`URL fora da origem canônica: ${url}`,
			);
			const response = await fetch(url, { method: 'HEAD' });
			assert(
				response.status === 200,
				`${url} respondeu ${response.status} no HEAD`,
			);
		}
		return detail;
	});

	await check('Robots: Allow com Sitemap canônico', async () => {
		const response = await get('/robots.txt');
		assert(response.status === 200, `status ${response.status}`);
		const body = await response.text();
		assert(!/disallow:\s*\/$/imu.test(body), 'contém Disallow: /');
		assert(body.includes('Allow:'), 'sem Allow');
		assert(
			body.includes(`Sitemap: ${ORIGIN}/sitemap-index.xml`),
			'sem Sitemap canônico',
		);
		return 'Allow e Sitemap presentes';
	});

	await check('llms: três arquivos servidos, política no llms.txt', async () => {
		for (const file of ['llms.txt', 'llms-full.txt', 'llms-small.txt']) {
			const response = await get(`/${file}`);
			assert(response.status === 200, `${file} status ${response.status}`);
			const body = await response.text();
			assert(body.trim().length > 0, `${file} vazio`);
			if (file === 'llms.txt') {
				// Contrato do gate check-publishing: a política pública vive nos
				// details do llms.txt; as variantes full/small são conteúdo
				// derivado e não repetem o bloco de política.
				for (const word of ['busca', 'citação', 'grounding', 'treinamento']) {
					assert(body.includes(word), `${file} sem a palavra "${word}"`);
				}
			}
		}
		return 'llms, llms-full e llms-small servidos; política no llms.txt';
	});

	await check('search-index.json: bytes idênticos ao dist', async () => {
		const response = await get('/search-index.json');
		assert(response.status === 200, `status ${response.status}`);
		assert(
			header(response.headers, 'content-type').includes('application/json'),
			`content-type ${header(response.headers, 'content-type')}`,
		);
		const live = await response.text();
		const payload = JSON.parse(live);
		assert(payload.version === 1, `version ${payload.version}`);
		assert(Array.isArray(payload.entries), 'entries não é lista');
		let detail = `${payload.entries.length} entradas`;
		try {
			const local = await readFile('dist/search-index.json', 'utf8');
			assert(
				local === live,
				'bytes ao vivo divergem do dist local (build fora de sincronia)',
			);
			detail += ', bytes 1:1 com o dist';
		} catch {
			detail += ' (dist local indisponível para comparação)';
		}
		return detail;
	});

	await check('workers.dev: canary 200 com noindex', async () => {
		const response = await fetch(WORKERS_ORIGIN, { redirect: 'manual' });
		assert(
			response.status === 200,
			`status ${response.status} em ${WORKERS_ORIGIN}`,
		);
		const robots = header(response.headers, 'x-robots-tag');
		assert(/noindex/u.test(robots), `X-Robots-Tag "${robots}"`);
		assert(
			header(response.headers, 'content-security-policy').length > 0,
			'origem workers.dev sem CSP',
		);
		return `${WORKERS_ORIGIN} com noindex e CSP`;
	});

	let failed = 0;
	for (const result of results) {
		console.log(
			`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}${result.ok ? '' : ` — ${result.detail}`}`,
		);
		if (result.ok) console.log(`      ${result.detail}`);
		else failed += 1;
	}
	console.log(
		`\n${results.length - failed}/${results.length} verificações em verde`,
	);
	if (failed > 0) process.exit(1);
}

main().catch((error) => {
	console.error(`falha ao executar a sonda: ${error.message}`);
	process.exit(1);
});
