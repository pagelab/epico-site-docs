import { describe, expect, it, vi } from 'vitest';
import {
	SEARCH_FETCH_TIMEOUT_MS,
	SEARCH_QUERY_MAX_CHARS,
	SEARCH_RESULTS_LIMIT,
	fetchSearchIndex,
	filterSearchEntries,
	normalizeForSearch,
	tokenizeQuery,
	wordMatch,
} from '../src/lib/search-client.mjs';
import { SEARCH_INDEX_MAX_BYTES } from '../src/lib/search-index.mjs';

function indexEntry(overrides: Record<string, unknown> = {}) {
	return {
		url: '/primeiros-passos/formatos-de-publicacao/',
		title: 'Entenda os formatos de publicação',
		description: 'Como escolher entre página, post e projeto na prática.',
		topic: 'primeiros-passos',
		lastReviewed: '2026-09-08',
		keywords: [] as string[],
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

	it('produz palavras inteiras, sem repetição e limitadas em quantidade', () => {
		expect(tokenizeQuery('  Ola   MUNDO ')).toEqual(['ola', 'mundo']);
		expect(tokenizeQuery('Domínio, domínio; DOMINIO!')).toEqual(['dominio']);
		expect(tokenizeQuery('e-mail/registro.br')).toEqual(['mail', 'registro', 'br']);

		const manyTokens = tokenizeQuery(Array.from({ length: 40 }, (_unused, index) => `t${index}`).join(' '));

		expect(manyTokens).toHaveLength(12);
	});

	it('descarta palavras de ligação em português, inglês e espanhol, com volta quando só há elas', () => {
		expect(tokenizeQuery('um dois três quatro')).toEqual(['dois', 'tres', 'quatro']);
		expect(tokenizeQuery('como eu conecto meu domínio')).toEqual(['conecto', 'dominio']);
		expect(tokenizeQuery('how do I connect my domain')).toEqual(['connect', 'domain']);
		expect(tokenizeQuery('cuánto cuesta mi dominio')).toEqual(['cuanto', 'cuesta', 'dominio']);
		expect(tokenizeQuery('como e onde')).toEqual(['como', 'onde']);
	});

	it('descarta letra solta e lê no máximo o teto de caracteres da consulta', () => {
		expect(tokenizeQuery('a b c')).toEqual([]);
		expect(tokenizeQuery('% * (')).toEqual([]);
		expect(tokenizeQuery(`${'x'.repeat(SEARCH_QUERY_MAX_CHARS - 3)} dns`)).not.toContain('dns');
		expect(tokenizeQuery(`${'x'.repeat(SEARCH_QUERY_MAX_CHARS - 4)} dns`)).toContain('dns');
	});
});

