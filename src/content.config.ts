import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import { topics } from './lib/topics.mjs';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				title: z.string().trim().min(1),
				description: z.string().trim().min(1),
				topic: z.enum(topics),
				draft: z.boolean(),
				lastReviewed: z.coerce.date(),
			}),
		}),
	}),
};
