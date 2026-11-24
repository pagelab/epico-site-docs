#!/usr/bin/env node
// Sonda de produção (DOCS-08): verifica a publicação real depois do deploy,
// no domínio canônico e na origem workers.dev. É ferramenta de sessão como o
// probe-csp e o measure-theme: depende de rede e de deploy vivo, por isso não
// faz parte do `verify`. Uso:
//   node scripts/probe-production.mjs [origem] [origemWorkersDev]
//   node scripts/probe-production.mjs --commit=<sha>   (commit esperado)
//   node scripts/probe-production.mjs --sem-dist       (pula a comparação)
// Exit 0 somente com todas as verificações em verde (SKIP explícito não é
// falha, mas aparece no resumo).
//
// Cobertura exigida pelo DOCS-08, cada uma em verificação própria: DNS/TLS,
// HTTP, CORS, cache, ETag, sitemap, robots, llms e CSP.
//
// Versão servida (auditoria de 2026-11-23, Brain #44 §7): a sonda lê
// `/build-info.json` e exige que a produção sirva o commit esperado (por
// padrão o `main` do remoto `origin`, via `git ls-remote`). A comparação de
// bytes com o `dist/` local só roda quando `dist/build-info.json` é do MESMO
// commit servido e sem mudança local. Caso contrário a verificação FALHA com
// instrução, em vez de comparar com um build de outro commit. Divergência de
// bytes sempre falha: nunca é reportada como "dist indisponível".
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { lookup } from 'node:dns/promises';
import { connect as tlsConnect } from 'node:tls';
import {
	SEARCH_INDEX_VERSION,
	validateSearchIndexPayload,
} from '../src/lib/search-index.mjs';
import { validateBuildInfo } from '../src/lib/build-info.mjs';

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const flag = (name) => args.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));
const SKIP_DIST = flag('sem-dist') !== undefined;
const EXPECTED_COMMIT_ARG = flag('commit')?.split('=')[1]?.trim().toLowerCase();

const ORIGIN = positional[0] ?? 'https://tutoriais.epico.site';
// Subdomínio workers.dev real da conta, confirmado via API em 2026-09-10 (o
// palpite `pagelab` do DOCS-06 estava errado; os placeholders `:script`/
// `:account` do `_headers` sempre casaram a origem correta).
const WORKERS_ORIGIN =
	positional[1] ?? 'https://epico-site-docs.epico.workers.dev';
const HOST = new URL(ORIGIN).hostname;

// Toda requisição tem teto de tempo: sem ele, uma origem pendurada trava a
// sonda indefinidamente em vez de falhar.
const FETCH_TIMEOUT_MS = 15_000;
function probeFetch(url, init = {}) {
	return fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), ...init });
}

class Skip extends Error {}

const results = [];
async function check(name, fn) {
	try {
		const detail = await fn();
		results.push({ name, status: 'PASS', detail });
	} catch (error) {
		results.push({
			name,
			status: error instanceof Skip ? 'SKIP' : 'FAIL',
			detail: error.message,
		});
	}
}

// Lê um arquivo do dist local; só a ausência do arquivo vira `null`. Qualquer
// outro erro sobe e derruba a verificação.
async function readDist(relative) {
	try {
		return await readFile(`dist/${relative}`, 'utf8');
	} catch (error) {
		if (error?.code === 'ENOENT') return null;
		throw error;
	}
}

