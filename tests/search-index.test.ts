import { describe, expect, it } from 'vitest';
import {
	SEARCH_INDEX_MAX_ENTRIES,
	SEARCH_INDEX_MAX_FIELD_CHARS,
	SEARCH_INDEX_MAX_KEYWORD_CHARS,
	SEARCH_INDEX_MAX_KEYWORDS,
	SEARCH_INDEX_VERSION,
	generateSearchIndex,
	serializeSearchIndex,
	slugToUrl,
	validateSearchIndexPayload,
} from '../src/lib/search-index.mjs';

function entry(overrides: Record<string, unknown> = {}) {
	return {
		slug: 'primeiros-passos/formatos-de-publicacao',
		title: 'Entenda os formatos de publicação',
		description: 'Descrição usada pelas sondas do índice de busca.',
		topic: 'primeiros-passos',
		draft: false,
		lastReviewed: '2026-09-08',
		keywords: ['formatos', 'headless'],
		...overrides,
	};
}

function violationsOf(inputs: Parameters<typeof generateSearchIndex>[0]): string {
	try {
		generateSearchIndex(inputs);
	} catch (error) {
		return error instanceof Error ? error.message : String(error);
	}

	return '';
}

describe('payload do índice', () => {
	it('gera payload com chaves exatas, ordenado por URL e sem corpo de artigo', () => {
		const payload = generateSearchIndex([
			entry({ slug: 'primeiros-passos/index' }),
			entry(),
			entry({
				slug: 'editar-seu-site/edicao-e-personalizacao',
				title: 'Edição e personalização',
				description: 'Outra descrição.',
				topic: 'editar-seu-site',
			}),
			entry({ slug: 'index', body: 'MARCADOR-DE-CORPO-QUE-NAO-PODE-VIAJAR' }),
		]);

		expect(payload.version).toBe(2);
		expect(payload.entries.map((item) => item.url)).toEqual([
			'/',
			'/editar-seu-site/edicao-e-personalizacao/',
			'/primeiros-passos/',
			'/primeiros-passos/formatos-de-publicacao/',
		]);

		for (const item of payload.entries) {
			expect(Object.keys(item)).toEqual(['url', 'title', 'description', 'topic', 'lastReviewed', 'keywords']);
		}

		const serialized = serializeSearchIndex(payload);

		expect(serialized).not.toContain('MARCADOR-DE-CORPO');
		expect(serialized).not.toContain('body');
		expect(serialized).not.toContain('draft');
	});

	it('é determinístico: mesma entrada produz os mesmos bytes', () => {
		const inputs = [entry(), entry({ slug: 'licencas-e-downloads/index' })];

		expect(serializeSearchIndex(generateSearchIndex(inputs))).toBe(
			serializeSearchIndex(generateSearchIndex(inputs)),
		);
	});
});

describe('slug para URL', () => {
	it.each([
		['', '/'],
		['index', '/'],
		['primeiros-passos/index', '/primeiros-passos/'],
		['primeiros-passos/formatos-de-publicacao', '/primeiros-passos/formatos-de-publicacao/'],
	])('mapeia %j para %j', (slug, url) => {
		expect(slugToUrl(slug)).toBe(url);
	});
});

describe('rascunho falha o índice', () => {
	it.each([
		['draft true', { draft: true }],
		['draft ausente', { draft: undefined }],
		['draft string', { draft: 'false' }],
	])('rejeita %s', (_label, overrides) => {
		expect(violationsOf([entry(overrides)])).toContain('draft precisa ser exatamente false');
	});
});

describe('slug e URL', () => {
	it('rejeita slug duplicado que resolve para a mesma URL', () => {
		const message = violationsOf([
			entry({ slug: 'licencas-e-downloads/baixar-arquivos' }),
			entry({ slug: 'licencas-e-downloads/baixar-arquivos/index' }),
		]);

		expect(message).toContain('slug duplicado no índice');
		expect(message).toContain('/licencas-e-downloads/baixar-arquivos/');
	});

	it('rejeita URL externa, protocolo-relativa e esquema hostil', () => {
		for (const slug of [
			'https://exemplo.com/guia',
			'//exemplo.com/guia',
			'javascript:alert(1)',
			'data:text/html,olá',
		]) {
			expect(violationsOf([entry({ slug })])).toContain('URL externa não é permitida no índice');
		}
	});

	it('rejeita slug fora do formato canônico', () => {
		for (const slug of ['../segredos', 'Area/Artigo', 'com_sublinhado', 'espaco aqui', 'a//b', 'ponto.fim']) {
			const message = violationsOf([entry({ slug })]);

			expect(message).toContain('slug não canônico');
		}
	});
});

