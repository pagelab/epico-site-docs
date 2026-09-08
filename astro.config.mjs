// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import { topicGroups } from './src/lib/topics.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.epico.site/',
	output: 'static',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'Tutoriais Épico Site',
			description: 'Guias públicos para configurar, editar e publicar seu site.',
			locales: {
				root: { label: 'Português', lang: 'pt-BR' },
			},
			social: [
				{
					icon: 'external',
					label: 'Área de clientes',
					href: 'https://app.epico.site/painel',
				},
			],
			plugins: [
				starlightLlmsTxt({
					projectName: 'Épico Site',
					description: 'Tutoriais públicos para configurar, editar e publicar sites Épico Site.',
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
