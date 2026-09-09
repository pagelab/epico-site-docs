import { describe, expect, it } from 'vitest';
import { lintSource } from '../scripts/lint-content.mjs';

const baseFrontmatter = {
	title: 'Guia de teste',
	description: 'Descrição usada pelas sondas de política de conteúdo.',
	topic: 'primeiros-passos',
	draft: 'false',
	lastReviewed: '2026-09-07',
};

function frontmatterWith(overrides: Record<string, string> = {}): string {
	const merged = { ...baseFrontmatter, ...overrides };
	const lines = ['---', ...Object.entries(merged).map(([key, value]) => `${key}: ${value}`), '---', ''];
	return lines.join('\n');
}

function page(body: string, frontmatter = frontmatterWith()): string {
	return `${frontmatter}${body}\n`;
}

function violationsFor(body: string, frontmatter?: string): string[] {
	return lintSource('index.md', page(body, frontmatter));
}

describe('barreiras anti-XSS no corpo', () => {
	it('proíbe tag <script> fora de cerca de código', () => {
		const violations = violationsFor('<script>alert(1)</script>');

		expect(violations).toEqual([expect.stringContaining('tag <script> não permitida no corpo')]);
	});

	it('permite <script> dentro de cerca de código', () => {
		expect(violationsFor('```html\n<script>alert(1)</script>\n```')).toEqual([]);
	});

	it('permite <script> em exemplo com cercas aninhadas', () => {
		const nestedExample = '````markdown\n```html\n<script>alert(1)</script>\n```\n````';

		expect(violationsFor(nestedExample)).toEqual([]);
	});

	it('proíbe manipulador de evento inline', () => {
		const violations = violationsFor('<img src="logo.png" onerror="alert(1)">');

		expect(violations).toEqual([expect.stringContaining('manipulador de evento inline')]);
	});

	it('proíbe link markdown com esquema javascript:', () => {
		const violations = violationsFor('[clique aqui](javascript:alert(1))');

		expect(violations).toEqual([expect.stringContaining('link com esquema javascript:')]);
	});

	it('proíbe atributo href com esquema javascript: em HTML bruto', () => {
		const violations = violationsFor('<a href="javascript:alert(1)">clique</a>');

		expect(violations).toEqual([expect.stringContaining('atributo href ou src com esquema perigoso')]);
	});

	it('proíbe atributo src com data:text/html', () => {
		const violations = violationsFor('<a href="data:text/html,<b>x</b>">clique</a>');

		expect(violations).toEqual([expect.stringContaining('atributo href ou src com esquema perigoso')]);
	});

	it('proíbe tag HTML bruta que injeta conteúdo remoto', () => {
		for (const tag of ['iframe', 'object', 'embed', 'form']) {
			const violations = violationsFor(`<${tag} src="https://exemplo.example/"></${tag}>`);

			expect(violations).toEqual([expect.stringContaining(`tag HTML bruta <${tag}>`)]);
		}
	});

	it('proíbe cerca de código não fechada até o fim do arquivo', () => {
		const violations = violationsFor('```js\nconst exemplo = 1');

		expect(violations).toEqual([expect.stringContaining('cerca de código não fechada')]);
	});
});

describe('segredos e dados privados', () => {
	it('proíbe bloco de chave privada', () => {
		const violations = violationsFor('-----BEGIN RSA PRIVATE KEY-----\nconteudo\n-----END RSA PRIVATE KEY-----');

		expect(violations).toEqual([expect.stringContaining('chave privada')]);
	});

	it('proíbe URL assinada', () => {
		const violations = violationsFor('Baixe em https://exemplo.example/arquivo?X-Amz-Signature=abcdefgh1234');

		expect(violations).toEqual([expect.stringContaining('URL assinada')]);
	});

	it('proíbe credencial em texto corrido', () => {
		const violations = violationsFor('Guarde a api_key: "abcd1234efgh5678" em local seguro');

		expect(violations).toEqual([expect.stringContaining('credencial')]);
	});

	it('proíbe e-mail público fora da allowlist de exemplos', () => {
		const violations = violationsFor('Escreva para suporte@epico.example.com quando precisar');

		expect(violations).toEqual([expect.stringContaining('e-mail público não aprovado')]);
	});

	it('permite e-mail de exemplo reservado', () => {
		expect(violationsFor('Use cliente@example.com nos testes')).toEqual([]);
	});
});

