import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);

const FONT_SHA: Record<string, string> = {
	'CalSans-SemiBold.woff2': '099beb6bb141bbde40ca0bd7141c327b68967d86d48a0d4e88ea709e943411c8',
	'Outfit-Variable.woff2': 'a8a1fe406bb4b86b02bf3165fa4c2774b706aee8d08204036abe7da02eff719f',
	'OFL-CalSans.txt': '05a6691e4394bf5791fdf81bf2494f292a1cacf910b166977562579648387019',
	'OFL-Outfit.txt': '8fc6af31312082959cc8297b30e04d94ff457faecc9fb0aeeb8906bf448f20e6',
};

const OUTER_SPACE_SHA = 'd15fd91727da2471e5e428dfdf6c8d2a08e33f95a62e812efee5cbe9b3ab1936';

async function sha256(path: URL): Promise<string> {
	const data = await readFile(path);
	return createHash('sha256').update(data).digest('hex');
}

function stripComments(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('fontes locais', () => {
	it('serve exatamente os dois WOFF2 registrados e as duas licenças OFL', async () => {
		const files = await readdir(new URL('public/fonts/', root));

		expect(files.sort()).toEqual([
			'CalSans-SemiBold.woff2',
			'OFL-CalSans.txt',
			'OFL-Outfit.txt',
			'Outfit-Variable.woff2',
		]);
	});

	it('bate os SHA-256 do registro de proveniência, byte a byte', async () => {
		const registry = await readFile(new URL('docs/fonts.md', root), 'utf8');

		for (const [name, expected] of Object.entries(FONT_SHA)) {
			expect(await sha256(new URL(`public/fonts/${name}`, root))).toBe(expected);
			// O registro é a autoridade: o hash também precisa estar escrito nele.
			expect(registry).toContain(expected);
			expect(registry).toContain(`\`${name}\``);
		}
	});

	it('declara duas @font-face locais com swap, sem provedor externo', async () => {
		const css = stripComments(await readFile(new URL('src/styles/fonts.css', root), 'utf8'));

		const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
		expect(faces).toHaveLength(2);

		expect(faces.join('\n')).toContain("font-family: 'Cal Sans'");
		expect(faces.join('\n')).toContain('font-weight: 600');
		expect(faces.join('\n')).toContain("font-family: 'Outfit'");
		expect(faces.join('\n')).toContain('font-weight: 100 900');

		for (const face of faces) {
			expect(face).toMatch(/src:\s*url\('\/fonts\/[A-Za-z-]+\.woff2'\) format\('woff2'\)/);
			expect(face).toContain('font-display: swap');
			expect(face).not.toMatch(/https?:|\/\//);
		}
	});
});

describe('tema e refinamentos autorizados pelo primeiro passe visual', () => {
	it('define as paletas dark e light nos seletores espelhados do Starlight', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		// O dark é o padrão em :root (com ::backdrop) e o claro sobrescreve
		// com [data-theme='light'], exatamente como o props.css do vendor.
		expect(css).toMatch(/:root,\s*\n\s*::backdrop\s*\{/);
		expect(css).toMatch(/:root\[data-theme='light'\],\s*\n\s*\[data-theme='light'\] ::backdrop\s*\{/);

		expect(css).toContain('--sl-text-h1: var(--sl-text-4xl);');
		expect(css).toContain('--sl-text-h2: var(--sl-text-3xl);');
		expect(css).toContain('--sl-text-h3: var(--sl-text-2xl);');
		expect(css).toContain('--sl-text-h4: var(--sl-text-xl);');
		expect(css).not.toContain('--sl-text-1xl');
		expect(css).toContain('--sl-color-gray-6: #d6d7e0;');
		expect(css.match(/--sl-color-hairline-light: var\(--sl-color-gray-5\);/g)).toHaveLength(2);
	});

	it('copia só os tokens Épico necessários e não importa o design system do painel', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		expect(css).toContain('--epico-sidebar-background: #f5f8ff;');
		expect(css.match(/--epico-nav-active-background: var\(--sl-color-black\);/g)).toHaveLength(2);
		expect(css.match(/--epico-nav-active-color: var\(--epico-color-action-primary\);/g)).toHaveLength(2);
		expect(css).toContain('--epico-color-action-primary: #3253e8;');
		expect(css).toContain('--epico-color-nav-hover-surface: #eef2ff;');
		expect(css).toContain('--epico-scrollbar-thumb: #e8eefb;');
		expect(css).toContain('--epico-duration-slow: 240ms;');
		expect(css).toContain('--epico-ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);');
		expect(css).toContain('--epico-sidebar-background: #12151c;');
		expect(css).toContain('--epico-color-action-primary: #8098f6;');
		expect(css).toContain('--epico-scrollbar-thumb: #2c3240;');
		expect(css).toContain('--epico-header-brand-strip-width: 5px;');
		expect(css).toContain('--epico-brand-logo-max-width: 165px;');
		expect(css).toContain('--epico-brand-logo-wordmark: #ffffff;');
		expect(css).toContain('--epico-brand-logo-mark: #ffffff;');
		expect(css).toContain('--epico-brand-logo-wordmark: #3d4b51;');
		expect(css).toContain('--epico-brand-logo-mark: #2135dd;');
		expect(css).not.toContain('--epico-summary-card-background');
		expect(css).not.toContain('--epico-summary-card-border');
		expect(css).toContain('--epico-summary-card-icon-background: #141d3d;');
		expect(css).toContain('--epico-summary-card-icon-background: #dde5ff;');
		expect(css).toContain('--epico-space-overlay-blend-mode: screen;');
		expect(css).toContain('--epico-space-overlay-blend-mode: color;');
		expect(css).toContain('--epico-space-overlay-opacity: 0.7;');
		expect(css).toContain('--epico-space-overlay-opacity: 1;');
		expect(css).toMatch(/:root\[data-theme='light'\][\s\S]*--epico-sidebar-background: #f5f8ff;/);

		expect(css).not.toContain('@import');
		expect(css).not.toMatch(/https?:|\/\//);
		expect(css.match(/url\('\.\.\/assets\/outer-space\.webp'\)/g)).toHaveLength(1);
		expect(css).not.toContain('tokens.css');
		expect(css).not.toContain('filter:');
	});

	it('usa o fundo espacial local com máscaras e resposta ao tema', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		expect(await sha256(new URL('src/assets/outer-space.webp', root))).toBe(OUTER_SPACE_SHA);
		expect(css).toMatch(/body:has\(\.hero\)::after\s*{[^}]*position: absolute[^}]*height: 40em[^}]*mix-blend-mode: var\(--epico-space-overlay-blend-mode\)[^}]*opacity: var\(--epico-space-overlay-opacity\)[^}]*z-index: -1/s);
		expect(css).toMatch(/body\s*{[^}]*position: relative[^}]*}/s);
		expect(css).not.toContain('isolation: isolate');
		expect(css).toMatch(/body:has\(\.hero\)::after\s*{[^}]*bottom: 0[^}]*mask-image: var\(--epico-space-mask-bottom\)/s);
		expect(css).toMatch(/@media \(min-width: 769px\)\s*{[\s\S]*?body:has\(\.hero\)::after\s*{[^}]*background-image: url\('\.\.\/assets\/outer-space\.webp'\)/s);
		expect(css).not.toContain('body:has(.hero)::before');
	});

	it('mantém os refinamentos pedidos em sidebar, busca, conteúdo e ações', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		expect(css).toMatch(/#starlight__sidebar\s*{[^}]*var\(--epico-sidebar-background\)/s);
		expect(css).toMatch(/#starlight__sidebar\s*{[^}]*scrollbar-color: var\(--epico-scrollbar-thumb\) var\(--epico-scrollbar-track\)/s);
		expect(css).toMatch(/#starlight__sidebar::\-webkit-scrollbar-track\s*{[^}]*background-color: var\(--epico-scrollbar-track\)[^}]*border: 0[^}]*box-shadow: none/s);
		expect(css).toMatch(/#starlight__sidebar::\-webkit-scrollbar-thumb\s*{[^}]*background-color: var\(--epico-scrollbar-thumb\)[^}]*border: 0/s);
		expect(css).toMatch(/\.page > \.header\s*{[^}]*border-top: var\(--epico-header-brand-strip-width\) solid var\(--epico-color-action-primary\)/s);
		expect(css).toMatch(/#starlight__sidebar ul\s*{[^}]*--sl-sidebar-item-padding-inline: 0\.8rem/s);
		expect(css).toMatch(/#starlight__sidebar a\s*{[^}]*padding: 0\.6em;/s);
		expect(css).toMatch(/\[aria-current='page'\][^{]*{[^}]*var\(--epico-nav-active-color\)[^}]*var\(--epico-nav-active-background\)[^}]*border-radius: 5px/s);
		expect(css).toMatch(/starlight-theme-select > label\s*{[^}]*--sl-label-icon-size: 1\.25rem/s);
		expect(css).toMatch(/starlight-theme-select \.icon\s*{[^}]*width: 0\.9em[^}]*height: 0\.9em/s);
		expect(css).toMatch(/starlight-theme-select select\s*{[^}]*width: calc\(var\(--sl-select-width\) \+ var\(--sl-inline-padding\) \* 3\)[^}]*padding-inline: calc\(var\(--sl-label-icon-size\) \+ var\(--sl-inline-padding\) \+ 0\.35rem\)\s*calc\(var\(--sl-caret-size\) \+ var\(--sl-inline-padding\) \+ 0\.35rem\)/s);
		expect(css).toMatch(/site-search dialog\s*{[^}]*var\(--epico-sidebar-background\)[^}]*min-height: 6rem/s);
		expect(css).toMatch(/\.pagefind-ui__form::before\s*{[^}]*width: calc\(25px \* var\(--pagefind-ui-scale\)\)[^}]*height: calc\(25px \* var\(--pagefind-ui-scale\)\)[^}]*top: calc\(21px \* var\(--pagefind-ui-scale\)\)/s);
		expect(css).toMatch(/\.pagefind-ui__button\s*{[^}]*font-size: calc\(22px \* var\(--pagefind-ui-scale\)\)[^}]*height: calc\(60px \* var\(--pagefind-ui-scale\)\)[^}]*var\(--epico-color-action-primary\)[^}]*border-radius: 999px/s);
		expect(css).toMatch(/\.sl-markdown-content p:first-of-type\s*{[^}]*text-align: center/s);
		expect(css).toMatch(/\.sl-markdown-content a:not\(\.sl-link-button\):not\(\.sl-anchor-link\):not\(\.summary-card\)\s*{[^}]*text-decoration: none[^}]*background-image: linear-gradient\(currentColor, currentColor\)[^}]*var\(--epico-duration-slow\) var\(--epico-ease-standard\)/s);
		expect(css).toMatch(/\.sl-link-button\s*{[^}]*--epico-link-button-padding: 0\.4375rem 1\.125rem[^}]*padding: var\(--epico-link-button-padding\)/s);
		expect(css).toMatch(/\.sl-link-button\.not-content\.minimal\s*{[^}]*border-color: var\(--sl-color-gray-3\)[^}]*padding: var\(--epico-link-button-padding\)/s);
		expect(css).toMatch(/@media \(width >= 50rem\)\s*{\s*\.large\s*{[^}]*font-size: var\(--sl-text-sm\)/s);
		expect(css).toMatch(/@media \(width >= 50rem\)\s*{[\s\S]*?\.sl-link-button\s*{[^}]*--epico-link-button-padding: 0\.9375rem 1\.1rem 0\.9375rem 1\.65rem[^}]*padding: var\(--epico-link-button-padding\)/s);
		expect(css).toMatch(/\.summary-grid\s*{[^}]*grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 18rem\), 1fr\)\)[^}]*gap: 1rem/s);
		expect(css).toMatch(/\.summary-card\s*{[^}]*min-height: 9\.5rem[^}]*background: transparent[^}]*border: 1px solid var\(--sl-color-gray-3\)[^}]*border-radius: 0\.75rem/s);
		expect(css).toMatch(/:root\[data-theme='light'\] \.sl-markdown-content \.summary-card,[\s\S]*?border-color: var\(--sl-color-gray-5\)/s);
		expect(css).toMatch(/\.summary-card:hover\s*{[^}]*var\(--epico-color-action-primary\)[^}]*var\(--epico-summary-card-shadow-hover\)[^}]*translateY\(-0\.125rem\)/s);
		expect(css).toMatch(/\.summary-card \.eyebrow\s*{[^}]*font-size: 0\.875rem[^}]*text-transform: uppercase/s);
		expect(css).toMatch(/\.summary-card__footer\s*{[^}]*grid-template-columns: minmax\(0, 1fr\) auto[^}]*align-items: end/s);
		expect(css).toMatch(/\.brand__logo\s*{[^}]*width: auto[^}]*max-width: var\(--epico-brand-logo-max-width\)[^}]*height: auto/s);
		expect(css).toMatch(/\.brand__logo-wordmark\s*{[^}]*fill: var\(--epico-brand-logo-wordmark\)/s);
		expect(css).toMatch(/\.brand__logo-mark\s*{[^}]*fill: var\(--epico-brand-logo-mark\)/s);
	});

	it('usa Outfit no corpo e mantém Cal Sans só nos headings', async () => {
		const css = stripComments(await readFile(new URL('src/styles/theme.css', root), 'utf8'));

		expect(css).toContain("--sl-font: 'Outfit', 'Segoe UI', Helvetica, Arial, sans-serif;");
		expect(css).toMatch(/h1,\s*\nh2,\s*\nh3,\s*\nh4,\s*\nh5,\s*\nh6\s*\{/);
		expect(css).toContain("font-family: 'Cal Sans', var(--sl-font)");
	});
});