describe('campos obrigatórios', () => {
	it('rejeita campos vazios, em branco ou de tipo errado', () => {
		const message = violationsOf([
			entry({ title: '   ', description: '', topic: '', lastReviewed: undefined }),
		]);

		expect(message).toContain('title obrigatório ausente ou vazio');
		expect(message).toContain('description obrigatório ausente ou vazio');
		expect(message).toContain('topic fora da allowlist');
		expect(message).toContain('lastReviewed deve ser uma data YYYY-MM-DD válida');
	});

	it('rejeita topic fora da allowlist das áreas', () => {
		expect(violationsOf([entry({ topic: 'assunto-inventado' })])).toContain(
			'topic fora da allowlist: assunto-inventado',
		);
	});

	it('rejeita lastReviewed malformado, inclusive data impossível', () => {
		for (const lastReviewed of ['08-09-2026', '2026-13-01', '2026-02-30', '2026-9-8', 20260908]) {
			expect(violationsOf([entry({ lastReviewed })])).toContain(
				'lastReviewed deve ser uma data YYYY-MM-DD válida',
			);
		}
	});
});

describe('PII e dados privados nos campos públicos', () => {
	it('rejeita e-mail em title ou description', () => {
		expect(violationsOf([entry({ title: 'Fale com equipe@epico.site hoje' })])).toContain(
			'title contém possível PII (e-mail)',
		);
		expect(violationsOf([entry({ description: 'Escreva para suporte@epico.site' })])).toContain(
			'description contém possível PII (e-mail)',
		);
	});

	it('rejeita caminho local e endereço local', () => {
		expect(violationsOf([entry({ description: 'Veja /Users/mac/secrets/arquivo.md' })])).toContain(
			'description contém possível PII (caminho local)',
		);
		expect(violationsOf([entry({ description: 'Rode em localhost:8890 para testar' })])).toContain(
			'description contém possível PII (endereço local)',
		);
	});
});

describe('tetos do índice', () => {
	it('rejeita acima do teto de entradas', () => {
		const extras = Array.from({ length: SEARCH_INDEX_MAX_ENTRIES }, (_unused, index) =>
			entry({ slug: `primeiros-passos/artigo-${index}` }),
		);
		const message = violationsOf([entry(), ...extras]);

		expect(message).toContain(`índice excede o teto de ${SEARCH_INDEX_MAX_ENTRIES} entradas`);
	});

	it('rejeita serialização acima do teto de bytes', () => {
		// Cada campo respeita o teto por campo, mas o conjunto estoura o teto
		// total de bytes cobrado pelo serializador.
		const big = 'x'.repeat(500);
		const many = Array.from({ length: SEARCH_INDEX_MAX_ENTRIES }, (_unused, index) =>
			entry({
				slug: `primeiros-passos/${'a'.repeat(470)}${String(index).padStart(3, '0')}`,
				title: big,
				description: big,
			}),
		);
		const payload = generateSearchIndex(many);

		expect(() => serializeSearchIndex(payload)).toThrow(/índice excede o teto de/);
	});

	it('rejeita entrada que não é lista', () => {
		expect(() => generateSearchIndex(entry() as unknown as Parameters<typeof generateSearchIndex>[0]))
			.toThrow(TypeError);
	});

	it('rejeita campo de texto acima do teto por campo', () => {
		const message = violationsOf([entry({ title: 'x'.repeat(SEARCH_INDEX_MAX_FIELD_CHARS + 1) })]);

		expect(message).toContain(`title excede o teto de ${SEARCH_INDEX_MAX_FIELD_CHARS} caracteres`);
	});
});

