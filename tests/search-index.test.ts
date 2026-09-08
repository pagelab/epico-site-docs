import { describe, expect, it } from 'vitest';
import {
	SEARCH_INDEX_MAX_BYTES,
	SEARCH_INDEX_MAX_ENTRIES,
	generateSearchIndex,
	serializeSearchIndex,
	slugToUrl,
} from '../src/lib/search-index.mjs';

function entry(overrides: Record<string, unknown> = {}) {
	return {
		slug: 'primeiros-passos/formatos-de-publicacao',
		title: 'Entenda os formatos de publicação',
		description: 'Descrição usada pelas sondas do índice de busca.',
		topic: 'primeiros-passos',
		draft: false,
		lastReviewed: '2026-09-08',
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

		expect(payload.version).toBe(1);
		expect(payload.entries.map((item) => item.url)).toEqual([
			'/',
			'/editar-seu-site/edicao-e-personalizacao/',
			'/primeiros-passos/',
			'/primeiros-passos/formatos-de-publicacao/',
		]);

		for (const item of payload.entries) {
			expect(Object.keys(item)).toEqual(['url', 'title', 'description', 'topic', 'lastReviewed']);
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

	it('rejeita topic fora da allowlist das seis áreas', () => {
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
		const longDescription = 'palavra '.repeat(Math.ceil(SEARCH_INDEX_MAX_BYTES / 4));
		const payload = generateSearchIndex([entry({ description: longDescription })]);

		expect(() => serializeSearchIndex(payload)).toThrow(/índice excede o teto de/);
	});

	it('rejeita entrada que não é lista', () => {
		expect(() => generateSearchIndex(entry() as unknown as Parameters<typeof generateSearchIndex>[0]))
			.toThrow(TypeError);
	});
});