describe('orçamento de desempenho da /busca/', () => {
	it('revela o bloco de busca antes da primeira pintura, sem CLS', async () => {
		const page = await readFile(new URL('src/pages/busca.astro', root), 'utf8');

		// O bloco nasce hidden no HTML (degradação sem JavaScript) e um script
		// inline síncrono o revela antes de a seção de áreas ser parseada.
		// A revelação tardia pelo script bundled empurrava as áreas para baixo
		// depois da primeira pintura (CLS 0.07 medido em DOCS-05).
		const fimDoBloco = page.indexOf('</search>');
		const reveal = page.indexOf(
			"document.querySelector('[data-busca]')?.removeAttribute('hidden')",
		);
		const areas = page.indexOf('<section aria-labelledby="busca-areas">');

		expect(page).toContain("document.querySelector('[data-busca]')?.removeAttribute('hidden')");
		expect(fimDoBloco).toBeGreaterThan(-1);
		expect(reveal).toBeGreaterThan(fimDoBloco);
		expect(areas).toBeGreaterThan(reveal);
	});
});

describe('fiação do tema no config', () => {
	it('liga customCss, as fontes e os overrides autorizados do cabeçalho e hero', async () => {
		const config = await readFile(new URL('astro.config.mjs', root), 'utf8');
		const hero = await readFile(new URL('src/components/Hero.astro', root), 'utf8');
		const logo = await readFile(new URL('src/components/SiteTitle.astro', root), 'utf8');
		const socialIcons = await readFile(new URL('src/components/SocialIcons.astro', root), 'utf8');

		expect(config).toContain(
			"customCss: ['/src/styles/fonts.css', '/src/styles/theme.css']",
		);
		expect(config.match(/rel: 'preload'/g)).toHaveLength(2);
		expect(config).toContain("href: '/fonts/Outfit-Variable.woff2'");
		expect(config).toContain("href: '/fonts/CalSans-SemiBold.woff2'");
		expect(config).toContain("as: 'font'");
		expect(config).toContain("crossorigin: 'anonymous'");
		expect(config).toContain("SiteTitle: './src/components/SiteTitle.astro'");
		expect(config).toContain("Hero: './src/components/Hero.astro'");
		expect(config).toContain("SocialIcons: './src/components/SocialIcons.astro'");
		expect(config.match(/components:/g)).toHaveLength(1);
		expect(hero).toContain('width={darkImage.width}');
		expect(hero).toContain('height={darkImage.height}');
		expect(hero).toContain('width: min(100%, 38.0625rem);');
		expect(hero).toContain('grid-template-columns: 6fr 5fr;');
		expect(hero).not.toMatch(/width:\s*400|height:\s*400/);
		expect(hero).not.toContain('virtual:starlight');
		expect(logo).toContain('class="brand__logo"');
		expect(logo).toContain('viewBox="0 0 164 31"');
		expect(logo.match(/<path/g)).toHaveLength(2);
		expect(logo).toContain('class="sr-only"');
		expect(logo).toContain('{siteTitle}');
		expect(socialIcons).toContain('href="https://app.epico.site/painel"');
		expect(socialIcons).toContain('href="https://epico.site"');
		expect(socialIcons).toContain('Área de clientes');
		expect(socialIcons).toContain('Épico Site');
		expect(socialIcons.match(/--sl-icon-size: 1\.2em/g)).toHaveLength(1);
		expect(socialIcons.match(/<svg/g)).toHaveLength(2);
		expect(socialIcons.match(/fill="currentColor"/g)).toHaveLength(2);
		expect(socialIcons).not.toContain('prefers-color-scheme');

		// Os feedbacks do owner autorizaram apenas os seams necessários para os
		// SVGs responderem ao tema e para o hero preservar a imagem inteira.
		expect(config).not.toMatch(/components:\s*{[\s\S]*?(Header|Search|Sidebar):/);
		expect(config).not.toMatch(/import\s+\*\s+as\s+StarlightPage/);
	});

	it('remove o negrito dos quatro tópicos indicados no FAQ', async () => {
		const faq = await readFile(new URL('src/content/docs/perguntas-frequentes/index.md', root), 'utf8');

		for (const start of [
			'O que é headless',
			'Para quem o Épico Site é indicado',
			'Preços, assinatura',
			'O que configuramos, suporte',
		]) {
			expect(faq).not.toContain(`**${start}`);
		}
	});

	it('usa a imagem local na coluna visual do hero', async () => {
		const home = await readFile(new URL('src/content/docs/index.md', root), 'utf8');

		expect(home).toContain('file: ../../assets/hero-image.webp');
		expect(home).toContain('alt: Ilustração de um foguete sobre círculos concêntricos.');
	});

	it('renderiza os dois summary cards pedidos abaixo do texto da home', async () => {
		const home = await readFile(new URL('src/content/docs/index.md', root), 'utf8');
		const paragraph = home.indexOf('edição e suporte.');
		const cards = home.indexOf('<div class="summary-grid"');

		expect(cards).toBeGreaterThan(paragraph);
		expect(home.match(/class="summary-card"/g)).toHaveLength(2);
		expect(home).toContain('href="https://app.epico.site"');
		expect(home).toContain('<span class="eyebrow">Área de clientes</span>');
		expect(home).toContain('Acompanhe o andamento do seu serviço em tempo real.');
		expect(home).toContain('href="https://epico.site"');
		expect(home).toContain('<span class="eyebrow">Épico Site</span>');
		expect(home).toContain('Ainda não é cliente Épico? Adquira um serviço hoje mesmo.');
		expect(home.match(/class="summary-card__footer"/g)).toHaveLength(2);
		expect(home.match(/class="icon"/g)).toHaveLength(2);
	});

	it('coloca o gate de contraste no verify', async () => {
		const packageJson = JSON.parse(
			await readFile(new URL('package.json', root), 'utf8'),
		) as { scripts: Record<string, string> };

		expect(packageJson.scripts.verify).toContain(
			'node scripts/check-theme-contrast.mjs',
		);
	});
});