describe('validação do payload consumido', () => {
	function payloadEntry(overrides: Record<string, unknown> = {}) {
		return {
			url: '/primeiros-passos/formatos-de-publicacao/',
			title: 'Entenda os formatos de publicação',
			description: 'Descrição usada pelas sondas do índice de busca.',
			topic: 'primeiros-passos',
			lastReviewed: '2026-09-08',
			keywords: ['formatos', 'headless'],
			...overrides,
		};
	}

	it('aceita payload íntegro, incluindo a URL da raiz', () => {
		const result = validateSearchIndexPayload({
			version: 2,
			entries: [payloadEntry(), payloadEntry({ url: '/' })],
		});

		expect(result).toEqual({ ok: true, entries: [payloadEntry(), payloadEntry({ url: '/' })], discarded: 0 });
	});

	it.each([
		['null', null],
		['lista', [payloadEntry()]],
		['string', 'version 1'],
		['número', 1],
	])('rejeita payload que não é objeto (%s)', (_label, payload) => {
		const result = validateSearchIndexPayload(payload);

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.reason).toContain('não é um objeto');
	});

	it('rejeita chaves fora do contrato no topo do payload', () => {
		const result = validateSearchIndexPayload({ version: 2, entries: [], extra: 'surpresa' });

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.reason).toContain('chaves fora do contrato');
	});

	it('rejeita versão não suportada e entries que não é lista', () => {
		const version = validateSearchIndexPayload({ version: 1, entries: [] });

		expect(version.ok).toBe(false);
		if (!version.ok) expect(version.reason).toContain('version 1 não suportada');

		const entries = validateSearchIndexPayload({ version: 2, entries: 'todas' });

		expect(entries.ok).toBe(false);
		if (!entries.ok) expect(entries.reason).toContain('entries não é uma lista');
	});

	it('rejeita acima do teto de entradas', () => {
		const list = Array.from({ length: SEARCH_INDEX_MAX_ENTRIES + 1 }, (_unused, index) =>
			payloadEntry({ url: `/primeiros-passos/artigo-${index}/` }),
		);
		const result = validateSearchIndexPayload({ version: 2, entries: list });

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.reason).toContain(`teto de ${SEARCH_INDEX_MAX_ENTRIES} entradas`);
	});

	it.each([
		['javascript:', payloadEntry({ url: 'javascript:alert(1)' })],
		['protocolo-relativa', payloadEntry({ url: '//exemplo.com/guia/' })],
		['https', payloadEntry({ url: 'https://exemplo.com/guia/' })],
		['travessia', payloadEntry({ url: '/a/../b/' })],
		['contrabarra', payloadEntry({ url: '/a\\b/' })],
		['sem barra final', payloadEntry({ url: '/primeiros-passos' })],
		['sem barra inicial', payloadEntry({ url: 'primeiros-passos/' })],
		['maiuscula', payloadEntry({ url: '/Area/' })],
		['sublinhado', payloadEntry({ url: '/com_sublinhado/' })],
		['segmento vazio', payloadEntry({ url: '/a//b/' })],
		['url acima do teto de campo', payloadEntry({ url: `/${'a'.repeat(SEARCH_INDEX_MAX_FIELD_CHARS + 1)}/` })],
	])('descarta entrada com URL hostil ou não canônica (%s)', (_label, bad) => {
		const result = validateSearchIndexPayload({ version: 2, entries: [payloadEntry(), bad] });

		expect(result).toMatchObject({ ok: true, discarded: 1 });
		if (result.ok) expect(result.entries).toHaveLength(1);
	});

	it.each([
		['title numérico', payloadEntry({ title: 42 })],
		['description vazia', payloadEntry({ description: '   ' })],
		['title acima do teto', payloadEntry({ title: 'x'.repeat(SEARCH_INDEX_MAX_FIELD_CHARS + 1) })],
		['e-mail no title', payloadEntry({ title: 'Fale com equipe@epico.site' })],
		['caminho local na description', payloadEntry({ description: 'Veja /Users/mac/segredo.md' })],
		['endereço local na description', payloadEntry({ description: 'Rode em localhost:8890' })],
		['topic fora da allowlist', payloadEntry({ topic: 'area-inventada' })],
		['data impossível', payloadEntry({ lastReviewed: '2026-02-30' })],
		['chave extra', { ...payloadEntry(), body: 'MARCADOR-DE-CORPO' }],
		['chave faltando', (({ topic: _topic, ...rest }) => rest)(payloadEntry())],
	])('descarta entrada com campo fora do contrato (%s)', (_label, bad) => {
		const result = validateSearchIndexPayload({ version: 2, entries: [bad, payloadEntry()] });

		expect(result).toMatchObject({ ok: true, discarded: 1 });
		if (result.ok) {
			expect(result.entries).toHaveLength(1);
			expect(JSON.stringify(result.entries[0])).not.toContain('MARCADOR-DE-CORPO');
		}
	});

	it('rejeita o payload inteiro quando nenhuma entrada sobra válida', () => {
		const result = validateSearchIndexPayload({
			version: 2,
			entries: [payloadEntry({ url: '//exemplo.com/' }), payloadEntry({ topic: 'x' })],
		});

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.reason).toContain('todas as 2 entradas');
	});

	it('aceita índice vazio como estado funcional da busca', () => {
		expect(validateSearchIndexPayload({ version: 2, entries: [] })).toEqual({
			ok: true,
			entries: [],
			discarded: 0,
		});
	});
});

