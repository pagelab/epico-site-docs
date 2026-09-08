import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
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
};
