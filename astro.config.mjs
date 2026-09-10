// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import { topicGroups } from './src/lib/topics.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://tutoriais.epico.site/',
	output: 'static',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'Tutoriais Épico Site',
			components: {
				Hero: './src/components/Hero.astro',
				SiteTitle: './src/components/SiteTitle.astro',
				SocialIcons: './src/components/SocialIcons.astro',
			},
			description: 'Guias públicos para configurar, editar e publicar seu site.',
			locales: {
				root: { label: 'Português', lang: 'pt-BR' },
			},
			customCss: ['/src/styles/fonts.css', '/src/styles/theme.css'],
			// Preload das duas fontes locais: o LCP é texto e o antecipamento
			// cobre o atraso de descoberta entre CSS e a primeira pintura.
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'preload',
						href: '/fonts/Outfit-Variable.woff2',
						as: 'font',
						type: 'font/woff2',
						crossorigin: 'anonymous',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'preload',
						href: '/fonts/CalSans-SemiBold.woff2',
						as: 'font',
						type: 'font/woff2',
						crossorigin: 'anonymous',
					},
				},
			],
			plugins: [
				starlightLlmsTxt({
					projectName: 'Épico Site',
					description: 'Tutoriais públicos para configurar, editar e publicar sites Épico Site.',
					// Política pública de uso do acervo (decisão do owner em
					// STATE.md §"Decisões confirmadas"): uso livre para busca,
					// citação, grounding e treinamento.
					details:
						'Política de uso: o conteúdo deste acervo é público e de uso livre para busca, citação, grounding e treinamento de modelos de linguagem. Ao citar, aponte o endereço original da página em tutoriais.epico.site.',
					// O 404 é página utilitária, não documentação.
					exclude: ['404'],
				}),
			],
			sidebar: [
				// Os seis grupos vêm de topics.mjs, fonte única das áreas editoriais.
				// O link da /busca/ é utilitário, não é área do acervo.
				...Object.entries(topicGroups).map(([directory, label]) => ({
					label,
					items: [{ autogenerate: { directory } }],
				})),
				{ label: 'Busca', link: '/busca/' },
			],
		}),
	],
});