describe('keywords no produtor (versão 2, DOCS-16)', () => {
	it('emite a lista na ordem do frontmatter, como cópia, e aceita lista vazia', () => {
		const keywords = ['DNS', 'domínio', 'domain'];
		const payload = generateSearchIndex([entry({ keywords }), entry({ slug: 'primeiros-passos/index', keywords: [] })]);

		expect(SEARCH_INDEX_VERSION).toBe(2);
		expect(payload.entries.find((item) => item.url === '/primeiros-passos/')?.keywords).toEqual([]);

		const emitted = payload.entries.find((item) => item.url === '/primeiros-passos/formatos-de-publicacao/')?.keywords;

		expect(emitted).toEqual(keywords);
		expect(emitted).not.toBe(keywords);
	});

	it.each([
		['ausente', undefined],
		['null', null],
		['string', 'dns, domínio'],
		['objeto', { 0: 'dns', length: 1 }],
	])('rejeita keywords que não é lista (%s)', (_label, keywords) => {
		expect(violationsOf([entry({ keywords })])).toContain('keywords precisa ser uma lista');
	});

	it('teto de termos é inclusivo: 40 passa, 41 falha o build', () => {
		const terms = (count: number) => Array.from({ length: count }, (_unused, index) => `termo ${index}`);

		expect(violationsOf([entry({ keywords: terms(SEARCH_INDEX_MAX_KEYWORDS) })])).toBe('');
		expect(violationsOf([entry({ keywords: terms(SEARCH_INDEX_MAX_KEYWORDS + 1) })])).toContain(
			`keywords excede o teto de ${SEARCH_INDEX_MAX_KEYWORDS} termos: 41`,
		);
	});

	it('teto por termo é inclusivo: 80 caracteres passa, 81 falha o build', () => {
		expect(violationsOf([entry({ keywords: ['x'.repeat(SEARCH_INDEX_MAX_KEYWORD_CHARS)] })])).toBe('');
		expect(violationsOf([entry({ keywords: ['ok', 'x'.repeat(SEARCH_INDEX_MAX_KEYWORD_CHARS + 1)] })])).toContain(
			`keywords[1] excede o teto de ${SEARCH_INDEX_MAX_KEYWORD_CHARS} caracteres: 81`,
		);
	});

	it.each([
		['vazio', ''],
		['só espaços', '   '],
		['número', 42],
		['null', null],
		['lista aninhada', ['dns']],
	])('rejeita termo vazio ou que não é texto (%s)', (_label, term) => {
		expect(violationsOf([entry({ keywords: ['dns', term] })])).toContain('keywords[1] obrigatório ausente ou vazio');
	});

	it('rejeita termo com espaço nas pontas em vez de aparar em silêncio', () => {
		expect(violationsOf([entry({ keywords: [' dns'] })])).toContain('keywords[0] tem espaço nas pontas');
		expect(violationsOf([entry({ keywords: ['dns\u00a0'] })])).toContain('keywords[0] tem espaço nas pontas');
	});

	it.each([
		['NUL', 'dns\u0000'],
		['quebra de linha', 'dns\nfalso'],
		['tab', 'dns\tfalso'],
		['DEL', 'dns\u007f'],
		['C1', 'dns\u0085'],
		['override RTL', '\u202edns'],
		['isolate bidi', 'dns\u2066x\u2069'],
	])('rejeita termo com caractere de controle ou bidi (%s)', (_label, term) => {
		expect(violationsOf([entry({ keywords: [term] })])).toContain(
			'keywords[0] contém caractere de controle ou bidirecional',
		);
	});

	it.each([
		['e-mail', 'fale com suporte@epico.site', 'e-mail'],
		['caminho local', 'veja /Users/mac/notas/', 'caminho local'],
		['localhost', 'localhost:8890', 'endereço local'],
		['loopback', '127.0.0.1', 'endereço local'],
	])('PII em um termo falha o build (%s)', (_label, term, pii) => {
		expect(violationsOf([entry({ keywords: ['dns', term] })])).toContain(`keywords[1] contém possível PII (${pii})`);
	});

	it('termo repetido sem acento e sem caixa falha o build', () => {
		expect(violationsOf([entry({ keywords: ['garantia', 'Garantía'] })])).toContain(
			'keywords repete o termo "Garantía" (igual a "garantia" sem acento e sem caixa)',
		);
		expect(violationsOf([entry({ keywords: ['DNS', 'dns'] })])).toContain('keywords repete o termo "dns"');
	});

	it('a mesma barreira de controle e bidi vale para title e description', () => {
		expect(violationsOf([entry({ title: 'Título\u202e invertido' })])).toContain(
			'title contém caractere de controle ou bidirecional',
		);
		expect(violationsOf([entry({ description: 'Linha\u0000nula' })])).toContain(
			'description contém caractere de controle ou bidirecional',
		);
	});
});

