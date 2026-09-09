/**
 * Bateria adversarial do índice de busca (DOCS-04C).
 * Diferente das suítes por módulo, esta prova propriedades do ARTEFATO real
 * servido em `/search-index.json` e do consumidor nos limites do contrato:
 * - o corpus real gera índice 1:1 com as rotas, sem corpo de artigo e sem PII;
 * - nenhum prefixo truncado do artefato real é aceitável (truncagem de rede);
 * - sondas estruturais contra o validador (`__proto__`, duplicatas, tetos,
 *   segmento `index`);
 * - o pipeline completo roda no teto de 200 entradas em tempo interativo.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import {
	SEARCH_INDEX_MAX_BYTES,
	SEARCH_INDEX_MAX_ENTRIES,
	findPii,
	generateSearchIndex,
	serializeSearchIndex,
	slugToUrl,
	validateSearchIndexPayload,
} from '../src/lib/search-index.mjs';
import { SEARCH_RESULTS_LIMIT, fetchSearchIndex, filterSearchEntries } from '../src/lib/search-client.mjs';

const CONTENT_ROOT = resolve(process.cwd(), 'src/content/docs');

type CorpusFile = {
	slug: string;
	title: string;
	description: string;
	topic: string;
	draft: boolean;
	lastReviewed: string;
	body: string;
};

function corpusFiles(directory = CONTENT_ROOT): string[] {
	return readdirSync(directory)
		.flatMap((name) => {
			const full = join(directory, name);

			return statSync(full).isDirectory() ? corpusFiles(full) : full.endsWith('.md') ? [full] : [];
		})
		.sort();
}

/**
 * Parser do subconjunto de frontmatter que o acervo usa: chaves planas
 * `chave: valor` na raiz do bloco. Linhas indentadas (sidebar, hero) pertencem
 * a outras chaves e são ignoradas. É propositalmente mínimo: a sonda precisa
 * da fonte editorial tal como é, não de YAML genérico.
 */
