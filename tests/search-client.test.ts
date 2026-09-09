import { describe, expect, it, vi } from 'vitest';
import {
	SEARCH_FETCH_TIMEOUT_MS,
	SEARCH_RESULTS_LIMIT,
	fetchSearchIndex,
	filterSearchEntries,
	normalizeForSearch,
	tokenizeQuery,
} from '../src/lib/search-client.mjs';
import { SEARCH_INDEX_MAX_BYTES } from '../src/lib/search-index.mjs';

function indexEntry(overrides: Record<string, unknown> = {}) {
	return {
		url: '/primeiros-passos/formatos-de-publicacao/',
		title: 'Entenda os formatos de publicação',
		description: 'Como escolher entre página, post e projeto na prática.',
		topic: 'primeiros-passos',
		lastReviewed: '2026-09-08',
		...overrides,
	};
}

function responseOf(body: string, ok = true, status = 200, headers?: Record<string, string>) {
	return {
		ok,
		status,
		headers: headers === undefined ? undefined : { get: (name: string) => headers[name.toLowerCase()] ?? null },
		text: async () => body,
	} as unknown as Response;
}

const corpus = [
	indexEntry(),
	indexEntry({
		url: '/licencas-e-downloads/licencas-e-prazos/',
		title: 'Consulte suas licenças e prazos',
		description: 'Acompanhe suporte e atualizações do produto.',
		topic: 'licencas-e-downloads',
	}),
	indexEntry({
		url: '/dominio-e-publicacao/conecte-seu-dominio/',
		title: 'Conecte seu domínio com segurança',
		description: 'Aponte o domínio sem tirar o site do ar.',
		topic: 'dominio-e-publicacao',
	}),
];

describe('normalização e tokens da consulta', () => {
	it('remove acento, minúscula e colapsa espaços', () => {
		expect(normalizeForSearch('  Publicação   do Site ')).toBe('publicacao do site');
	});

	it('produz tokens literais limitados em quantidade', () => {
		expect(tokenizeQuery('  Ola   MUNDO ')).toEqual(['ola', 'mundo']);
		expect(tokenizeQuery('um dois três quatro')).toEqual(['um', 'dois', 'tres', 'quatro']);

		const manyTokens = tokenizeQuery(Array.from({ length: 40 }, (_unused, index) => `t${index}`).join(' '));

		expect(manyTokens).toHaveLength(12);
	});
});

describe('filtro do browser', () => {
	it('busca sem acento acha título com acento e ranqueia título acima de área', () => {
		const results = filterSearchEntries(corpus, 'publicacao');

		expect(results.map((result) => result.url)).toContain('/primeiros-passos/formatos-de-publicacao/');
		expect(results[0]?.url).toBe('/primeiros-passos/formatos-de-publicacao/');
	});

	it('é insensível a caixa', () => {
		expect(filterSearchEntries(corpus, 'LICENÇAS')[0]?.url).toBe('/licencas-e-downloads/licencas-e-prazos/');
	});

	it('exige todos os tokens (AND) em título, descrição ou área', () => {
		expect(filterSearchEntries(corpus, 'dominio site')[0]?.url).toBe(
			'/dominio-e-publicacao/conecte-seu-dominio/',
		);
		expect(filterSearchEntries(corpus, 'dominio inexistente')).toEqual([]);
	});

	it('busca pela área encontra o índice da área sem a palavra no título', () => {
		expect(
			filterSearchEntries(
				[indexEntry({ url: '/perguntas-frequentes/', title: 'Perguntas que clientes fazem', topic: 'perguntas-frequentes' })],
				'frequentes',
			)[0]?.url,
		).toBe('/perguntas-frequentes/');
	});

	it('trata metacaracteres como texto literal, sem regex e sem exceção', () => {
		const dotCorpus = [
			indexEntry({ url: '/editar-seu-site/versoes/', title: 'Versão 1.2.3 do editor', topic: 'editar-seu-site' }),
		];

		expect(filterSearchEntries(dotCorpus, '1.2.3')).toHaveLength(1);
		expect(filterSearchEntries(dotCorpus, '1X2X3')).toHaveLength(0);

		for (const hostile of [
			'(a) [b] {c} d.e f*g h+i j^k l$m n|o p?q r\\s t/u v<w> x=y',
			'***',
			'\\',
			'"aspas" \'simples\'',
			'emoji 🚀 busca',
		]) {
			expect(Array.isArray(filterSearchEntries(corpus, hostile))).toBe(true);
		}
	});

	it('consulta vazia ou de espaços não devolve nada', () => {
		expect(filterSearchEntries(corpus, '')).toEqual([]);
		expect(filterSearchEntries(corpus, '    ')).toEqual([]);
	});

	it('limita a lista ao teto de resultados', () => {
		const many = Array.from({ length: SEARCH_RESULTS_LIMIT + 10 }, (_unused, index) =>
			indexEntry({ url: `/primeiros-passos/artigo-${index}/` }),
		);

		expect(filterSearchEntries(many, 'publicacao')).toHaveLength(SEARCH_RESULTS_LIMIT);
		expect(filterSearchEntries(many, 'publicacao', { limit: 2 })).toHaveLength(2);
	});

	it('é determinístico: mesma consulta e índice produzem a mesma lista', () => {
		const first = JSON.stringify(filterSearchEntries(corpus, 'site'));
		const second = JSON.stringify(filterSearchEntries(corpus, 'site'));

		expect(first).toBe(second);
	});
});