describe('modelo de conteúdo', () => {
	it('proíbe slug não canônico no caminho', () => {
		const violations = lintSource('primeiros-passos/Editar_Site.md', page('Texto comum'));

		expect(violations).toEqual([expect.stringContaining('slug não canônico: Editar_Site')]);
	});

	it('proíbe topic fora da allowlist', () => {
		const violations = violationsFor('Texto', frontmatterWith({ topic: 'assunto-inventado' }));

		expect(violations).toEqual([expect.stringContaining('topic fora da allowlist')]);
	});

	it('proíbe topic divergente do diretório', () => {
		const violations = lintSource('editar-seu-site/index.md', page('Texto comum'));

		expect(violations).toEqual([expect.stringContaining('topic não corresponde ao diretório')]);
	});

	it('exige draft booleano', () => {
		const violations = violationsFor('Texto', frontmatterWith({ draft: 'talvez' }));

		expect(violations).toEqual([expect.stringContaining('draft deve ser true ou false')]);
	});

	it('proíbe rascunho no acervo público, mas aceita draft false', () => {
		const violations = violationsFor('Texto', frontmatterWith({ draft: 'true' }));

		expect(violations).toEqual([
			expect.stringContaining('draft: true não pode entrar no acervo público'),
		]);

		expect(violationsFor('Texto')).toEqual([]);
	});

	it('rejeita data impossível em lastReviewed', () => {
		const violations = violationsFor('Texto', frontmatterWith({ lastReviewed: '2026-02-30' }));

		expect(violations).toEqual([expect.stringContaining('lastReviewed deve ser uma data YYYY-MM-DD')]);
	});

	it('proíbe slug no frontmatter', () => {
		const violations = violationsFor('Texto', frontmatterWith({ slug: 'endereco-custom' }));

		expect(violations).toEqual([expect.stringContaining('slug em frontmatter é proibido')]);
	});

	it('proíbe travessão longo no título e no corpo', () => {
		const titleViolations = violationsFor('Texto', frontmatterWith({ title: 'Título — com travessão' }));

		expect(titleViolations).toEqual([expect.stringContaining('title viola a pontuação editorial')]);

		const bodyViolations = violationsFor('Espere um momento — e continue');

		expect(bodyViolations).toEqual([expect.stringContaining('travessão longo não permitido')]);
	});

	it('proíbe ponto e vírgula no corpo', () => {
		const violations = violationsFor('Uma coisa, outra coisa, e mais uma');

		expect(violations).toEqual([]);

		const withSemicolon = violationsFor('Uma coisa, outra coisa, e mais uma;');

		expect(withSemicolon).toEqual([expect.stringContaining('ponto e vírgula não permitido')]);
	});

	it('exige frontmatter delimitado no início do arquivo', () => {
		const violations = lintSource('index.md', 'apenas texto corrido\n');

		expect(violations).toEqual([expect.stringContaining('frontmatter ausente ou inválido')]);
	});

	it('exige todas as chaves obrigatórias', () => {
		const violations = lintSource(
			'index.md',
			['---', `title: ${baseFrontmatter.title}`, '---', 'Texto'].join('\n'),
		);

		for (const key of ['description', 'topic', 'draft', 'lastReviewed']) {
			expect(violations).toContain(`index.md: frontmatter obrigatório ausente: ${key}`);
		}
	});

	it('aceita página válida sem nenhuma violação', () => {
		const body = 'Texto normal com [link](https://epico.site/) e `código inline`.';

		expect(violationsFor(body)).toEqual([]);
	});
});

describe('página utilitária 404', () => {
	it('exige apenas título e descrição, sem os campos editoriais', () => {
		const source = ['---', 'title: Página não encontrada', 'description: Descrição do 404.', '---', '', 'Corpo com [busca](/busca/).', ''].join('\n');

		expect(lintSource('404.md', source)).toEqual([]);
	});

	it('não pode ser rascunho: o Starlight filtraria o 404 custom em silêncio', () => {
		const source = ['---', 'title: Página não encontrada', 'description: Descrição do 404.', 'draft: true', '---', '', 'Corpo.', ''].join('\n');

		expect(lintSource('404.md', source)).toContain('404.md: página utilitária não pode ser rascunho');
	});

	it('exige título e descrição como qualquer página', () => {
		const source = ['---', 'title: Página não encontrada', '---', '', 'Corpo.', ''].join('\n');

		expect(lintSource('404.md', source)).toContain('404.md: frontmatter obrigatório ausente: description');
	});

	it('valida campos editoriais quando presentes', () => {
		const source = ['---', 'title: Página não encontrada', 'description: Descrição do 404.', 'topic: area-fantasma', 'lastReviewed: 2026-13-01', '---', '', 'Corpo.', ''].join('\n');

		expect(lintSource('404.md', source)).toContain('404.md: topic fora da allowlist: area-fantasma');
		expect(lintSource('404.md', source)).toContain('404.md: lastReviewed deve ser uma data YYYY-MM-DD válida');
	});
});