describe('keywords no consumidor (versão 2, DOCS-16)', () => {
	function v2Entry(overrides: Record<string, unknown> = {}) {
		return {
			url: '/dominio-e-publicacao/conecte-seu-dominio/',
			title: 'Conecte seu domínio',
			description: 'Aponte o domínio para o site publicado.',
			topic: 'dominio-e-publicacao',
			lastReviewed: '2026-09-08',
			keywords: ['DNS', 'domain'],
			...overrides,
		};
	}

	it('aceita entrada v2 com lista vazia e com os tetos exatos', () => {
		const atCap = Array.from({ length: SEARCH_INDEX_MAX_KEYWORDS }, (_unused, index) =>
			`${String(index).padStart(2, '0')}${'x'.repeat(SEARCH_INDEX_MAX_KEYWORD_CHARS - 2)}`,
		);
		const result = validateSearchIndexPayload({
			version: 2,
			entries: [v2Entry({ keywords: [] }), v2Entry({ url: '/dominio-e-publicacao/', keywords: atCap })],
		});

		expect(result).toMatchObject({ ok: true, discarded: 0 });
	});

	it.each([
		['sem keywords (entrada da versão 1)', (({ keywords: _keywords, ...rest }) => rest)(v2Entry())],
		['keywords string', v2Entry({ keywords: 'dns' })],
		['keywords array-like', v2Entry({ keywords: { length: 1, 0: 'dns' } })],
		['41 termos', v2Entry({ keywords: Array.from({ length: 41 }, (_unused, index) => `t${index}`) })],
		['termo de 81 caracteres', v2Entry({ keywords: ['x'.repeat(81)] })],
		['termo vazio', v2Entry({ keywords: ['dns', ''] })],
		['termo numérico', v2Entry({ keywords: [7] })],
		['termo com espaço nas pontas', v2Entry({ keywords: ['dns '] })],
		['termo com controle', v2Entry({ keywords: ['dns\u0007'] })],
		['termo com bidi', v2Entry({ keywords: ['\u202edns'] })],
		['e-mail no termo', v2Entry({ keywords: ['equipe@epico.site'] })],
		['caminho local no termo', v2Entry({ keywords: ['/Users/mac/x/'] })],
		['localhost no termo', v2Entry({ keywords: ['localhost'] })],
		['chave extra ao lado de keywords', { ...v2Entry(), tags: ['dns'] }],
	])('descarta a entrada inteira (%s)', (_label, bad) => {
		const result = validateSearchIndexPayload({ version: 2, entries: [bad, v2Entry({ url: '/dominio-e-publicacao/' })] });

		expect(result).toMatchObject({ ok: true, discarded: 1 });
		if (result.ok) expect(result.entries.map((item) => item.url)).toEqual(['/dominio-e-publicacao/']);
	});

	it('versão 1 não se mistura: payload v1 é rejeitado inteiro, mesmo com entradas v2', () => {
		for (const entries of [[v2Entry()], [(({ keywords: _keywords, ...rest }) => rest)(v2Entry())]]) {
			const result = validateSearchIndexPayload({ version: 1, entries });

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.reason).toContain('version 1 não suportada (esperada 2)');
		}
	});

	it('payload v2 só com entradas da versão 1 é rejeitado como comprometido', () => {
		const v1 = (({ keywords: _keywords, ...rest }) => rest)(v2Entry());
		const result = validateSearchIndexPayload({ version: 2, entries: [v1, { ...v1, url: '/dominio-e-publicacao/' }] });

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.reason).toContain('todas as 2 entradas');
	});
});
