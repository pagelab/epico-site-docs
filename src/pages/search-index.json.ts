import { getCollection, type CollectionEntry } from 'astro:content';
import {
	generateSearchIndex,
	serializeSearchIndex,
} from '../lib/search-index.mjs';

export const prerender = true;

/**
 * Endpoint estático do índice público de busca. Roda no build: qualquer
 * violação do gerador (rascunho, slug duplicado, URL externa, campo vazio,
 * teto de quantidade ou bytes) falha o `astro build`.
 */
export async function GET(): Promise<Response> {
	const docs = await getCollection('docs');
	const payload = generateSearchIndex(docs.map(toIndexEntry));

	return new Response(serializeSearchIndex(payload), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
}

function toIndexEntry(entry: CollectionEntry<'docs'>) {
	return {
		slug: entry.id,
		title: entry.data.title,
		description: entry.data.description,
		topic: entry.data.topic,
		draft: entry.data.draft === true,
		lastReviewed: entry.data.lastReviewed.toISOString().slice(0, 10),
	};
}
