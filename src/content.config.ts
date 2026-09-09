import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import { topics } from './lib/topics.mjs';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
			schema: docsSchema({
				// `topic`, `draft` e `lastReviewed` são exigência EDITORIAL do acervo,
				// coberta pelo lint de conteúdo e pelo gerador do índice (que rejeitam
				// ausência ou valor inválido). O schema apenas tipa: o StarlightPage
				// valida páginas fora da coleção (como `/busca/` e o futuro 404) com
				// este mesmo schema, e páginas utilitárias não têm área nem revisão.
				extend: z.object({
					title: z.string().trim().min(1),
					description: z.string().trim().min(1),
					topic: z.enum(topics).optional(),
					draft: z.boolean().optional(),
					lastReviewed: z.coerce.date().optional(),
				}),
			}),
		}),
	// A UI pt-BR já vem traduída no pacote Starlight. A coleção existe para
	// materializar o ponto de override documentado (`src/content/i18n/`).
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
