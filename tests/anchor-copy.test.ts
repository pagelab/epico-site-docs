/**
 * Regressão da cópia do deep link de títulos (ordem do owner em
 * 2026-09-15). O clique simples no ícone de corrente copia a URL absoluta
 * da seção em vez de apenas navegar. A suíte cobre:
 * - as funções puras importadas do MESMO arquivo servido em produção
 *   (public/scripts/anchor-link-copy.js), incluindo codificação do
 *   fragmento e rejeição de href que não é fragmento;
 * - o contrato de publicação: o script é estático em public/, é carregado
 *   pelo head público do Starlight como módulo (autorizado pela CSP por
 *   'self', sem hash novo no _headers) e chega ao dist construído;
 * - as barreiras do repositório: sem innerHTML/eval no código de cliente e
 *   feedback visual apenas com o par de tokens já medido pelo gate de
 *   contraste.
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { buildHeadingUrl, isCopyActivation } from '../public/scripts/anchor-link-copy.js';

const root = new URL('../', import.meta.url);
const SITE = 'https://tutoriais.epico.site/';
const SCRIPT_PATH = '/scripts/anchor-link-copy.js';

describe('isCopyActivation', () => {
	it('aceita clique primário simples e ativação por teclado (button 0)', () => {
		expect(isCopyActivation({ button: 0 })).toBe(true);
	});

	it('recusa botões do meio e da direita', () => {
		expect(isCopyActivation({ button: 1 })).toBe(false);
		expect(isCopyActivation({ button: 2 })).toBe(false);
	});

	it('recusa qualquer modificador para preservar o comportamento nativo', () => {
		for (const modifier of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const) {
			expect(isCopyActivation({ button: 0, [modifier]: true })).toBe(false);
		}
	});
});

describe('buildHeadingUrl', () => {
	it('produce a URL absoluta com o fragmento percentual-codado', () => {
		expect(
			buildHeadingUrl(
				'#endereço-público-do-site',
				`${SITE}painel-epico-site/publicacao-do-site/`,
			),
		).toBe(`${SITE}painel-epico-site/publicacao-do-site/#endere%C3%A7o-p%C3%BAblico-do-site`);
	});

	it('rejeita href que não é fragmento de página', () => {
		const base = `${SITE}dominio-e-publicacao/conecte-seu-dominio/`;

		// Uma âncora hostil para URL externa não pode virar deep link copiado.
		expect(buildHeadingUrl('https://evil.example/#x', base)).toBeNull();
		expect(buildHeadingUrl('/outra-pagina/', base)).toBeNull();
		expect(buildHeadingUrl('#', base)).toBeNull();
		expect(buildHeadingUrl('', base)).toBeNull();
		expect(buildHeadingUrl(null, base)).toBeNull();
	});

	it('rejeita base inválida sem lançar', () => {
		expect(buildHeadingUrl('#secao', 'não é url')).toBeNull();
	});
});

describe('contrato do script servido', () => {
	it('existe em public/scripts/ e é carregado pelo head público como módulo', async () => {
		const script = await readFile(new URL(`public${SCRIPT_PATH}`, root), 'utf8');
		const config = await readFile(new URL('astro.config.mjs', root), 'utf8');

		expect(config).toContain(`src: '${SCRIPT_PATH}'`);
		expect(config).toContain("type: 'module'");
		expect(script).toContain('setupAnchorCopy');
	});

	it('só escreve no DOM por APIs de texto, sem innerHTML, eval ou fetch', async () => {
		const script = await readFile(new URL(`public${SCRIPT_PATH}`, root), 'utf8');
		const barriers = stripComments(script);

		for (const forbidden of [
			'innerHTML',
			'outerHTML',
			'insertAdjacentHTML',
			'document.write',
			'eval(',
			'fetch(',
			'XMLHttpRequest',
			'http://',
			'https://',
		]) {
			expect(barriers).not.toContain(forbidden);
		}

		// O comportamento central precisa estar presente nos bytes servidos.
		expect(barriers).toContain('event.preventDefault()');
		expect(barriers).toContain('navigator.clipboard');
		expect(barriers).toContain("execCommand('copy')");
	});

	it('estiliza o estado copiado com o par de botão já medido pelo gate de contraste', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		expect(css).toContain('.sl-anchor-link[data-copied] .sl-anchor-icon > svg');
		expect(css).toMatch(/--epico-anchor-check-mask:\s*url\("data:image\/svg\+xml/);

		const tooltip = css.slice(css.indexOf("[data-copied]::before"));
		expect(tooltip).toContain('background-color: var(--sl-color-bg-accent)');
		expect(tooltip).toContain('color: var(--sl-color-text-invert)');
	});

	it('rotula a âncora como cópia no dicionário local do Starlight', async () => {
		// O arquivo casa com o lang BCP-47 do locale raiz ('pt-BR'), exigência
		// do lookup do createTranslationSystem do vendor: pt-br.json não aplica.
		const dictionary = JSON.parse(
			await readFile(new URL('src/content/i18n/pt-BR.json', root), 'utf8'),
		);

		expect(dictionary['heading.anchorLabel']).toContain('Copiar link');
		expect(dictionary['heading.anchorLabel']).toContain('{{title}}');
	});
});

describe.skipIf(!existsSync(new URL('dist/index.html', root)))('artefato construído', () => {
	it('todas as páginas do dist carregam o script', async () => {
		const pages = await walkHtmlFiles(new URL('dist/', root));

		expect(pages.length).toBeGreaterThan(0);

		for (const page of pages) {
			const html = await readFile(page, 'utf8');
			expect(html, page.pathname).toContain(`src="${SCRIPT_PATH}"`);
		}
	});
});

function stripComments(source: string): string {
	return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

async function walkHtmlFiles(directory: URL): Promise<URL[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files: URL[] = [];

	for (const entry of entries) {
		if (entry.isDirectory()) {
			files.push(...(await walkHtmlFiles(new URL(`${entry.name}/`, directory))));
		} else if (entry.name.endsWith('.html')) {
			files.push(new URL(entry.name, directory));
		}
	}

	return files.sort((a, b) => a.pathname.localeCompare(b.pathname));
}