function parseCorpusFile(path: string): CorpusFile {
	const raw = readFileSync(path, 'utf8');
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/u);

	if (match === null) {
		throw new Error(`adversarial: frontmatter não encontrado em ${path}`);
	}

	const values = new Map<string, string>();

	for (const line of match[1].split(/\r?\n/u)) {
		const top = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t](.*))?$/u);

		if (top !== null) {
			values.set(top[1], (top[2] ?? '').trim().replace(/^["']|["']$/gu, ''));
		}
	}

	const pick = (key: string): string => {
		const value = values.get(key);

		if (value === undefined || value === '') {
			throw new Error(`adversarial: campo ${key} ausente em ${path}`);
		}

		return value;
	};

	const draft = pick('draft');

	if (draft !== 'true' && draft !== 'false') {
		throw new Error(`adversarial: draft não booleano em ${path}: ${draft}`);
	}

	return {
		slug: relative(CONTENT_ROOT, path).replace(/\.md$/u, ''),
		title: pick('title'),
		description: pick('description'),
		topic: pick('topic'),
		draft: draft === 'true',
		lastReviewed: pick('lastReviewed'),
		body: match[2] ?? '',
	};
}

/** O corpus real, lido da única autoridade editorial (`src/content/docs/`). */
const corpus = corpusFiles().map(parseCorpusFile);

/** Entradas tal como o endpoint as entrega ao gerador (sem o corpo). */
function generatorInputs() {
	return corpus.map(({ body: _body, ...fields }) => fields);
}

/** O artefato servido, derivado da mesma fonte que o endpoint usa no build. */
const artifact = serializeSearchIndex(generateSearchIndex(generatorInputs()));

type ArtifactPayload = { entries: Array<{ url: string; title: string; description: string }> };

function artifactPayload(): ArtifactPayload {
	return JSON.parse(artifact) as ArtifactPayload;
}

describe('adversarial: corpus real e o artefato servido', () => {
	it('um artigo por arquivo, sem sobra e sem perda, dentro dos tetos', () => {
		expect(corpus.length).toBeGreaterThanOrEqual(6);
		expect(corpus.length).toBeLessThanOrEqual(SEARCH_INDEX_MAX_ENTRIES);
		expect(artifactPayload().entries).toHaveLength(corpus.length);
		expect(artifact.length).toBeLessThanOrEqual(SEARCH_INDEX_MAX_BYTES);
	});

	it('cada entrada reproduz exatamente o frontmatter: nenhum corpo de artigo viaja', () => {
		for (const file of corpus) {
			const entry = artifactPayload().entries.find((candidate) => candidate.url === slugToUrl(file.slug));

			expect(entry, `entrada para ${file.slug}`).toBeDefined();
			expect(entry?.title).toBe(file.title.trim());
			expect(entry?.description).toBe(file.description.trim());
		}
	});

	it('toda URL do índice corresponde a um arquivo real do acervo (1:1 com as rotas)', () => {
		const files = new Set(corpus.map((file) => `${file.slug}.md`));

		for (const { url } of artifactPayload().entries) {
			const segments = url.slice(1, -1).split('/');
			const direct = `${segments.join('/')}.md`;
			const asIndex = `${[...segments.slice(0, -1), 'index'].join('/')}.md`;

			expect(files.has(direct) || files.has(asIndex), `url ${url}`).toBe(true);
		}
	});

	it('o artefato passa 100% no contrato do consumidor (round-trip produtor → consumidor)', () => {
		const validated = validateSearchIndexPayload(JSON.parse(artifact));

		expect(validated).toMatchObject({ ok: true, discarded: 0 });
	});

	it('nenhum PII, rascunho ou corpo nos bytes servidos', () => {
		expect(findPii(artifact)).toBeNull();
		expect(artifact).not.toContain('"draft"');
		expect(artifact).not.toContain('"body"');
	});

	it('nenhuma linha longa do corpo de artigo aparece no índice', () => {
		for (const file of corpus) {
			const longLines = file.body
				.split(/\r?\n/u)
				.map((line) => line.trim())
				.filter((line) => line.length >= 40);

			for (const line of longLines) {
				expect(artifact, `corpo de ${file.slug}`).not.toContain(line);
			}
		}
	});
});

describe('adversarial: truncagem de rede sobre o artefato real', () => {
	function prefixAccepted(prefix: string): boolean {
		let parsed: unknown;

		try {
			parsed = JSON.parse(prefix);
		} catch {
			return false;
		}

		return validateSearchIndexPayload(parsed).ok === true;
	}

	it('nenhum prefixo próprio do artefato é aceito pelo consumidor', () => {
		expect(artifact.length).toBeGreaterThan(1_000);

		for (let cut = 0; cut < artifact.length; cut += 1) {
			expect(prefixAccepted(artifact.slice(0, cut)), `prefixo de ${cut} caracteres`).toBe(false);
		}
	});

	it('corte em byte no meio de caractere acentuado também é rejeitado', () => {
		const accented = artifact.indexOf('ã');

		expect(accented).toBeGreaterThanOrEqual(0);

		const bytes = Buffer.from(artifact, 'utf8');
		const cutByte = Buffer.byteLength(artifact.slice(0, accented + 1), 'utf8') - 1;
		const decoded = bytes.subarray(0, cutByte).toString('utf8');

		expect(prefixAccepted(decoded)).toBe(false);
	});

	it('subconjunto sintético válido é aceito: completude não é alegável pelo contrato', () => {
		// Limite documentado da defesa: o contrato garante que toda entrada que
		// sobrevive é individualmente segura (URL interna, campos tetados, sem
		// PII), não que o acervo está completo. Completude exigiria assinatura
		// ou checksum, ausentes no payload versão 1; a integridade do
		// transporte é dever de same-origin + HTTPS, não do validador.
		const entries = artifactPayload().entries;

		expect(entries[0]).toBeDefined();

		const partial = validateSearchIndexPayload({ version: 1, entries: [entries[0]!] });

		expect(partial).toMatchObject({ ok: true, discarded: 0 });
	});
});

describe('adversarial: sondas estruturais contra o validador', () => {
	const validEntry = {
		url: '/primeiros-passos/sonda/',
		title: 'Sonda',
		description: 'Sonda do validador.',
		topic: 'primeiros-passos',
		lastReviewed: '2026-09-08',
	};

	it('descarta chaves próprias __proto__ e constructor (vetor JSON.parse)', () => {
		for (const key of ['__proto__', 'constructor']) {
			const hostile = JSON.parse(
				`{"url":"/primeiros-passos/sonda/","title":"T","description":"D","topic":"primeiros-passos","lastReviewed":"2026-09-08","${key}":{"url":"javascript:alert(1)"}}`,
			);

			const result = validateSearchIndexPayload({ version: 1, entries: [hostile, validEntry] });

			expect(result, key).toMatchObject({ ok: true, discarded: 1 });
		}
	});

	it('rejeita version string, entries array-like e url só de barras', () => {
		expect(validateSearchIndexPayload({ version: '1', entries: [] }).ok).toBe(false);
		expect(validateSearchIndexPayload({ version: 1, entries: { length: 1, 0: validEntry } }).ok).toBe(false);
		expect(validateSearchIndexPayload({ version: 1, entries: [{ ...validEntry, url: '//' }] }).ok).toBe(false);
	});

	it('URL repetida no payload: a primeira vence, as repetições são descartadas', () => {
		const result = validateSearchIndexPayload({
			version: 1,
			entries: [validEntry, { ...validEntry, title: 'Clone' }, validEntry],
		});

		expect(result).toMatchObject({ ok: true, discarded: 2 });
	});

	it('segmento final index é descartado no consumidor e derruba o build no produtor', () => {
		expect(validateSearchIndexPayload({ version: 1, entries: [{ ...validEntry, url: '/area/index/' }] }).ok).toBe(
			false,
		);

		expect(() =>
			generateSearchIndex([{ ...validEntry, slug: 'area/index/index', draft: false }]),
		).toThrow(/segmento final "index"/);
	});

	it('teto de entradas é inclusivo no limite, no consumidor e no produtor', () => {
		const consumerAtCap = Array.from({ length: SEARCH_INDEX_MAX_ENTRIES }, (_unused, index) => ({
			...validEntry,
			url: `/primeiros-passos/limite-${index}/`,
		}));

		expect(validateSearchIndexPayload({ version: 1, entries: consumerAtCap })).toMatchObject({
			ok: true,
			discarded: 0,
		});
		expect(validateSearchIndexPayload({ version: 1, entries: [...consumerAtCap, validEntry] }).ok).toBe(false);

		const producerAtCap = consumerAtCap.map((_entry, index) => ({
			slug: `primeiros-passos/limite-${index}`,
			title: 'Limite',
			description: 'Entrada sintética da sonda de teto.',
			topic: 'primeiros-passos',
			draft: false,
			lastReviewed: '2026-09-08',
		}));

		expect(generateSearchIndex(producerAtCap).entries).toHaveLength(SEARCH_INDEX_MAX_ENTRIES);
		expect(() =>
			generateSearchIndex([
				...producerAtCap,
				{
					slug: 'primeiros-passos/extra',
					title: 'Limite',
					description: 'Entrada sintética da sonda de teto.',
					topic: 'primeiros-passos',
					draft: false,
					lastReviewed: '2026-09-08',
				},
			]),
		).toThrow(/teto de 200 entradas/);
	});
});

describe('adversarial: consumidor nos limites em tempo real', () => {
	it('pipeline completo no teto de 200 entradas em tempo interativo', async () => {
		const real = artifactPayload().entries;
		const fill = Array.from({ length: SEARCH_INDEX_MAX_ENTRIES - real.length }, (_unused, index) => ({
			url: `/primeiros-passos/limite-${index}/`,
			title: `Artigo de limite ${index} do índice`,
			description: 'Descrição sintética da sonda de escala do consumidor.',
			topic: 'primeiros-passos',
			lastReviewed: '2026-09-08',
		}));
		const bytes = JSON.stringify({ version: 1, entries: [...real, ...fill] });

		expect(bytes.length).toBeLessThanOrEqual(SEARCH_INDEX_MAX_BYTES);

		const started = performance.now();
		const entries = await fetchSearchIndex({
			fetchImpl: (async () => ({ ok: true, status: 200, text: async () => bytes })) as unknown as typeof fetch,
		});

		expect(entries).toHaveLength(SEARCH_INDEX_MAX_ENTRIES);
		expect(filterSearchEntries(entries, 'artigo')).toHaveLength(SEARCH_RESULTS_LIMIT);

		for (const hostile of [
			'a'.repeat(10_000),
			Array.from({ length: 40 }, (_unused, index) => `token${index}`).join(' '),
			'\u0301\u0302\u0303',
			'ç ção PUBLICAÇÃO',
		]) {
			expect(Array.isArray(filterSearchEntries(entries, hostile))).toBe(true);
		}

		// Sonda de ausência de retrocesso quadrático (busca literal, sem regex),
		// não gate de performance: a bateria inteira no teto de escala precisa
		// ficar longe de um segundo.
		expect(performance.now() - started).toBeLessThan(1_000);
	});
});