describe('fetch defensivo do índice', () => {
	it('entrega entradas validadas quando o payload cumpre o contrato', async () => {
		const entries = await fetchSearchIndex({
			fetchImpl: (async () => responseOf(JSON.stringify({ version: 1, entries: corpus }))) as unknown as typeof fetch,
		});

		expect(entries).toHaveLength(3);
	});

	it('descarta entradas hostis no caminho do fetch e mantém as válidas', async () => {
		const entries = await fetchSearchIndex({
			fetchImpl: (async () =>
				responseOf(
					JSON.stringify({
						version: 1,
						entries: [corpus[0]!, { ...corpus[1]!, url: 'javascript:alert(1)' }],
					}),
				)) as unknown as typeof fetch,
		});

		expect(entries).toHaveLength(1);
		expect(entries[0]?.url).toBe('/primeiros-passos/formatos-de-publicacao/');
	});

	it('rejeita resposta não ok', async () => {
		await expect(
			fetchSearchIndex({
				fetchImpl: (async () => responseOf('', false, 503)) as unknown as typeof fetch,
			}),
		).rejects.toThrow('search-client: resposta não ok para o índice: 503');
	});

	it.each([404, 500])('rejeita resposta de erro %s', async (status) => {
		await expect(
			fetchSearchIndex({
				fetchImpl: (async () => responseOf('', false, status)) as unknown as typeof fetch,
			}),
		).rejects.toThrow(/search-client: resposta não ok para o índice/);
	});

	it('rejeita corpo que não é JSON', async () => {
		await expect(
			fetchSearchIndex({
				fetchImpl: (async () => responseOf('não sou json {')) as unknown as typeof fetch,
			}),
		).rejects.toThrow('search-client: índice recebido não é JSON válido');
	});

	it('rejeita corpo acima do teto de bytes', async () => {
		await expect(
			fetchSearchIndex({
				fetchImpl: (async () => responseOf('x'.repeat(SEARCH_INDEX_MAX_BYTES + 1))) as unknown as typeof fetch,
			}),
		).rejects.toThrow('search-client: índice recebido acima do teto');
	});

	it('rejeita payload estruturalmente fora do contrato', async () => {
		await expect(
			fetchSearchIndex({
				fetchImpl: (async () => responseOf(JSON.stringify({ version: 9, entries: [] }))) as unknown as typeof fetch,
			}),
		).rejects.toThrow('search-client: índice fora do contrato');
	});

	it.each(['https://exemplo.com/i.json', '//exemplo.com/i.json', 'javascript:alert(1)', 'search-index.json'])(
		'rejeita URL do índice que não é caminho interno sem chamar fetch (%s)',
		async (url) => {
			const fetchImpl = vi.fn();

			await expect(fetchSearchIndex({ url, fetchImpl: fetchImpl as unknown as typeof fetch })).rejects.toThrow(
				'search-client: URL do índice precisa ser um caminho interno',
			);
			expect(fetchImpl).not.toHaveBeenCalled();
		},
	);

	it('traduz falha de rede em erro da busca', async () => {
		await expect(
			fetchSearchIndex({
				fetchImpl: (async () => {
					throw new Error('boom de rede');
				}) as unknown as typeof fetch,
			}),
		).rejects.toThrow('search-client: falha ao buscar o índice: boom de rede');
	});

	it('aborta e degrada quando o índice não responde no prazo', async () => {
		vi.useFakeTimers();

		try {
			const fetchImpl = ((_url: unknown, init?: { signal?: AbortSignal }) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
				})) as unknown as typeof fetch;

			const pending = expect(
				fetchSearchIndex({ fetchImpl, timeoutMs: 250 }),
			).rejects.toThrow('search-client: índice não respondeu em 250 ms');

			vi.advanceTimersByTime(250);
			await pending;
		} finally {
			vi.useRealTimers();
		}
	});

	it('limpa o cronômetro quando o fetch resolve antes do prazo', async () => {
		vi.useFakeTimers();

		try {
			const entries = await fetchSearchIndex({
				fetchImpl: (async () => responseOf(JSON.stringify({ version: 1, entries: [corpus[0]] }))) as unknown as typeof fetch,
				timeoutMs: SEARCH_FETCH_TIMEOUT_MS,
			});

			expect(entries).toHaveLength(1);
			expect(vi.getTimerCount()).toBe(0);
		} finally {
			vi.useRealTimers();
		}
	});

	it('aborta quando o corpo trava depois dos headers (timeout cobre a leitura)', async () => {
		vi.useFakeTimers();

		try {
			// Fiel ao browser: headers chegam, o corpo nunca termina e o abort do
			// sinal faz a leitura pendente rejeitar.
			const fetchImpl = ((_url: unknown, init?: { signal?: AbortSignal }) =>
				Promise.resolve({
					ok: true,
					status: 200,
					text: () =>
						new Promise<string>((_resolve, reject) => {
							init?.signal?.addEventListener('abort', () => reject(new Error('AbortError')));
						}),
				})) as unknown as typeof fetch;

			const pending = expect(
				fetchSearchIndex({ fetchImpl, timeoutMs: 300 }),
			).rejects.toThrow('search-client: índice não respondeu em 300 ms');

			await vi.advanceTimersByTimeAsync(300);
			await pending;
		} finally {
			vi.useRealTimers();
		}
	});

	it('rejeita Content-Length declarado acima do teto sem ler o corpo', async () => {
		let read = false;
		const fetchImpl = (async () => ({
			ok: true,
			status: 200,
			headers: { get: (name: string) => (name === 'Content-Length' ? String(SEARCH_INDEX_MAX_BYTES + 1) : null) },
			text: async () => {
				read = true;
				return '{}';
			},
		})) as unknown as typeof fetch;

		await expect(fetchSearchIndex({ fetchImpl })).rejects.toThrow(
			'search-client: índice recebido acima do teto',
		);
		expect(read).toBe(false);
	});

	it('aceita Content-Length dentro do teto e ignora valor não numérico', async () => {
		const body = JSON.stringify({ version: 1, entries: [corpus[0]] });

		for (const declared of [String(body.length), 'banana', null]) {
			const entries = await fetchSearchIndex({
				fetchImpl: (async () =>
					responseOf(body, true, 200, { 'Content-Length': String(declared) })) as unknown as typeof fetch,
			});

			expect(entries).toHaveLength(1);
		}
	});
});