describe('encontro tolerante entre palavras (mesma escada do painel)', () => {
	it.each([
		['dominio', 'dominio', 1],
		['dominios', 'dominio', 0.95],
		['configuracoes', 'configuracao', 0.95],
		['publ', 'publicacao', 0.8],
		['renovar', 'renovacao', 0.7],
		['dominoi', 'dominio', 0.6],
		['licensa', 'licenca', 0.6],
		['mail', 'email', 0.6],
		['site', 'websites', 0.5],
		['contato', 'contas', 0],
		['ab', 'abc', 0],
		['dns', 'nds', 0],
	])('%j contra %j vale %d', (token, word, strength) => {
		expect(wordMatch(token, word)).toBe(strength);
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

	it('tolera plural, palavra pela metade, erro de digitação e palavras de ligação', () => {
		for (const query of ['dominios', 'domin', 'dominoi', 'como eu conecto meu domínio', 'conectar dominio']) {
			expect(filterSearchEntries(corpus, query)[0]?.url, query).toBe('/dominio-e-publicacao/conecte-seu-dominio/');
		}
	});

	it('palavra que nenhum guia tem não esconde a resposta, mas sozinha não acha nada', () => {
		expect(filterSearchEntries(corpus, 'transferir dominio')[0]?.url).toBe(
			'/dominio-e-publicacao/conecte-seu-dominio/',
		);
		expect(filterSearchEntries(corpus, 'zzzzqqqq')).toEqual([]);
	});

	it('palavra comum a todos vale pouco: decide a palavra rara, e a comum com uma desconhecida não lista tudo', () => {
		const common = ['a', 'b', 'c', 'd'].map((letter) =>
			indexEntry({ url: `/primeiros-passos/${letter}/`, title: `Guia ${letter}`, description: 'Ajuste o site.' }),
		);
		const withRare = [...common, indexEntry({ url: '/primeiros-passos/e/', title: 'Guia e', description: 'Ajuste o site e o DNS.' })];

		expect(filterSearchEntries(withRare, 'site dns').map((result) => result.url)).toEqual(['/primeiros-passos/e/']);
		expect(filterSearchEntries(withRare, 'site')).toHaveLength(5);
		expect(filterSearchEntries(withRare, 'site xyzqwk')).toEqual([]);
	});

	it('busca pela área encontra o índice da área sem a palavra no título', () => {
		expect(
			filterSearchEntries(
				[indexEntry({ url: '/perguntas-frequentes/', title: 'Perguntas que clientes fazem', topic: 'perguntas-frequentes' })],
				'frequentes',
			)[0]?.url,
		).toBe('/perguntas-frequentes/');
	});

	it('trata metacaracteres como separadores de palavra, sem regex e sem exceção', () => {
		const dotCorpus = [
			indexEntry({ url: '/editar-seu-site/versoes/', title: 'Versão 1.2.3 do editor', topic: 'editar-seu-site' }),
		];

		expect(filterSearchEntries(dotCorpus, 'versão (editor)*')).toHaveLength(1);
		expect(filterSearchEntries(dotCorpus, '.*')).toHaveLength(0);
		expect(filterSearchEntries(dotCorpus, '[a-z]+')).toHaveLength(0);

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

	it('keywords entram na busca com peso 3, entre título e descrição, sem aparecer no resultado', () => {
		const ranked = [
			indexEntry({ url: '/a/', title: 'Registros DNS', description: 'Outra coisa.', topic: 'dominio-e-publicacao' }),
			indexEntry({ url: '/b/', title: 'Outra coisa', description: 'Fala de DNS.', topic: 'dominio-e-publicacao' }),
			indexEntry({ url: '/c/', title: 'Outra coisa', description: 'Nada aqui.', topic: 'dominio-e-publicacao', keywords: ['DNS'] }),
		];
		const results = filterSearchEntries(ranked, 'dns');

		expect(results.map((result) => result.url)).toEqual(['/a/', '/c/', '/b/']);
		expect(Object.keys(results[1] ?? {})).not.toContain('keywords');
		expect(JSON.stringify(results)).not.toContain('"keywords"');
	});

	it('termo do vocabulário acha o guia sozinho e combinado com o título', () => {
		const vocab = [
			indexEntry({ url: '/a/', title: 'Conecte seu domínio', keywords: ['nameserver', 'registro.br'] }),
			indexEntry({ url: '/b/', title: 'Outra coisa', keywords: [] }),
		];

		expect(filterSearchEntries(vocab, 'nameservers').map((result) => result.url)).toEqual(['/a/']);
		expect(filterSearchEntries(vocab, 'nameserver dominio').map((result) => result.url)).toEqual(['/a/']);
		expect(filterSearchEntries(vocab, 'godaddy')).toEqual([]);
	});

	it('título que cobre todas as palavras ganha o bônus e passa à frente de encontro mais forte fora do título', () => {
		const bonus = [
			indexEntry({ url: '/a/', title: 'Dominio bakcup', description: 'Nada.', keywords: [] }),
			indexEntry({ url: '/b/', title: 'Dominio', description: 'Nada.', keywords: ['backup'] }),
		];

		expect(filterSearchEntries(bonus, 'dominio backup').map((result) => result.url)).toEqual(['/a/', '/b/']);
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
			fetchImpl: (async () => responseOf(JSON.stringify({ version: 2, entries: corpus }))) as unknown as typeof fetch,
		});

		expect(entries).toHaveLength(3);
	});

	it('descarta entradas hostis no caminho do fetch e mantém as válidas', async () => {
		const entries = await fetchSearchIndex({
			fetchImpl: (async () =>
				responseOf(
					JSON.stringify({
						version: 2,
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
				fetchImpl: (async () => responseOf(JSON.stringify({ version: 2, entries: [corpus[0]] }))) as unknown as typeof fetch,
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
		const body = JSON.stringify({ version: 2, entries: [corpus[0]] });

		for (const declared of [String(body.length), 'banana', null]) {
			const entries = await fetchSearchIndex({
				fetchImpl: (async () =>
					responseOf(body, true, 200, { 'Content-Length': String(declared) })) as unknown as typeof fetch,
			});

			expect(entries).toHaveLength(1);
		}
	});
});