function expectedCommit() {
	if (EXPECTED_COMMIT_ARG !== undefined) {
		assert(/^[0-9a-f]{40}$/u.test(EXPECTED_COMMIT_ARG), `--commit inválido: ${EXPECTED_COMMIT_ARG}`);
		return { sha: EXPECTED_COMMIT_ARG, from: '--commit' };
	}
	const output = execFileSync('git', ['ls-remote', 'origin', 'refs/heads/main'], {
		encoding: 'utf8',
		timeout: FETCH_TIMEOUT_MS,
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	const sha = output.split(/\s+/u)[0];
	assert(/^[0-9a-f]{40}$/u.test(sha ?? ''), `git ls-remote sem SHA do main: "${output.trim()}"`);
	return { sha, from: 'origin/main' };
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
	return probeFetch(`${origin}${path}`, { redirect });
}

async function main() {
	const home = await get('/');
	const homeHtml = await home.clone().text();

	// Identidade da versão servida. `liveCommit` decide se o dist local pode
	// servir de referência para as comparações de bytes abaixo.
	let liveCommit = null;
	await check('Versão: produção serve o commit esperado', async () => {
		const response = await get('/build-info.json');
		assert(response.status === 200, `/build-info.json status ${response.status}`);
		const validated = validateBuildInfo(await response.json());
		assert(validated.ok, `/build-info.json fora do contrato: ${validated.ok ? '' : validated.reason}`);
		const { info } = validated;
		assert(info.commit !== null, '/build-info.json sem commit (build fora do Workers Builds?)');
		liveCommit = info.commit;
		assert(info.source === 'workers-ci', `produção construída fora do Workers Builds (source ${info.source})`);
		const expected = expectedCommit();
		assert(
			info.commit === expected.sha,
			`produção serve ${info.commit.slice(0, 12)}, ${expected.from} é ${expected.sha.slice(0, 12)} (deploy pendente ou falho)`,
		);
		return `commit ${info.commit.slice(0, 12)} = ${expected.from}, build do Workers Builds`;
	});

	// O dist local só é referência se for do commit servido e sem mudança
	// local. Devolve o conteúdo pedido ou lança (FAIL com instrução, ou SKIP
	// explícito com --sem-dist).
	async function distReference(relative) {
		if (SKIP_DIST) throw new Skip('comparação com o dist pulada por --sem-dist');
		assert(liveCommit !== null, 'versão servida desconhecida, sem referência para comparar');
		const raw = await readDist('build-info.json');
		const instruction = `construa o commit servido (git checkout ${liveCommit.slice(0, 12)} && npm run build) ou use --sem-dist`;
		assert(raw !== null, `dist/build-info.json ausente: ${instruction}`);
		const local = validateBuildInfo(JSON.parse(raw));
		assert(local.ok, `dist/build-info.json fora do contrato: ${local.ok ? '' : local.reason}`);
		assert(
			local.info.commit === liveCommit && !local.info.dirty,
			`dist local é de ${local.info.commit?.slice(0, 12) ?? 'commit desconhecido'}${local.info.dirty ? ' com mudança local' : ''}, produção serve ${liveCommit.slice(0, 12)}: ${instruction}`,
		);
		const content = await readDist(relative);
		assert(content !== null, `dist/${relative} ausente no build do commit servido`);
		return content;
	}

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
		const response = await probeFetch(`http://${HOST}/`, { redirect: 'manual' });
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

	// Política de CORS (PANEL-01B, 2026-10-09): nenhum caminho tem
	// Access-Control-Allow-Origin, EXCETO /search-index.json, que o painel em
	// app.epico.site lê cross-origin e precisa devolver exatamente essa origem.
	// Nunca `*`, nunca outra origem, nunca Allow-Credentials.
	const CORS_PANEL_ORIGIN = 'https://app.epico.site';
	await check(
		'CORS: sem ACAO aberto, só /search-index.json para o painel',
		async () => {
			for (const path of ['/', '/busca/', '/llms.txt', '/sitemap-index.xml']) {
				const response = await get(path);
				assert(
					!response.headers.has('access-control-allow-origin'),
					`${path} responde ACAO ${header(response.headers, 'access-control-allow-origin')}`,
				);
			}
			const index = await probeFetch(`${ORIGIN}/search-index.json`, {
				headers: { origin: CORS_PANEL_ORIGIN },
			});
			assert(index.status === 200, `/search-index.json status ${index.status}`);
			const allowed = index.headers.get('access-control-allow-origin');
			assert(
				allowed === CORS_PANEL_ORIGIN,
				`/search-index.json ACAO "${allowed ?? 'ausente'}" em vez de ${CORS_PANEL_ORIGIN}`,
			);
			assert(
				!index.headers.has('access-control-allow-credentials'),
				'/search-index.json responde Access-Control-Allow-Credentials',
			);
			const foreign = await probeFetch(`${ORIGIN}/search-index.json`, {
				headers: { origin: 'https://example.com' },
			});
			assert(
				foreign.headers.get('access-control-allow-origin') === CORS_PANEL_ORIGIN,
				'ACAO do índice deve ser fixo (a origem pedida não pode ser refletida)',
			);
			return `ACAO ${CORS_PANEL_ORIGIN} só em /search-index.json; demais caminhos sem ACAO`;
		},
	);

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
			const conditional = await probeFetch(`${ORIGIN}${match[0]}`, {
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
		const conditional = await probeFetch(`${ORIGIN}/`, {
			headers: { 'if-none-match': etag },
		});
		assert(
			[200, 304].includes(conditional.status),
			`If-None-Match respondeu ${conditional.status}`,
		);
		return `etag presente, If-None-Match respondeu ${conditional.status}`;
	});

	await check('Sitemap: índice e URLs servidos', async () => {
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
		for (const url of liveUrls) {
			assert(
				url.startsWith(`${ORIGIN}/`),
				`URL fora da origem canônica: ${url}`,
			);
			const response = await probeFetch(url, { method: 'HEAD' });
			assert(
				response.status === 200,
				`${url} respondeu ${response.status} no HEAD`,
			);
		}
		return `${liveUrls.length} URLs ao vivo, todas 200 na origem canônica`;
	});

	await check('Sitemap: 1:1 com o dist do commit servido', async () => {
		const live = await get('/sitemap-0.xml');
		assert(live.status === 200, `sitemap-0 status ${live.status}`);
		const liveUrls = [...(await live.text()).matchAll(/<loc>([^<]+)<\/loc>/gu)]
			.map((entry) => entry[1])
			.sort();
		const local = [...(await distReference('sitemap-0.xml')).matchAll(/<loc>([^<]+)<\/loc>/gu)]
			.map((entry) => entry[1])
			.sort();
		assert(local.length > 0, 'dist/sitemap-0.xml sem URLs');
		assert(
			JSON.stringify(local) === JSON.stringify(liveUrls),
			`conjunto divergente do dist: ${local.length} locais, ${liveUrls.length} ao vivo`,
		);
		return `${local.length} URLs, 1:1 com o dist`;
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

	await check('search-index.json: contrato do consumidor', async () => {
		const response = await get('/search-index.json');
		assert(response.status === 200, `status ${response.status}`);
		assert(
			header(response.headers, 'content-type').includes('application/json'),
			`content-type ${header(response.headers, 'content-type')}`,
		);
		const live = await response.text();
		const payload = JSON.parse(live);
		assert(
			payload.version === SEARCH_INDEX_VERSION,
			`version ${payload.version} (esperada ${SEARCH_INDEX_VERSION})`,
		);
		// O contrato inteiro, com o validador do consumidor: nenhuma entrada
		// servida pode ser descartada (simetria produtor → consumidor ao vivo).
		const validated = validateSearchIndexPayload(payload);
		assert(validated.ok, `fora do contrato: ${validated.ok ? '' : validated.reason}`);
		assert(validated.discarded === 0, `${validated.discarded} entradas descartadas pelo validador`);
		const withKeywords = payload.entries.filter((entry) => entry.keywords.length > 0).length;
		return `versão ${payload.version}, ${payload.entries.length} entradas, ${withKeywords} com keywords`;
	});

	await check('search-index.json: bytes 1:1 com o dist do commit servido', async () => {
		const response = await get('/search-index.json');
		assert(response.status === 200, `status ${response.status}`);
		const live = await response.text();
		const local = await distReference('search-index.json');
		assert(local === live, 'bytes ao vivo divergem do dist do commit servido');
		return `${live.length} bytes idênticos`;
	});

	await check('workers.dev: canary 200 com noindex', async () => {
		const response = await probeFetch(WORKERS_ORIGIN, { redirect: 'manual' });
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

	const count = (status) => results.filter((result) => result.status === status).length;
	for (const result of results) {
		console.log(
			result.status === 'PASS'
				? `PASS  ${result.name}\n      ${result.detail}`
				: `${result.status}  ${result.name} — ${result.detail}`,
		);
	}
	const skipped = count('SKIP');
	console.log(
		`\n${count('PASS')}/${results.length} verificações em verde${skipped > 0 ? `, ${skipped} pulada(s)` : ''}`,
	);
	if (count('FAIL') > 0) process.exit(1);
}

main().catch((error) => {
	console.error(`falha ao executar a sonda: ${error.message}`);
	process.exit(1);
});
